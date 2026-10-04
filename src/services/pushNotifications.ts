import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  getMessaging,
  onMessage,
  onTokenRefresh,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';

import { authService } from '../api/authService';
import { deviceService } from '../api/deviceService';
import { notificationService } from '../api/notificationService';
import { store } from '../store';
import { getFcmToken, getRegisteredPushToken, saveRegisteredPushToken } from './pushToken';

export const configureNotifications = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

const ensureAndroidChannel = async () => {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
  });
};

const registerTokenWithBackend = async (token: string) => {
  await deviceService.registerPushToken({
    pushToken: token,
    platform: Platform.OS,
    deviceName: notificationService.getDeviceName(),
    appVersion: Constants.expoConfig?.version,
  });
  await saveRegisteredPushToken(token);
};

// FCM requires a handler registered at module load, before the React tree mounts.
// Notification payloads are displayed by the OS while backgrounded, so nothing to do here.
export const registerBackgroundMessageHandler = () => {
  setBackgroundMessageHandler(getMessaging(), async () => {});
};

// Pre-auth permission prompt used during onboarding — just asks for the OS
// permission, does not register a token with the backend (there's no
// authenticated user yet to attach it to). syncPushNotifications() below
// does the full register-with-backend flow once the driver is signed in.
export const requestNotificationPermissionOnly = async () => {
  await ensureAndroidChannel();
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

// Best-effort supplement for when the app is backgrounded — 4s polling of
// GET /drivers/requests?status=pending remains the primary, guaranteed
// mechanism for delivering incoming requests (see HomeScreen.tsx).
export const syncPushNotifications = async () => {
  try {
    await ensureAndroidChannel();

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let status = existingStatus;
    if (status !== 'granted') {
      const result = await Notifications.requestPermissionsAsync();
      status = result.status;
    }
    if (status !== 'granted') return null;

    const accessToken = store.getState().auth.accessToken;
    if (!accessToken) return null;

    const token = await getFcmToken();

    const registeredToken = await getRegisteredPushToken();
    if (token === registeredToken) return token;

    await registerTokenWithBackend(token);
    return token;
  } catch (error) {
    console.log('Push notification registration skipped:', error);
    return null;
  }
};

export const setupNotificationListeners = () => {
  const messaging = getMessaging();

  const unsubscribeForeground = onMessage(messaging, async (message) => {
    // Android does not show FCM notifications while the app is in the foreground,
    // so present it locally. iOS presents it via the expo-notifications handler.
    if (Platform.OS === 'android' && message.notification) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: message.notification.title,
          body: message.notification.body,
          data: message.data ?? {},
        },
        trigger: null,
      });
    }
  });

  const unsubscribeTokenRefresh = onTokenRefresh(messaging, (token) => {
    if (!store.getState().auth.accessToken) return;
    registerTokenWithBackend(token).catch((error) => {
      console.log('Failed to register refreshed FCM token:', error);
    });
  });

  return () => {
    unsubscribeForeground();
    unsubscribeTokenRefresh();
  };
};

/**
 * Logs this device out on the backend: drops its push token and revokes the
 * session. Best effort — clearing stored auth also deletes the FCM token locally.
 */
export const logoutDevice = async () => {
  const pushToken = await getRegisteredPushToken();
  try {
    await authService.logout({
      pushToken: pushToken ?? undefined,
      refreshToken: store.getState().auth.refreshToken ?? undefined,
    });
  } catch (error) {
    console.log('Backend logout failed:', error);
  }
};
