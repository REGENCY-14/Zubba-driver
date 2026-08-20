import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { moderateScale } from '../../utils/scale';
import { COLORS } from '../../constants/colors';
import { SHARED_DARK } from '../../constants/darkTheme';
import { useTheme } from '../../context/ThemeContext';

export type StatusKind = 'success' | 'pending' | 'failed';

type StatusConfig = {
  color: string;
  bg: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
};

// Colors match the customer app's STATUS_COLOR map verbatim (TransactionsScreen.tsx /
// ZubbaWalletScreen.tsx). Unlike the customer app — which renders status as plain
// colored text — this pairs every status with an icon + label, per the accessibility
// requirement that color must never be the only indicator.
const STATUS_CONFIG: Record<StatusKind, StatusConfig> = {
  success: { color: COLORS.statusSuccess, bg: 'rgba(49,151,61,0.1)', icon: 'check-circle', label: 'Success' },
  pending: { color: COLORS.statusPending, bg: 'rgba(85,94,89,0.1)', icon: 'clock-outline', label: 'Pending' },
  failed: { color: COLORS.statusFailed, bg: 'rgba(255,56,60,0.1)', icon: 'close-circle', label: 'Failed' },
};

// Dark-mode counterpart — pastel-on-white pills tuned for a light background
// read as near-invisible on a dark surface, so dark mode swaps to
// light-on-translucent-dark with a brighter text color instead.
const STATUS_CONFIG_DARK: Record<StatusKind, { color: string; bg: string }> = {
  success: { color: SHARED_DARK.statusSuccessText, bg: SHARED_DARK.statusSuccessBg },
  pending: { color: SHARED_DARK.statusPendingText, bg: SHARED_DARK.statusPendingBg },
  failed: { color: SHARED_DARK.statusFailedText, bg: SHARED_DARK.statusFailedBg },
};

interface StatusPillProps {
  status: StatusKind;
  label?: string;
}

export function StatusPill({ status, label }: StatusPillProps) {
  const { isDark } = useTheme();
  const base = STATUS_CONFIG[status];
  const cfg = isDark ? { ...base, ...STATUS_CONFIG_DARK[status] } : base;
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={label ?? cfg.label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(4),
        alignSelf: 'flex-start',
        paddingHorizontal: moderateScale(10),
        paddingVertical: moderateScale(4),
        borderRadius: 9999,
        backgroundColor: cfg.bg,
      }}
    >
      <MaterialCommunityIcons name={cfg.icon} size={moderateScale(14)} color={cfg.color} />
      <Text
        style={{
          fontFamily: 'Poppins_600SemiBold',
          fontSize: moderateScale(11),
          color: cfg.color,
          textTransform: 'uppercase',
          letterSpacing: -0.3,
        }}
      >
        {label ?? cfg.label}
      </Text>
    </View>
  );
}
