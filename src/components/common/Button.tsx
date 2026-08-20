import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, PressableProps, Text } from 'react-native';
import { moderateScale } from '../../utils/scale';
import { COLORS } from '../../constants/colors';
import { SHARED_DARK } from '../../constants/darkTheme';
import { useTheme } from '../../context/ThemeContext';
import type { ButtonVariant } from '../../types/ui';

// The customer app has two competing button components (Button.tsx, RoundedButton.tsx)
// and most screens bypass both with an inline Pressable (DRIVER_APP_HANDOFF.md §4).
// This is the ONE canonical button for the driver app — use it everywhere.
interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  /** 'lg' satisfies the larger tap-target requirement for Accept/Decline/Arrived actions. */
  size?: 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
}

const HEIGHT: Record<'md' | 'lg', number> = { md: 48, lg: 56 };

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  leftIcon,
  ...pressableProps
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isPremium = variant === 'premium';
  const isGhost = variant === 'ghost';
  const isSecondary = variant === 'secondary';
  const { isDark, colors } = useTheme();

  // Primary keeps the same brand-green hue in both modes, just translucent in
  // dark instead of solid — the one dark-mode button treatment used everywhere.
  const bg = isPremium
    ? COLORS.premiumGoldBg
    : isPrimary
    ? isDark
      ? SHARED_DARK.buttonPrimaryBg
      : COLORS.brandGreen
    : 'transparent';
  const textColor = isPremium
    ? COLORS.premiumGoldText
    : isPrimary
    ? '#FFFFFF'
    : isGhost
    ? isDark
      ? SHARED_DARK.accentGreen
      : COLORS.brandGreen
    : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled || !!loading }}
      disabled={disabled || loading}
      style={({ pressed }) => ({
        // minHeight, not height — a longer translated label wrapping to 2 lines
        // grows the button instead of getting clipped (localization-readiness).
        minHeight: moderateScale(HEIGHT[size]),
        minWidth: moderateScale(44),
        borderRadius: 9999,
        borderWidth: isSecondary ? 1 : 0,
        borderColor: colors.border,
        backgroundColor: bg,
        opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: moderateScale(20),
        paddingVertical: moderateScale(8),
        gap: moderateScale(8),
      })}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {leftIcon}
          <Text
            style={{
              fontFamily: 'Poppins_600SemiBold',
              fontSize: moderateScale(14),
              color: textColor,
            }}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
