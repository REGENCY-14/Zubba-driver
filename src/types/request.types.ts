export type RequestStatus =
  | 'pending'
  | 'paid'
  | 'accepted'
  | 'en_route'
  | 'arrived'
  | 'completed'
  | 'cancelled';

export interface DriverRequestItem {
  id: string;
  customer_id: string;
  driver_id: string | null;
  pickup_location: [number, number] | null;
  pickup_address: string;
  status: RequestStatus;
  payment_method: string | null;
  bags: string | null;
  distance_m: number;
  pickup_price: string;
  service_price: string;
  collection_code: number;
  created_at: string;
  accepted_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  schedule_id: string | null;
  transaction_reference: string | null;
  customer_firstname: string | null;
  customer_lastname: string | null;
  customer_phone: string | null;
}

export interface GetDriverRequestsQuery {
  status?: string;
  limit?: number;
  current_page?: number;
}

export interface UpdateDriverMeDto {
  is_available?: boolean;
  latitude?: number;
  longitude?: number;
  vehicle_plate?: string | null;
  profile_picture?: string | null;
  ghana_card_number?: string | null;
  ghana_card_photo?: string | null;
  drivers_license_number?: string | null;
  drivers_license_photo?: string | null;
  vehicle_type?: string | null;
  vehicle_photo?: string | null;
}
