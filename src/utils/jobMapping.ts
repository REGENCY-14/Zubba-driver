import type { MapCoord } from '../components/maps/mapUtils';
import type { DriverRequestItem, RequestStatus } from '../types/request.types';

export type JobStatus = RequestStatus;

export interface Job {
  id: string;
  customerName: string;
  customerPhone: string | null;
  pickupAddress: string;
  pickupLocation: MapCoord | null;
  status: JobStatus;
  distanceKm: number;
  etaMinutes: number;
  estimatedPay: number;
  bags: number | null;
  collectionCode: string;
  scheduledFor?: string;
  completedAt?: string;
  amountEarned?: number;
}

export function toJob(request: DriverRequestItem): Job {
  const distanceKm = request.distance_m / 1000;
  const price = Number(request.pickup_price) + Number(request.service_price);

  // requests.pickup_location is stored as [latitude, longitude] (a
  // pre-existing, self-consistent convention on the backend — not the usual
  // [lng, lat] GeoJSON order), so it's read back in that same order here.
  const pickupLocation: MapCoord | null = request.pickup_location
    ? { latitude: request.pickup_location[0], longitude: request.pickup_location[1] }
    : null;

  return {
    id: request.id,
    customerName:
      [request.customer_firstname, request.customer_lastname].filter(Boolean).join(' ') || 'Customer',
    customerPhone: request.customer_phone,
    pickupAddress: request.pickup_address,
    pickupLocation,
    status: request.status,
    distanceKm: Number(distanceKm.toFixed(1)),
    etaMinutes: Math.max(1, Math.round(distanceKm * 2)),
    estimatedPay: price,
    bags: request.bags ? Number(request.bags) : null,
    collectionCode: String(request.collection_code),
    completedAt: request.completed_at ?? undefined,
    amountEarned: request.status === 'completed' ? price : undefined,
  };
}
