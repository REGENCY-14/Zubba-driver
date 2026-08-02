import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { moderateScale } from '../../utils/scale';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
}

// The customer app has no shared EmptyState — every screen inlines its own
// (DRIVER_APP_HANDOFF.md §4). One shared component here instead.
export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: moderateScale(32),
        gap: moderateScale(8),
      }}
    >
      {icon}
      <Text
        style={{
          fontFamily: 'Poppins_600SemiBold',
          fontSize: moderateScale(15),
          color: colors.text,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            fontFamily: 'Poppins_400Regular',
            fontSize: moderateScale(13),
            color: colors.textSub,
            textAlign: 'center',
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
