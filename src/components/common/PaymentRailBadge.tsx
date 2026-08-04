import { Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../constants/colors';
import { moderateScale } from '../../utils/scale';

export type PayoutRail = 'mtn' | 'telecel' | 'airtel';

interface PaymentRailBadgeProps {
  rail: PayoutRail;
}

const BADGE_SIZE = { width: 64, height: 56 };

// Ported verbatim colors/labels from the customer app's SavedCardsScreen payment
// rail badges (DRIVER_APP_HANDOFF.md §4): MTN yellow, Telecel red, Airtel neutral
// with a red "t" wordmark glyph.
export function PaymentRailBadge({ rail }: PaymentRailBadgeProps) {
  const { colors } = useTheme();
  const baseStyle = {
    width: moderateScale(BADGE_SIZE.width),
    height: moderateScale(BADGE_SIZE.height),
    borderRadius: moderateScale(12),
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  if (rail === 'mtn') {
    return (
      <View style={[baseStyle, { backgroundColor: COLORS.paymentRail.mtn }]}>
        <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(13), color: '#000000' }}>MTN</Text>
        <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(9), color: '#000000' }}>MoMo</Text>
      </View>
    );
  }

  if (rail === 'telecel') {
    return (
      <View style={[baseStyle, { backgroundColor: COLORS.paymentRail.telecel }]}>
        <Text
          style={{
            fontFamily: 'Poppins_700Bold',
            fontSize: moderateScale(11),
            color: '#FFFFFF',
            textAlign: 'center',
          }}
        >
          {'Telecel\nCash'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[baseStyle, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
      <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(24), color: COLORS.paymentRail.airtelGlyph }}>
        t
      </Text>
    </View>
  );
}
