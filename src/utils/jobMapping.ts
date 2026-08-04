import type { DriverRequestItem, RequestStatus } from '../types/request.types';

export type JobStatus = Exclude<RequestStatus, 'pending'>;

export interface Job {
  id: string;
  customerName: string;
  customerPhone: string | null;
  pickupAddress: string;
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

  return {
    id: request.id,
    customerName:
      [request.customer_firstname, request.customer_lastname].filter(Boolean).join(' ') || 'Customer',
    customerPhone: request.customer_phone,
    pickupAddress: request.pickup_address,
    status: request.status as JobStatus,
    distanceKm: Number(distanceKm.toFixed(1)),
    etaMinutes: Math.max(1, Math.round(distanceKm * 2)),
    estimatedPay: price,
    bags: request.bags ? Number(request.bags) : null,
    collectionCode: String(request.collection_code),
    completedAt: request.completed_at ?? undefined,
    amountEarned: request.status === 'completed' ? price : undefined,
  };
}
