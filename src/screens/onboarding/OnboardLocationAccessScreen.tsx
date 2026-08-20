import * as Location from 'expo-location';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { ScreenShell } from '../../components/common/ScreenShell';
import { moderateScale } from '../../utils/scale';
import { COLORS } from '../../constants/colors';
import { SHARED_DARK } from '../../constants/darkTheme';
import { toast } from 'sonner-native';
import type { RootStackScreenProps } from '../../navigation/types';

export function OnboardLocationAccessScreen({
  navigation,
}: RootStackScreenProps<'OnboardLocationAccess'>) {
  const { isDark, colors } = useTheme();

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      toast.error('Location permission is needed to find pickups near you.');
    }
    navigation.navigate('OnboardNotificationsAccess');
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
          <MaterialCommunityIcons name="map-marker-radius-outline" size={moderateScale(44)} color={COLORS.brandGreen} />
        </View>
        <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(22), color: colors.text, textAlign: 'center' }}>
          Allow location access
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
          We use your location to match you with pickup requests nearby and to show customers your ETA.
        </Text>
      </View>

      <View style={{ gap: moderateScale(12) }}>
        <Button label="Allow location access" variant="primary" onPress={requestLocation} />
        <Button
          label="Maybe later"
          variant="secondary"
          onPress={() => navigation.navigate('OnboardNotificationsAccess')}
        />
      </View>
      </View>
    </ScreenShell>
  );
}
