import { useState } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/common/FormField';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { moderateScale } from '../../utils/scale';
import { authService } from '../../api/authService';
import { handleApiError } from '../../utils/handleApiError';
import type { RootStackScreenProps } from '../../navigation/types';

export function SignInScreen({ navigation }: RootStackScreenProps<'SignIn'>) {
  const { colors } = useTheme();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const canContinue = phone.trim().length >= 9;

  const handleContinue = async () => {
    setLoading(true);
    try {
      await authService.register({
        authKey: 'phone',
        authValue: phone.trim(),
        role: 'driver',
        find: true,
      });
      navigation.navigate('VerifyOtp', { phone: phone.trim(), purpose: 'login' });
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader onBack={() => navigation.goBack()} />
      <View style={{ flex: 1, padding: moderateScale(24), gap: moderateScale(20) }}>
        <View style={{ gap: moderateScale(4) }}>
          <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(22), color: colors.text }}>
            Welcome back
          </Text>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(13), color: colors.textSub }}>
            Enter your phone number to sign in.
          </Text>
        </View>

        <FormField
          label="Phone number"
          placeholder="024 123 4567"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Button label="Continue" onPress={handleContinue} disabled={!canContinue} loading={loading} />

        <Button
          label="Create a new account"
          variant="ghost"
          onPress={() => navigation.navigate('SignUp')}
        />
      </View>
    </View>
  );
}
