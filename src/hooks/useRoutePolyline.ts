import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import type { MapCoord } from '../components/maps/mapUtils';

export type RoutePolyline = {
  /** Road-following coordinates for drawing the polyline. */
  coordinates: MapCoord[];
  /** Actual route distance in meters from the routing engine, not a straight line. */
  distanceMeters: number | null;
  /** Actual route duration in seconds from the routing engine. */
  durationSeconds: number | null;
};

const EMPTY_ROUTE: RoutePolyline = { coordinates: [], distanceMeters: null, durationSeconds: null };

export function useRoutePolyline(from: MapCoord | null, to: MapCoord | null): RoutePolyline {
  const [route, setRoute] = useState<RoutePolyline>(EMPTY_ROUTE);

  useEffect(() => {
    if (!from || !to) {
      setRoute(EMPTY_ROUTE);
      return;
    }

    let cancelled = false;

    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const json = await res.json();
        const routeData = json?.routes?.[0];
        const coords: MapCoord[] =
          routeData?.geometry?.coordinates?.map(([lng, lat]: [number, number]) => ({
            latitude: lat,
            longitude: lng,
          })) ?? [];

        if (!cancelled) {
          setRoute({
            coordinates: coords.length ? coords : [from, to],
            distanceMeters: typeof routeData?.distance === 'number' ? routeData.distance : null,
            durationSeconds: typeof routeData?.duration === 'number' ? routeData.duration : null,
          });
        }
      } catch {
        if (!cancelled) setRoute({ coordinates: [from, to], distanceMeters: null, durationSeconds: null });
      }
    };

    fetchRoute();
    return () => {
      cancelled = true;
    };
  }, [from?.latitude, from?.longitude, to?.latitude, to?.longitude]);

  return route;
}

export function useOsmTiles() {
  return Platform.OS === 'android';
}
