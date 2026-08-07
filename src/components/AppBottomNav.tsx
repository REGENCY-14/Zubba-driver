import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { scale, moderateScale } from '../utils/scale';
import { useBottomNavOffset } from '../utils/screenInsets';

export type DriverTab = 'home' | 'jobs' | 'earnings' | 'settings';

// Mirrors the customer app's AppBottomNav.tsx pill pattern (absolutely positioned,
// green active pill, icon-only inactive tabs, reanimated scale bump) — see
// DRIVER_APP_HANDOFF.md §4. Fixed at 4 tabs per spec §9.3 (no premium-only 5th tab).
type Props = {
  activeTab: DriverTab;
  navigation: any;
};

type TabDef = {
  key: DriverTab;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route: string;
};

const TABS: TabDef[] = [
  { key: 'home', label: 'Home', icon: 'home', route: 'Home' },
  { key: 'jobs', label: 'Jobs', icon: 'briefcase-outline', route: 'Jobs' },
  { key: 'earnings', label: 'Earnings', icon: 'wallet-outline', route: 'Earnings' },
  { key: 'settings', label: 'Settings', icon: 'cog-outline', route: 'Settings' },
];

function NavItem({
  tab,
  active,
  onPress,
  textSub,
}: {
  tab: TabDef;
  active: boolean;
  onPress: () => void;
  textSub: string;
}) {
  const scaleValue = useSharedValue(1);

  useEffect(() => {
    scaleValue.value = withSpring(active ? 1.08 : 1);
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={tab.label}
        accessibilityState={{ selected: active }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 9999,
          paddingHorizontal: moderateScale(18),
          paddingVertical: moderateScale(8),
          gap: moderateScale(6),
          minWidth: moderateScale(44),
          minHeight: moderateScale(44),
          backgroundColor: active ? '#31973D' : 'transparent',
        }}
      >
        <View
          style={{
            width: moderateScale(22),
            height: moderateScale(22),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons
            name={tab.icon}
            size={moderateScale(20)}
            color={active ? '#FFFFFF' : textSub}
          />
        </View>
        {active && (
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(12), color: '#FFFFFF' }}>
            {tab.label}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

export function AppBottomNav({ activeTab, navigation }: Props) {
  const { colors } = useTheme();
  const bottomOffset = useBottomNavOffset();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        paddingBottom: bottomOffset,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          width: scale(360),
          maxWidth: '92%',
          justifyContent: 'space-between',
          borderRadius: 9999,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          paddingVertical: moderateScale(6),
          paddingHorizontal: scale(8),
          shadowColor: '#0F172A',
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 4,
        }}
      >
        {TABS.map(tab => (
          <NavItem
            key={tab.key}
            tab={tab}
            active={activeTab === tab.key}
            onPress={() => navigation.navigate(tab.route)}
            textSub={colors.textSub}
          />
        ))}
      </View>
    </View>
  );
}
