import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

import { authService } from '../api/authService';
import { userService } from '../api/userService';
import {
  loadStoredAuth,
  clearStoredAuth,
  saveAuthUser,
  saveAuthTokens,
  isSessionValid,
} from './authStorage';
import { store } from '../store';
import { setCredentials, logout } from '../slices/auth/authSlice';

export type InitialRoute =
  | 'Home'
  | 'Kyc'
  | 'Welcome'
  | 'OnboardLocationAccess'
  | 'OnboardNotificationsAccess';

async function resolveUnauthenticatedRoute(): Promise<InitialRoute> {
  const location = await Location.getForegroundPermissionsAsync();
  if (location.status !== 'granted') {
    return 'OnboardLocationAccess';
  }

  const notifications = await Notifications.getPermissionsAsync();
  if (notifications.status !== 'granted') {
    return 'OnboardNotificationsAccess';
  }

  return 'Welcome';
}

async function resolveAuthenticatedRoute(
  stored: NonNullable<Awaited<ReturnType<typeof loadStoredAuth>>>,
): Promise<InitialRoute> {
  const { tokens } = stored;
  let accessToken = tokens.accessToken;

  try {
    const res = await userService.getMe();
    if (res.success) {
      store.dispatch(
        setCredentials({
          user: res.data.user,
          accessToken,
          refreshToken: tokens.refreshToken,
        }),
      );
      await saveAuthUser(res.data.user);
      return res.data.user.terms_accepted_at ? 'Home' : 'Kyc';
    }
  } catch {
    try {
      const refreshed = await authService.refreshToken({
        refreshToken: tokens.refreshToken,
      });
      accessToken = refreshed.data.accessToken;
      await saveAuthTokens({
        accessToken,
        refreshToken: tokens.refreshToken,
        lastAuthenticatedAt: tokens.lastAuthenticatedAt,
      });

      const res = await userService.getMe();
      if (res.success) {
        store.dispatch(
          setCredentials({
            user: res.data.user,
            accessToken,
            refreshToken: tokens.refreshToken,
          }),
        );
        await saveAuthUser(res.data.user);
        return res.data.user.terms_accepted_at ? 'Home' : 'Kyc';
      }
    } catch {
      // Token invalid and refresh also failed — fall through to logged-out state.
    }
  }

  await clearStoredAuth();
  store.dispatch(logout());
  return resolveUnauthenticatedRoute();
}

export async function resolveInitialRoute(): Promise<InitialRoute> {
  const stored = await loadStoredAuth();

  if (stored && isSessionValid(stored.tokens)) {
    store.dispatch(
      setCredentials({
        user: stored.user,
        accessToken: stored.tokens.accessToken,
        refreshToken: stored.tokens.refreshToken,
      }),
    );
    return resolveAuthenticatedRoute(stored);
  }

  if (stored) {
    await clearStoredAuth();
    store.dispatch(logout());
  }

  return resolveUnauthenticatedRoute();
}
