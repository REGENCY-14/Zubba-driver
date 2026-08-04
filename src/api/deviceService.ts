import { api } from './axios';
import { ApiResponse } from '../types/api.types';

export const deviceService = {
  registerPushToken: async (payload: {
    expoPushToken: string;
    platform?: string;
    deviceName?: string;
    appVersion?: string;
  }) => {
    const { data } = await api.post<ApiResponse<unknown>>('/devices/register-push-token', payload);
    return data;
  },
};
