function delay<T>(value: T, ms = 700): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

export async function submitKycApplication(): Promise<{ applicationStatus: 'pending_review' }> {
  return delay({ applicationStatus: 'pending_review' });
}

// Stands in for the backend eventually pushing a KYC-status-change notification
// (spec §5.9) — lets the UI demonstrate all three application states without a
// real reviewer or websocket in place.
export async function simulateApplicationDecision(
  outcome: 'approved' | 'rejected',
  reason?: string
): Promise<{ applicationStatus: 'approved' | 'rejected'; reason?: string }> {
  return delay({ applicationStatus: outcome, reason });
}
