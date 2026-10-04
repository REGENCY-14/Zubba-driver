import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteToken, getMessaging, getToken } from '@react-native-firebase/messaging';

// Kept free of API imports so auth storage can use it without an import cycle.

const REGISTERED_PUSH_TOKEN_KEY = '@zubba_driver/registeredFcmToken';

export const getFcmToken = () => getToken(getMessaging());

export const getRegisteredPushToken = () => AsyncStorage.getItem(REGISTERED_PUSH_TOKEN_KEY);

export const saveRegisteredPushToken = (token: string) =>
  AsyncStorage.setItem(REGISTERED_PUSH_TOKEN_KEY, token);

/**
 * Invalidates this install's FCM token so pushes for the signed-out driver can no
 * longer reach the device, even if the backend still holds the old token.
 */
export const deleteLocalPushToken = async () => {
  try {
    await deleteToken(getMessaging());
  } catch (error) {
    console.log('Failed to delete FCM token:', error);
  }
  await AsyncStorage.removeItem(REGISTERED_PUSH_TOKEN_KEY);
};
