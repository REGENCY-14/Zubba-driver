import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { deviceService } from '../api/deviceService';
import { notificationService } from '../api/notificationService';
import { store } from '../store';

const REGISTERED_PUSH_TOKEN_KEY = '@zubba_driver/registeredExpoPushToken';

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

// Pre-auth permission prompt used during onboarding — just asks for the OS
// permission, does not register a token with the backend (there's no
// authenticated user yet to attach it to). syncPushNotifications() below
// does the full register-with-backend flow once the driver is signed in.
export const requestNotificationPermissionOnly = async () => {
  await ensureAndroidChannel();
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

// Best-effort: Zubba-driver's app.json has no EAS projectId configured yet, which
// getExpoPushTokenAsync requires. This silently no-ops until one is added —
// GET /drivers/requests?status=pending polling is the mechanism that actually
// delivers incoming requests today.
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

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) return null;

    const accessToken = store.getState().auth.accessToken;
    if (!accessToken) return null;

    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenResponse.data;

    const registeredToken = await AsyncStorage.getItem(REGISTERED_PUSH_TOKEN_KEY);
    if (token === registeredToken) return token;

    await deviceService.registerPushToken({
      expoPushToken: token,
      platform: Platform.OS,
      deviceName: notificationService.getDeviceName(),
      appVersion: Constants.expoConfig?.version,
    });
    await AsyncStorage.setItem(REGISTERED_PUSH_TOKEN_KEY, token);
    return token;
  } catch (error) {
    console.log('Push notification registration skipped:', error);
    return null;
  }
};
