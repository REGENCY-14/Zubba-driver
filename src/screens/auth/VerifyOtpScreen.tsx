import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { OTPInput } from '../../components/common/OTPInput';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { moderateScale } from '../../utils/scale';
import { requestOtp, verifyOtp } from '../../services/mock/authMock';
import { setCredentials } from '../../slices/auth/authSlice';
import { saveAuthTokens, saveAuthUser } from '../../utils/authStorage';
import type { RootState } from '../../store';
import type { RootStackScreenProps } from '../../navigation/types';

export function VerifyOtpScreen({ navigation, route }: RootStackScreenProps<'VerifyOtp'>) {
  const { phone, purpose } = route.params;
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const applicationStatus = useSelector((state: RootState) => state.driverProfile.applicationStatus);

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
    const result = await verifyOtp(phone, otp);
    setLoading(false);

    if ('error' in result) {
      setError(result.error);
      setDigits(['', '', '', '']);
      return;
    }

    dispatch(
      setCredentials({
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      })
    );
    await saveAuthTokens(result.tokens);
    await saveAuthUser(result.user);

    if (purpose === 'registration') {
      navigation.reset({ index: 0, routes: [{ name: 'Kyc' }] });
      return;
    }

    switch (applicationStatus) {
      case 'approved':
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        break;
      case 'pending_review':
      case 'rejected':
        navigation.reset({ index: 0, routes: [{ name: 'ApplicationStatus' }] });
        break;
      default:
        navigation.reset({ index: 0, routes: [{ name: 'Kyc' }] });
    }
  };

  const handleResend = async () => {
    await requestOtp(phone);
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
            Sent to {phone} (mock code: 1234)
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
