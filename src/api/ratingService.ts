import { api } from './axios';
import { ApiResponse } from '../types/api.types';

export interface DriverRatingItem {
  id: string;
  request_id: string;
  rated_by: string;
  rated_for: string;
  score: number;
  service_rating: number;
  professionalism_rating: number;
  eco_friendly_rating: number;
  comment: string | null;
  created_at: string;
}

// Postgres aggregate results (AVG/COUNT) are serialized as strings by the
// driver, except the all-zero fallback when a driver has no ratings yet —
// so these fields are numeric-looking strings in practice, not numbers.
export interface DriverRatingSummary {
  averageScore: number | string;
  totalRatings: number | string;
  serviceRating: number | string;
  professionalismRating: number | string;
  ecoFriendlyRating: number | string;
  items: DriverRatingItem[];
}

export const ratingService = {
  getDriverRating: async (driverId: string, params?: { limit?: number; current_page?: number }) => {
    const { data } = await api.get<ApiResponse<DriverRatingSummary>>(
      `/ratings/driver/${driverId}`,
      { params },
    );
    return data;
  },
};
