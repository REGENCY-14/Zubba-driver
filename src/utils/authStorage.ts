import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthTokens, User } from '../slices/auth/auth.types';

// Manual AsyncStorage persistence, matching the customer app's convention
// (src/utils/authStorage.ts) rather than the unused redux-persist dependency
// (DRIVER_APP_HANDOFF.md §6). Namespaced separately from the customer app's keys.
const TOKENS_KEY = '@zubba_driver_auth_tokens';
const USER_KEY = '@zubba_driver_auth_user';

export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface StoredAuthTokens extends AuthTokens {
  lastAuthenticatedAt?: string;
}

export async function saveAuthTokens(
  tokens: AuthTokens & { lastAuthenticatedAt?: string },
) {
  const payload: StoredAuthTokens = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    lastAuthenticatedAt: tokens.lastAuthenticatedAt ?? new Date().toISOString(),
  };
  await AsyncStorage.setItem(TOKENS_KEY, JSON.stringify(payload));
}

export async function saveAuthUser(user: User) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isSessionValid(tokens: StoredAuthTokens | null): boolean {
  if (!tokens?.lastAuthenticatedAt) return false;
  const age = Date.now() - new Date(tokens.lastAuthenticatedAt).getTime();
  return age <= SESSION_MAX_AGE_MS;
}

export async function loadStoredAuth(): Promise<{
  tokens: StoredAuthTokens;
  user: User;
} | null> {
  const [tokensRaw, userRaw] = await Promise.all([
    AsyncStorage.getItem(TOKENS_KEY),
    AsyncStorage.getItem(USER_KEY),
  ]);
  if (!tokensRaw || !userRaw) return null;

  const tokens = JSON.parse(tokensRaw) as StoredAuthTokens;

  if (!tokens.lastAuthenticatedAt) {
    tokens.lastAuthenticatedAt = new Date().toISOString();
    await AsyncStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  }

  return { tokens, user: JSON.parse(userRaw) };
}

export async function clearStoredAuth() {
  await AsyncStorage.multiRemove([TOKENS_KEY, USER_KEY]);
}
