import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthTokens, User } from '../slices/auth/auth.types';

// Manual AsyncStorage persistence, matching the customer app's convention
// (src/utils/authStorage.ts) rather than the unused redux-persist dependency
// (DRIVER_APP_HANDOFF.md §6). Namespaced separately from the customer app's keys.
const TOKENS_KEY = '@zubba_driver_auth_tokens';
const USER_KEY = '@zubba_driver_auth_user';

export async function saveAuthTokens(tokens: AuthTokens) {
  await AsyncStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

export async function saveAuthUser(user: User) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function loadStoredAuth(): Promise<{ tokens: AuthTokens; user: User } | null> {
  const [tokensRaw, userRaw] = await Promise.all([
    AsyncStorage.getItem(TOKENS_KEY),
    AsyncStorage.getItem(USER_KEY),
  ]);
  if (!tokensRaw || !userRaw) return null;
  return { tokens: JSON.parse(tokensRaw), user: JSON.parse(userRaw) };
}

export async function clearStoredAuth() {
  await AsyncStorage.multiRemove([TOKENS_KEY, USER_KEY]);
}
