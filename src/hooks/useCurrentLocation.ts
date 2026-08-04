import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

export type Coords = {
  latitude: number;
  longitude: number;
};

export type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'error';

interface UseCurrentLocationOptions {
  /** Keep watching for position updates instead of a single fetch. Default: false */
  watch?: boolean;
  /** Minimum distance (meters) between watch updates. Default: 25 */
  distanceIntervalM?: number;
  /** Minimum time (ms) between watch updates. Default: 5000 */
  timeIntervalMs?: number;
}

interface UseCurrentLocationResult {
  coords: Coords | null;
  status: LocationStatus;
  error: string | null;
  /** Re-run permission request + fetch. Useful for a "try again" button. */
  refresh: () => void;
}

// Ported from Zubba's src/hooks/useCurrentLocation.ts — keep in sync.
export function useCurrentLocation(
  options: UseCurrentLocationOptions = {},
): UseCurrentLocationResult {
  const { watch = false, distanceIntervalM = 25, timeIntervalMs = 5000 } = options;

  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      setStatus('requesting');
      setError(null);

      try {
        const { status: permStatus } = await Location.requestForegroundPermissionsAsync();

        if (permStatus !== 'granted') {
          if (!cancelled) {
            setStatus('denied');
            setError('Location permission was not granted');
          }
          return;
        }

        if (!cancelled) setStatus('granted');

        if (watch) {
          subscriptionRef.current = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              distanceInterval: distanceIntervalM,
              timeInterval: timeIntervalMs,
            },
            (position) => {
              if (cancelled) return;
              setCoords({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
          );
        } else {
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (!cancelled) {
            setCoords({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          }
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setError(err instanceof Error ? err.message : 'Failed to get location');
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, [watch, distanceIntervalM, timeIntervalMs, refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  return { coords, status, error, refresh };
}
