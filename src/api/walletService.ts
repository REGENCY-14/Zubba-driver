import { api } from './axios';
import { ApiResponse } from '../types/api.types';

export const walletService = {
  getWallet: async () => {
    const { data } = await api.get<ApiResponse<{ wallet: { available_balance: number } }>>(
      '/wallet',
    );
    return data;
  },
  getTransactions: async (params?: { page?: number; limit?: number }) => {
    const { data } = await api.get<ApiResponse<{ items: unknown[] }>>('/wallet/transactions', {
      params,
    });
    return data;
  },
  withdraw: async (payload: { amount: number; phone: string; provider?: string; name?: string }) => {
    const { data } = await api.post<ApiResponse<{ reference: string; transfer?: unknown }>>(
      '/wallet/withdraw',
      payload,
    );
    return data;
  },
};
