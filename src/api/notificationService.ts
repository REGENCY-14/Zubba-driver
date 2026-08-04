import { Platform } from 'react-native';
import { api } from './axios';
import { ApiResponse } from '../types/api.types';
import { Notification, NotificationPreferences, UpdatePreferencesDto } from '../types/notification.types';

export const notificationService = {
  getDeviceName: () => (Platform.OS === 'ios' ? 'iPhone' : 'Android Device'),

  getPreferences: async (): Promise<NotificationPreferences> => {
    const { data } = await api.get<ApiResponse<NotificationPreferences>>(
      '/notifications/preferences',
    );
    return data.data;
  },

  updatePreferences: async (payload: UpdatePreferencesDto): Promise<NotificationPreferences> => {
    const { data } = await api.put<ApiResponse<NotificationPreferences>>(
      '/notifications/preferences',
      payload,
    );
    return data.data;
  },

  getNotifications: async (
    limit?: number,
    offset?: number,
  ): Promise<{
    notifications: Notification[];
    unreadCount: number;
    pagination: { limit: number; offset: number; total: number };
  }> => {
    const { data } = await api.get<ApiResponse<any>>('/notifications', {
      params: { limit, offset },
    });
    return data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await api.get<ApiResponse<{ unreadCount: number }>>(
      '/notifications/unread-count',
    );
    return data.data.unreadCount;
  },

  markAsRead: async (notificationId: number): Promise<Notification> => {
    const { data } = await api.put<ApiResponse<Notification>>(`/notifications/${notificationId}/read`);
    return data.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  },

  deleteNotification: async (notificationId: number): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },

  clearAllNotifications: async (): Promise<void> => {
    await api.delete('/notifications/clear-all');
  },
};
