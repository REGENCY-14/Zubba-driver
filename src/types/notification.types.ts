export interface NotificationPreferences {
  id: number;
  userId: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'never';
  inAppEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  walletEnabled: boolean;
  rewardsEnabled: boolean;
  subscriptionEnabled: boolean;
  scheduledPickupsEnabled: boolean;
  arrivalPickupsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  channel: string;
  status: 'pending' | 'sent' | 'failed' | 'read';
  title: string;
  body: string;
  data?: Record<string, any>;
  sentAt?: string;
  readAt?: string;
  createdAt: string;
}

export interface UpdatePreferencesDto {
  frequency?: 'daily' | 'weekly' | 'monthly' | 'never';
  inAppEnabled?: boolean;
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  whatsappEnabled?: boolean;
  walletEnabled?: boolean;
  rewardsEnabled?: boolean;
  subscriptionEnabled?: boolean;
  scheduledPickupsEnabled?: boolean;
  arrivalPickupsEnabled?: boolean;
}
