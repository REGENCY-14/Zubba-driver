import { Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { moderateScale } from '../../utils/scale';
import type { RootStackScreenProps } from '../../navigation/types';

export function WelcomeScreen({ navigation }: RootStackScreenProps<'Welcome'>) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        padding: moderateScale(24),
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: moderateScale(12) }}>
        <View
          style={{
            width: moderateScale(96),
            height: moderateScale(96),
            borderRadius: moderateScale(24),
            backgroundColor: '#31973D',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(36), color: '#FFFFFF' }}>
            Z
          </Text>
        </View>
        <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(24), color: colors.text }}>
          Zubba Driver
        </Text>
        <Text
          style={{
            fontFamily: 'Poppins_400Regular',
            fontSize: moderateScale(14),
            color: colors.textSub,
            textAlign: 'center',
          }}
        >
          Accept jobs, collect recyclables, get paid.
        </Text>
      </View>

      <View style={{ gap: moderateScale(12) }}>
        <Button label="Sign up as a driver" variant="primary" onPress={() => navigation.navigate('SignUp')} />
        <Button
          label="I already have an account"
          variant="secondary"
          onPress={() => navigation.navigate('SignIn')}
        />
      </View>
    </View>
  );
}
