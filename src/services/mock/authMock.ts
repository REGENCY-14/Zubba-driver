import type { AuthTokens, User } from '../../slices/auth/auth.types';

// All fake data lives behind this mock layer, shaped like the real /auth/* calls
// will eventually look (DRIVER_APP_HANDOFF.md §6/§7 — the customer app already
// calls POST /auth/register, /auth/verify-otp, /auth/resend-otp for real).
// Swapping this for real axios calls later is a drop-in replacement.
function delay<T>(value: T, ms = 500): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

const FIXED_MOCK_OTP = '1234';
const otpStore: Record<string, string> = {};

export async function requestOtp(phone: string): Promise<{ sent: boolean }> {
  otpStore[phone] = FIXED_MOCK_OTP;
  return delay({ sent: true });
}

export async function verifyOtp(
  phone: string,
  otp: string
): Promise<{ tokens: AuthTokens; user: User } | { error: string }> {
  const expected = otpStore[phone] ?? FIXED_MOCK_OTP;
  if (otp !== expected) {
    return delay({ error: 'Invalid code. Try again.' });
  }

  const user: User = {
    id: 'mock-driver-1',
    phone,
    firstname: '',
    lastname: '',
    role: 'driver',
    is_active: true,
    verified: true,
    terms_accepted_at: null,
    profile_picture: null,
  };
  const tokens: AuthTokens = { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' };
  return delay({ tokens, user });
}
