// Shaped like the real payout endpoints will eventually look — swapping this for
// axios calls later is a drop-in replacement. Payout rails reuse the customer
// app's exact payment-rail colors/labels (DRIVER_APP_HANDOFF.md §4); 'bank' is a
// net-new option with no customer-app precedent, styled neutrally rather than
// inventing a new brand color for it (see PaymentRailBadge.tsx).
export type PayoutRail = 'mtn' | 'telecel' | 'airtel' | 'bank';

export interface WalletBalance {
  availableGHS: number;
}

export interface WithdrawRequest {
  amountGHS: number;
  rail: PayoutRail;
  accountDetail: string;
}

export interface WithdrawResult {
  reference: string;
  status: 'processing';
  newBalanceGHS: number;
}

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

let mockBalanceGHS = 245.0;

export async function getWalletBalance(): Promise<WalletBalance> {
  return delay({ availableGHS: mockBalanceGHS });
}

export async function submitWithdrawal(
  request: WithdrawRequest
): Promise<WithdrawResult | { error: string }> {
  if (request.amountGHS > mockBalanceGHS) {
    return delay({ error: 'Amount exceeds available balance.' }, 500);
  }
  mockBalanceGHS -= request.amountGHS;
  return delay(
    {
      reference: `WD-${Math.floor(Math.random() * 900000 + 100000)}`,
      status: 'processing' as const,
      newBalanceGHS: mockBalanceGHS,
    },
    900
  );
}
