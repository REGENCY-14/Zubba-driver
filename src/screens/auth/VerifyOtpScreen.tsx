import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { OTPInput } from '../../components/common/OTPInput';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { moderateScale } from '../../utils/scale';
import { authService } from '../../api/authService';
import { setCredentials } from '../../slices/auth/authSlice';
import { saveAuthTokens, saveAuthUser } from '../../utils/authStorage';
import { syncPushNotifications } from '../../services/pushNotifications';
import type { RootStackScreenProps } from '../../navigation/types';

export function VerifyOtpScreen({ navigation, route }: RootStackScreenProps<'VerifyOtp'>) {
  const { phone } = route.params;
  const { colors } = useTheme();
  const dispatch = useDispatch();

  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(30);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const handleComplete = async (otp: string) => {
    setLoading(true);
    setError(null);
    try {
      // Backend always issues the OTP with purpose "login" from /auth/register,
      // regardless of whether this is a first-time signup or a returning
      // sign-in — `purpose` here is only used for this screen's own navigation.
      const result = await authService.verifyOtp({
        authKey: 'phone',
        authValue: phone,
        otp,
        purpose: 'login',
      });

      const { accessToken, refreshToken, user } = result.data;
      dispatch(setCredentials({ user, accessToken, refreshToken }));
      await saveAuthTokens({ accessToken, refreshToken });
      await saveAuthUser(user);
      syncPushNotifications().catch(() => {});

      if (user.terms_accepted_at) {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Kyc' }] });
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Invalid code. Try again.');
      setDigits(['', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.resendOtp({ authKey: 'phone', authValue: phone, purpose: 'login' });
    } catch {
      // best-effort — resend cooldown still resets so the user can retry
    }
    setResendIn(30);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader onBack={() => navigation.goBack()} />
      <View style={{ flex: 1, padding: moderateScale(24), gap: moderateScale(20) }}>
        <View style={{ gap: moderateScale(4) }}>
          <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(22), color: colors.text }}>
            Enter verification code
          </Text>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(13), color: colors.textSub }}>
            Sent to {phone}
          </Text>
        </View>

        <OTPInput value={digits} onChange={setDigits} length={4} onComplete={handleComplete} />

        {error ? (
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(12), color: '#EF4444' }}>
            {error}
          </Text>
        ) : null}

        {loading ? (
          <Text
            style={{
              fontFamily: 'Poppins_400Regular',
              fontSize: moderateScale(12),
              color: colors.textSub,
              textAlign: 'center',
            }}
          >
            Verifying…
          </Text>
        ) : null}

        <Button
          label={resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
          variant="ghost"
          disabled={resendIn > 0}
          onPress={handleResend}
        />
      </View>
    </View>
  );
}
