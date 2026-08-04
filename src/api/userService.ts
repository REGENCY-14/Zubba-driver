import { api } from './axios';
import { ApiResponse } from '../types/api.types';
import { User } from '../slices/auth/auth.types';

export interface UpdateUserDto {
  email?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  profile_picture?: string | null;
}

export const userService = {
  getMe: async () => {
    const { data } = await api.get<ApiResponse<{ user: User }>>('/users/me');
    return data;
  },
  updateUser: async (id: string, payload: UpdateUserDto) => {
    const { data } = await api.patch<ApiResponse<{ user: User }>>(`/users/${id}`, payload);
    return data;
  },
  acceptTerms: async () => {
    const { data } = await api.post<ApiResponse<{ user: User }>>('/users/me/accept-terms');
    return data;
  },
};
