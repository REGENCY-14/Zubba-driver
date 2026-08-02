import { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { moderateScale } from '../../utils/scale';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

// Corner radius is moderateScale(24), matching what real card surfaces in the
// customer app actually use — not the customer app's Card.tsx, whose hardcoded
// 20 is inconsistent with the rest of its own screens (DRIVER_APP_HANDOFF.md §4).
export function Card({ children, style, accessibilityLabel }: CardProps) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          borderRadius: moderateScale(24),
          padding: moderateScale(16),
          borderWidth: 1,
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: '#0F172A',
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
