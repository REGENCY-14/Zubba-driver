import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

import { authService } from '../api/authService';
import { userService } from '../api/userService';
import { driverService } from '../api/driverService';
import {
  loadStoredAuth,
  clearStoredAuth,
  saveAuthUser,
  saveAuthTokens,
  isSessionValid,
} from './authStorage';
import { store } from '../store';
import { setCredentials, logout } from '../slices/auth/authSlice';
import { submitKyc } from '../slices/driverProfile/driverProfileSlice';
import { isDriverProfileComplete, toKycData } from './driverProfileCompleteness';
import type { User } from '../slices/auth/auth.types';

export type InitialRoute =
  | 'Home'
  | 'Kyc'
  | 'Welcome'
  | 'OnboardLocationAccess'
  | 'OnboardNotificationsAccess';

// The single "is this driver ready for Home" gate: `user.terms_accepted_at`
// only tracks legal terms acceptance, not whether their KYC/vehicle data is
// actually on file, so we fetch the real driver record and check it directly.
// Fails safe — any error fetching the driver record routes to Kyc rather
// than risking an incomplete driver reaching Home.
export async function resolveDriverHomeRoute(user: User): Promise<'Home' | 'Kyc'> {
  try {
    const res = await driverService.getById(user.id);
    if (res.success && isDriverProfileComplete(res.data.driver)) {
      return 'Home';
    }
    if (res.success) {
      store.dispatch(submitKyc(toKycData(res.data.driver)));
    }
    return 'Kyc';
  } catch {
    return 'Kyc';
  }
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
      return resolveDriverHomeRoute(res.data.user);
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
        return resolveDriverHomeRoute(res.data.user);
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
