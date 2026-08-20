import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { ScreenShell } from '../../components/common/ScreenShell';
import { moderateScale } from '../../utils/scale';
import { COLORS } from '../../constants/colors';
import { SHARED_DARK } from '../../constants/darkTheme';
import type { RootStackScreenProps } from '../../navigation/types';

// The backend has no driver KYC review pipeline — registering with role="driver"
// and submitting the Terms screen activates the driver row immediately, so this
// is always a confirmation, never a pending/rejected wait state.
export function ApplicationStatusScreen({ navigation }: RootStackScreenProps<'ApplicationStatus'>) {
  const { isDark, colors } = useTheme();

  return (
    <ScreenShell>
      <View
        style={{
          flex: 1,
          padding: moderateScale(24),
          alignItems: 'center',
          justifyContent: 'center',
          gap: moderateScale(16),
        }}
      >
      <MaterialCommunityIcons
        name="check-decagram"
        size={moderateScale(64)}
        color={isDark ? SHARED_DARK.accentGreen : COLORS.brandGreen}
      />
      <Text
        style={{
          fontFamily: 'Poppins_700Bold',
          fontSize: moderateScale(20),
          color: colors.text,
          textAlign: 'center',
        }}
      >
        You're all set!
      </Text>
      <Text
        style={{
          fontFamily: 'Poppins_400Regular',
          fontSize: moderateScale(13),
          color: colors.textSub,
          textAlign: 'center',
        }}
      >
        You're ready to start accepting jobs.
      </Text>
      <Button
        label="Continue"
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
      />
      </View>
    </ScreenShell>
  );
}
