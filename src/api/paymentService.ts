import { api } from './axios';
import { ApiResponse } from '../types/api.types';

export type PaymentStatusResponse = {
  status: 'pending' | 'success' | 'failed' | string;
  reference: string;
  amount?: number;
};

export const paymentService = {
  verifyPaymentStatus: async (reference: string) => {
    const { data } = await api.get<ApiResponse<PaymentStatusResponse>>(
      `/payments/status/${reference}`,
    );
    return data;
  },
};
