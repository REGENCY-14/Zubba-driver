// Ported verbatim from the customer app's src/slices/auth/auth.types.ts
// (DRIVER_APP_HANDOFF.md §6) — this is the shared contract both apps must agree
// on if/when a real backend is wired in. Do not narrow `role`/`UserRole` here.
export type AuthKey = 'email' | 'phone';
export type UserRole = 'customer' | 'driver';
export type OtpPurpose = 'login' | 'password_reset' | 'email_verification' | 'payment' | 'update_old' | 'update_new';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  firstname: string;
  lastname: string;
  role: 'customer' | 'driver' | 'admin';
  is_active: boolean;
  verified: boolean;
  terms_accepted_at?: string | null;
  profile_picture?: string | null;
}

export interface RegisterDto {
  authKey: AuthKey;
  authValue: string;
  role: UserRole;
  find?: boolean;
}

export interface VerifyOtpDto {
  authKey: AuthKey;
  authValue: string;
  otp: string;
  purpose: OtpPurpose;
}

export interface ResendOtpDto {
  authKey: AuthKey;
  authValue: string;
  purpose: OtpPurpose;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
