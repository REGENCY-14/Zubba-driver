export type MatchingMode = 'broadcast' | 'customer_selects';

export interface DriverStatusState {
  isOnline: boolean;
  matchingMode: MatchingMode;
}
