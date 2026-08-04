import axios from 'axios';
import { api } from './axios';
import { env } from '../utils/env';
import { ApiResponse } from '../types/api.types';
import {
  RegisterDto,
  VerifyOtpDto,
  ResendOtpDto,
  RefreshTokenDto,
  User,
  AuthTokens,
} from '../slices/auth/auth.types';

export const authService = {
  register: async (payload: RegisterDto) => {
    const { data } = await api.post<ApiResponse<{ user: User }>>('/auth/register', payload);
    return data;
  },

  verifyOtp: async (payload: VerifyOtpDto) => {
    const { data } = await api.post<ApiResponse<AuthTokens & { user: User }>>(
      '/auth/verify-otp',
      payload,
    );
    return data;
  },

  resendOtp: async (payload: ResendOtpDto) => {
    const { data } = await api.post<{ success: boolean; message: string }>(
      '/auth/resend-otp',
      payload,
    );
    return data;
  },

  refreshToken: async (payload: RefreshTokenDto) => {
    const { data } = await axios.post<ApiResponse<{ accessToken: string }>>(
      `${env.apiUrl}/auth/refresh-token`,
      payload,
    );
    return data;
  },
};
