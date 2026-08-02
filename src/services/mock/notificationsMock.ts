// In-app representations of the 5 push notification types from spec §5.9. No real
// push/websocket wiring exists (non-goal) — this is what each treatment looks like
// once it lands in the notification center.
export type NotificationType =
  | 'new_job_request'
  | 'job_cancelled'
  | 'payout_complete'
  | 'kyc_status_change'
  | 'scheduled_reminder';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string; // ISO
  read: boolean;
}

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-1',
    type: 'new_job_request',
    title: 'New job request',
    body: 'Ama Boateng requested a pickup 1.4km away — GHS 22.00 est.',
    createdAt: '2026-08-02T08:12:00.000Z',
    read: false,
  },
  {
    id: 'n-2',
    type: 'payout_complete',
    title: 'Payout complete',
    body: 'GHS 50.00 was sent to your MTN MoMo account.',
    createdAt: '2026-08-01T18:40:00.000Z',
    read: false,
  },
  {
    id: 'n-3',
    type: 'job_cancelled',
    title: 'Job cancelled',
    body: 'Kojo Mensah cancelled their pickup request.',
    createdAt: '2026-07-31T14:05:00.000Z',
    read: true,
  },
  {
    id: 'n-4',
    type: 'kyc_status_change',
    title: 'Application approved',
    body: "You're verified! You can now go online and accept jobs.",
    createdAt: '2026-07-30T09:00:00.000Z',
    read: true,
  },
  {
    id: 'n-5',
    type: 'scheduled_reminder',
    title: 'Scheduled pickup reminder',
    body: 'You have a scheduled pickup with Efua Mensah in 1 hour.',
    createdAt: '2026-07-29T13:00:00.000Z',
    read: true,
  },
];

export async function getNotifications(): Promise<AppNotification[]> {
  return delay(MOCK_NOTIFICATIONS);
}

let pushEnabled = true;

export async function getPushEnabled(): Promise<boolean> {
  return delay(pushEnabled, 100);
}

export async function setPushEnabled(enabled: boolean): Promise<{ enabled: boolean }> {
  pushEnabled = enabled;
  return delay({ enabled }, 200);
}
