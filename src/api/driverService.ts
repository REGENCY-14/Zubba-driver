import { api } from './axios';
import { ApiResponse, PagedApiResponse } from '../types/api.types';
import { DriverRequestItem, RequestStatus, UpdateDriverMeDto } from '../types/request.types';

export const driverService = {
  updateMe: async (payload: UpdateDriverMeDto) => {
    const { data } = await api.patch<ApiResponse<{ driver: unknown }>>('/drivers/me', payload);
    return data;
  },

  getMyRequests: async (params: { status?: string; limit?: number; current_page?: number }) => {
    const { data } = await api.get<PagedApiResponse<DriverRequestItem[]>>('/drivers/requests', {
      params,
    });
    return data;
  },

  getRequestById: async (requestId: string) => {
    const { data } = await api.get<ApiResponse<DriverRequestItem>>(
      `/drivers/requests/${requestId}`,
    );
    return data;
  },

  updateRequestStatus: async (requestId: string, status: RequestStatus) => {
    const { data } = await api.patch<ApiResponse<{ request: DriverRequestItem }>>(
      `/drivers/requests/${requestId}/status`,
      { status },
    );
    return data;
  },

  submitBags: async (requestId: string, bags: number, code: string) => {
    const { data } = await api.patch<ApiResponse<{ request: DriverRequestItem }>>(
      `/drivers/requests/${requestId}/bags`,
      { bags, code },
    );
    return data;
  },
};
