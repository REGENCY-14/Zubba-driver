import { useState } from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { toast } from 'sonner-native';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { ScreenShell } from '../../components/common/ScreenShell';
import { moderateScale } from '../../utils/scale';
import { COLORS } from '../../constants/colors';
import { SHARED_DARK } from '../../constants/darkTheme';
import { requestNotificationPermissionOnly } from '../../services/pushNotifications';
import type { RootStackScreenProps } from '../../navigation/types';

export function OnboardNotificationsAccessScreen({
  navigation,
}: RootStackScreenProps<'OnboardNotificationsAccess'>) {
  const { isDark, colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const enableNotifications = async () => {
    setLoading(true);
    try {
      const granted = await requestNotificationPermissionOnly();
      if (!granted) {
        toast.info('You can enable notifications later in Settings.');
      }
    } catch {
      // best-effort — proceed regardless
    } finally {
      setLoading(false);
      navigation.navigate('Welcome');
    }
  };

  return (
    <ScreenShell>
      <View
        style={{
          flex: 1,
          padding: moderateScale(24),
          justifyContent: 'space-between',
        }}
      >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: moderateScale(20) }}>
        <View
          style={{
            width: moderateScale(96),
            height: moderateScale(96),
            borderRadius: moderateScale(48),
            backgroundColor: isDark ? SHARED_DARK.brandTintBg : `${COLORS.brandGreen}1A`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons
            name="bell-ring-outline"
            size={moderateScale(44)}
            color={isDark ? SHARED_DARK.accentGreen : COLORS.brandGreen}
          />
        </View>
        <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(22), color: colors.text, textAlign: 'center' }}>
          Stay on top of job requests
        </Text>
        <Text
          style={{
            fontFamily: 'Poppins_400Regular',
            fontSize: moderateScale(14),
            color: colors.textSub,
            textAlign: 'center',
            paddingHorizontal: moderateScale(16),
          }}
        >
          Get notified the moment a customer requests a pickup with you, and for payout updates.
        </Text>
      </View>

      <View style={{ gap: moderateScale(12) }}>
        <Button
          label="Enable notifications"
          variant="primary"
          onPress={enableNotifications}
          loading={loading}
        />
        <Button label="Maybe later" variant="secondary" onPress={() => navigation.navigate('Welcome')} />
      </View>
      </View>
    </ScreenShell>
  );
}
