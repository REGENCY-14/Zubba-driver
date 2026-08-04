import { env } from '../../utils/env';

export const MAP_DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
];

const MAPTILER_KEY = env.maptilerKey || '';
const LIGHT_MAPTILER_STYLE = 'streets';
const DARK_MAPTILER_STYLE = 'darkmatter';

export function getMapTileUrl(isDark: boolean) {
  const style = isDark ? DARK_MAPTILER_STYLE : LIGHT_MAPTILER_STYLE;
  return `https://api.maptiler.com/maps/${style}/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`;
}

export type MapCoord = { latitude: number; longitude: number };

export const DEFAULT_MAP_REGION = {
  latitude: 5.6037,
  longitude: -0.187,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const MAP_EDGE_PADDING = {
  top: 100,
  right: 48,
  bottom: 280,
  left: 48,
};

export function regionForCoord(coord: MapCoord, delta = 0.02) {
  return {
    latitude: coord.latitude,
    longitude: coord.longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}

export function regionForCoords(coords: MapCoord[], paddingFactor = 1.8, minDelta = 0.02) {
  if (!coords.length) return DEFAULT_MAP_REGION;
  if (coords.length === 1) return regionForCoord(coords[0]);

  const lats = coords.map((p) => p.latitude);
  const lngs = coords.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(minDelta, (maxLat - minLat) * paddingFactor || minDelta),
    longitudeDelta: Math.max(minDelta, (maxLng - minLng) * paddingFactor || minDelta),
  };
}

export function parseGeoPoint(input: unknown): MapCoord | null {
  if (!input) return null;
  if (typeof input === 'object' && input !== null && 'latitude' in input && 'longitude' in input) {
    const { latitude, longitude } = input as MapCoord;
    if (typeof latitude === 'number' && typeof longitude === 'number') return { latitude, longitude };
  }
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      const coords = parsed.coordinates ?? parsed;
      if (Array.isArray(coords) && coords.length >= 2) {
        return { latitude: coords[1], longitude: coords[0] };
      }
    } catch {
      return null;
    }
  }
  return null;
}

export function interpolateCoord(from: MapCoord, to: MapCoord, progress: number): MapCoord {
  const t = Math.min(1, Math.max(0, progress));
  return {
    latitude: from.latitude + (to.latitude - from.latitude) * t,
    longitude: from.longitude + (to.longitude - from.longitude) * t,
  };
}

function coordDistance(a: MapCoord, b: MapCoord): number {
  // Small-scale planar approximation (good enough for interpolating a
  // marker along an already-fetched route -- no need for full haversine).
  const dLat = b.latitude - a.latitude;
  const dLng = b.longitude - a.longitude;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

/**
 * Places a point along a real route polyline at a given progress fraction
 * (0 = start, 1 = end), walking the actual road-following coordinates
 * instead of a straight line between the endpoints.
 */
export function pointAlongPath(path: MapCoord[], progress: number): MapCoord {
  if (path.length === 0) return { latitude: 0, longitude: 0 };
  if (path.length === 1) return path[0];

  const t = Math.min(1, Math.max(0, progress));
  if (t <= 0) return path[0];
  if (t >= 1) return path[path.length - 1];

  const segmentLengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const len = coordDistance(path[i], path[i + 1]);
    segmentLengths.push(len);
    totalLength += len;
  }
  if (totalLength === 0) return path[0];

  const targetDistance = totalLength * t;
  let covered = 0;
  for (let i = 0; i < segmentLengths.length; i++) {
    const segLen = segmentLengths[i];
    if (covered + segLen >= targetDistance) {
      const segProgress = segLen === 0 ? 0 : (targetDistance - covered) / segLen;
      return interpolateCoord(path[i], path[i + 1], segProgress);
    }
    covered += segLen;
  }
  return path[path.length - 1];
}

export function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatEta(seconds: number) {
  const mins = Math.max(1, Math.ceil(seconds / 60));
  return `${mins} min${mins === 1 ? '' : 's'}`;
}
