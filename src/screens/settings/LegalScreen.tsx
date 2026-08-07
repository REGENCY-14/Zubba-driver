import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { ScreenShell } from '../../components/common/ScreenShell';
import { moderateScale } from '../../utils/scale';
import { useScrollBottomPadding } from '../../utils/screenInsets';
import { DRIVER_TERMS_TEXT } from '../../constants/legalText';
import type { RootStackScreenProps } from '../../navigation/types';

// Read-only view of the same terms shown (with an acceptance checkbox) during
// onboarding — see src/screens/onboarding/TermsScreen.tsx and
// src/constants/legalText.ts, the shared source for both.
export function LegalScreen({ navigation }: RootStackScreenProps<'Legal'>) {
  const { colors } = useTheme();
  const scrollBottomPadding = useScrollBottomPadding();
  return (
    <ScreenShell>
      <ScreenHeader
        title="Legal"
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <ScrollView
        contentContainerStyle={{ padding: moderateScale(24), gap: moderateScale(16), paddingBottom: scrollBottomPadding }}
      >
        <Text
          style={{
            fontFamily: 'Poppins_400Regular',
            fontSize: moderateScale(13),
            color: colors.textSub,
            lineHeight: moderateScale(20),
          }}
        >
          {DRIVER_TERMS_TEXT}
        </Text>
      </ScrollView>
    </ScreenShell>
  );
}
