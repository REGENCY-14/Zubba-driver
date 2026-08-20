import { Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/common/Card';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { ScreenShell } from '../../components/common/ScreenShell';
import { moderateScale } from '../../utils/scale';
import { useScrollBottomPadding } from '../../utils/screenInsets';
import { COLORS } from '../../constants/colors';
import { SHARED_DARK } from '../../constants/darkTheme';
import type { RootStackScreenProps } from '../../navigation/types';

export function AboutUsScreen({ navigation }: RootStackScreenProps<'AboutUs'>) {
  const { isDark, colors } = useTheme();
  const scrollBottomPadding = useScrollBottomPadding();

  return (
    <ScreenShell>
      <ScreenHeader
        title="About Zubba Driver"
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <ScrollView
        contentContainerStyle={{ padding: moderateScale(24), gap: moderateScale(16), paddingBottom: scrollBottomPadding }}
      >
      <View style={{ alignItems: 'center', gap: moderateScale(10) }}>
        <View
          style={{
            width: moderateScale(72),
            height: moderateScale(72),
            borderRadius: moderateScale(18),
            backgroundColor: isDark ? SHARED_DARK.accentGreen : COLORS.brandGreen,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(28), color: '#FFFFFF' }}>Z</Text>
        </View>
        <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(18), color: colors.text }}>
          Zubba Driver
        </Text>
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(12), color: colors.textSub }}>
          Version 1.0.0
        </Text>
      </View>

      <Card>
        <Text
          style={{
            fontFamily: 'Poppins_400Regular',
            fontSize: moderateScale(13),
            color: colors.textSub,
            lineHeight: moderateScale(20),
          }}
        >
          Zubba connects households with independent collectors to recycle waste responsibly across Ghana. The
          Driver app is how collectors accept jobs, confirm pickups, and get paid.
        </Text>
      </Card>

      <Pressable
        onPress={() => navigation.navigate('Legal')}
        accessibilityRole="button"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: moderateScale(44),
          paddingVertical: moderateScale(10),
        }}
      >
        <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: moderateScale(14), color: colors.text }}>
          Terms & Privacy Policy
        </Text>
        <MaterialCommunityIcons name="chevron-right" size={moderateScale(20)} color={colors.textSub} />
      </Pressable>
      </ScrollView>
    </ScreenShell>
  );
}
