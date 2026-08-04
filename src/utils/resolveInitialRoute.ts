import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

import { userService } from '../api/userService';
import { loadStoredAuth, clearStoredAuth, saveAuthUser } from './authStorage';
import { store } from '../store';
import { setCredentials, logout } from '../slices/auth/authSlice';

export type InitialRoute =
  | 'Home'
  | 'Kyc'
  | 'Welcome'
  | 'OnboardLocationAccess'
  | 'OnboardNotificationsAccess';

async function resolveAuthenticatedRoute(): Promise<InitialRoute> {
  try {
    const res = await userService.getMe();
    if (res.success) {
      store.dispatch(
        setCredentials({
          user: res.data.user,
          accessToken: store.getState().auth.accessToken!,
          refreshToken: store.getState().auth.refreshToken!,
        }),
      );
      await saveAuthUser(res.data.user);
      return res.data.user.terms_accepted_at ? 'Home' : 'Kyc';
    }
  } catch {
    // Token invalid and refresh (handled transparently by the axios
    // interceptor) also failed — fall through to a clean logged-out state.
  }

  await clearStoredAuth();
  store.dispatch(logout());
  return 'Welcome';
}

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

export async function resolveInitialRoute(): Promise<InitialRoute> {
  const stored = await loadStoredAuth();

  if (stored) {
    // Populate Redux with the stored tokens first so the axios interceptor
    // can attach them (and transparently refresh the access token if it's
    // expired) on the getMe() call below — this is what lets a returning
    // driver skip signing in again.
    store.dispatch(
      setCredentials({
        user: stored.user,
        accessToken: stored.tokens.accessToken,
        refreshToken: stored.tokens.refreshToken,
      }),
    );
    return resolveAuthenticatedRoute();
  }

  return resolveUnauthenticatedRoute();
}
