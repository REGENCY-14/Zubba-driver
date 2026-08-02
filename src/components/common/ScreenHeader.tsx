import { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { moderateScale } from '../../utils/scale';

interface ScreenHeaderProps {
  title?: string;
  onBack?: () => void;
  /** Shows a hamburger icon instead of a back chevron — used on the 4 main tab
   * screens (Home/Jobs/Earnings/Settings) to open the sidebar, since they have
   * no "back" to go to. Ignored if onBack is also provided. */
  onMenuPress?: () => void;
  rightElement?: ReactNode;
  /** Must match the screen's own content padding (default 24, the dominant
   * convention) so the back/menu icon lines up with the content below instead
   * of sitting at a different inset. */
  horizontalPadding?: number;
}

const ICON_SLOT = 22; // matches the icon's own size, not a wider tap box

// Every pushed (non-tab) screen needs this — headerShown is false on the native
// stack navigator (RootNavigator.tsx) so there's no built-in back chevron;
// without this, screens had no visible way back at all.
export function ScreenHeader({ title, onBack, onMenuPress, rightElement, horizontalPadding = 24 }: ScreenHeaderProps) {
  const { colors } = useTheme();
  const leftAction = onBack ?? onMenuPress;
  const leftIcon = onBack ? 'arrow-left' : 'menu';
  const leftLabel = onBack ? 'Go back' : 'Open menu';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: moderateScale(horizontalPadding),
        paddingTop: moderateScale(8),
        paddingBottom: moderateScale(4),
        gap: moderateScale(8),
      }}
    >
      {leftAction ? (
        <Pressable
          onPress={leftAction}
          accessibilityRole="button"
          accessibilityLabel={leftLabel}
          // The icon itself sits flush with the content edge below it (no wide
          // centered box pushing it inward) — the 44pt minimum tap target comes
          // from hitSlop instead of visual width, so it doesn't affect layout.
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          style={{
            width: moderateScale(ICON_SLOT),
            height: moderateScale(ICON_SLOT),
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name={leftIcon} size={moderateScale(ICON_SLOT)} color={colors.text} />
        </Pressable>
      ) : (
        <View style={{ width: moderateScale(ICON_SLOT) }} />
      )}
      {title ? (
        <Text
          style={{ flex: 1, fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(16), color: colors.text }}
          numberOfLines={1}
        >
          {title}
        </Text>
      ) : (
        <View style={{ flex: 1 }} />
      )}
      {rightElement ?? <View style={{ width: moderateScale(ICON_SLOT) }} />}
    </View>
  );
}
