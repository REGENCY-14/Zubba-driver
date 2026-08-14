import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useSelector } from 'react-redux';
import * as Location from 'expo-location';
import { driverService } from '../api/driverService';
import { setOnline } from '../slices/driverStatus/driverStatusSlice';
import { store, type RootState } from '../store';

/** How often to refresh GPS → backend while the app is in the foreground. */
const LOCATION_HEARTBEAT_MS = 15_000;

async function pushAvailabilityAndLocation() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      await driverService.updateMe({ is_available: true });
      return;
    }
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    await driverService.updateMe({
      is_available: true,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
  } catch {
    // Best-effort — next heartbeat will retry. Still mark available so the
    // driver can receive jobs even if a single GPS fix fails.
    driverService.updateMe({ is_available: true }).catch(() => {});
  }
}

/**
 * Once a driver is authenticated they stay available. This hook:
 * - marks them available + sends GPS on login / app foreground
 * - refreshes `drivers.location` on an interval (customer nearby matching)
 * - does NOT turn them offline while the session is active
 */
export function useDriverPresence() {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!accessToken) {
      store.dispatch(setOnline(false));
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    store.dispatch(setOnline(true));
    pushAvailabilityAndLocation();

    intervalRef.current = setInterval(pushAvailabilityAndLocation, LOCATION_HEARTBEAT_MS);

    const onAppState = (next: AppStateStatus) => {
      if (next === 'active') {
        pushAvailabilityAndLocation();
      }
    };
    const sub = AppState.addEventListener('change', onAppState);

    return () => {
      sub.remove();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [accessToken]);
}
