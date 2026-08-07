import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { moderateScale, scale } from '../utils/scale';
import { COLORS } from '../constants/colors';
import { closeSidebar } from '../slices/ui/uiSlice';
import { logout } from '../slices/auth/authSlice';
import { clearStoredAuth } from '../utils/authStorage';
import type { RootState } from '../store';
import type { RootStackParamList } from '../navigation/types';

const PANEL_WIDTH = 300;

interface AppSidebarProps {
  navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>;
}

interface SidebarItem {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  route: 'Home' | 'Jobs' | 'Earnings' | 'Settings' | 'Ratings' | 'Notifications' | 'HelpCenter' | 'Legal' | 'AboutUs';
}

// Hand-rolled, not @react-navigation/drawer — matches the codebase's existing
// convention of hand-rolling navigation chrome (AppBottomNav.tsx is a plain View,
// not @react-navigation/bottom-tabs) rather than pulling in another navigator
// package. Rendered once at the App root (see App.tsx), overlaying whatever
// screen is active, and driven by the `ui` slice's isSidebarOpen flag so any
// screen can open it via a hamburger button (see ScreenHeader's onMenuPress).
const MAIN_ITEMS: SidebarItem[] = [
  { icon: 'home-outline', label: 'Home', route: 'Home' },
  { icon: 'briefcase-outline', label: 'Jobs', route: 'Jobs' },
  { icon: 'wallet-outline', label: 'Earnings', route: 'Earnings' },
  { icon: 'cog-outline', label: 'Settings', route: 'Settings' },
];

const MORE_ITEMS: SidebarItem[] = [
  { icon: 'star-outline', label: 'Ratings & performance', route: 'Ratings' },
  { icon: 'bell-outline', label: 'Notifications', route: 'Notifications' },
  { icon: 'help-circle-outline', label: 'Help & support', route: 'HelpCenter' },
  { icon: 'file-document-outline', label: 'Legal', route: 'Legal' },
  { icon: 'information-outline', label: 'About', route: 'AboutUs' },
];

export function AppSidebar({ navigationRef }: AppSidebarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const user = useSelector((state: RootState) => state.auth.user);

  // Must offset by the panel's actual *scaled* width, not the raw constant —
  // scale() can inflate 300 to 330+ on wider viewports, and offsetting by the
  // unscaled value left a sliver of the panel's right edge (and its border)
  // visible on the left of every screen even while "closed".
  const closedX = -(scale(PANEL_WIDTH) + 20);
  const translateX = useSharedValue(closedX);

  useEffect(() => {
    translateX.value = withTiming(isOpen ? 0 : closedX, { duration: 250 });
  }, [isOpen, translateX, closedX]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleNavigate = (route: SidebarItem['route']) => {
    dispatch(closeSidebar());
    navigationRef.current?.navigate(route);
  };

  const handleLogout = async () => {
    dispatch(closeSidebar());
    await clearStoredAuth();
    dispatch(logout());
    navigationRef.current?.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  const initials = user
    ? `${user.firstname?.[0] ?? ''}${user.lastname?.[0] ?? ''}`.toUpperCase() || 'ZB'
    : 'ZB';

  return (
    <>
      {isOpen && (
        <Pressable
          onPress={() => dispatch(closeSidebar())}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        />
      )}
      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={[
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: scale(PANEL_WIDTH),
            backgroundColor: colors.card,
            borderRightWidth: 1,
            borderRightColor: colors.border,
          },
          panelStyle,
        ]}
      >
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + moderateScale(16),
            paddingBottom: insets.bottom + moderateScale(24),
          }}
        >
          <View
            style={{
              paddingHorizontal: moderateScale(20),
              paddingBottom: moderateScale(20),
              flexDirection: 'row',
              alignItems: 'center',
              gap: moderateScale(12),
            }}
          >
            <View
              style={{
                width: moderateScale(48),
                height: moderateScale(48),
                borderRadius: moderateScale(24),
                backgroundColor: COLORS.brandGreen,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(16), color: '#FFFFFF' }}>
                {initials}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(15), color: colors.text }}
                numberOfLines={1}
              >
                {user?.firstname || 'Driver'} {user?.lastname ?? ''}
              </Text>
              <Text
                style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(12), color: colors.textSub }}
                numberOfLines={1}
              >
                {user?.phone ?? ''}
              </Text>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: colors.border, marginBottom: moderateScale(8) }} />

          {MAIN_ITEMS.map(item => (
            <Pressable
              key={item.route}
              onPress={() => handleNavigate(item.route)}
              accessibilityRole="button"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: moderateScale(14),
                paddingHorizontal: moderateScale(20),
                minHeight: moderateScale(48),
              }}
            >
              <MaterialCommunityIcons name={item.icon} size={moderateScale(20)} color={colors.textSub} />
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: moderateScale(14), color: colors.text }}>
                {item.label}
              </Text>
            </Pressable>
          ))}

          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: moderateScale(8) }} />

          {MORE_ITEMS.map(item => (
            <Pressable
              key={item.route}
              onPress={() => handleNavigate(item.route)}
              accessibilityRole="button"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: moderateScale(14),
                paddingHorizontal: moderateScale(20),
                minHeight: moderateScale(48),
              }}
            >
              <MaterialCommunityIcons name={item.icon} size={moderateScale(20)} color={colors.textSub} />
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: moderateScale(14), color: colors.text }}>
                {item.label}
              </Text>
            </Pressable>
          ))}

          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: moderateScale(8) }} />

          <Pressable
            onPress={handleLogout}
            accessibilityRole="button"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: moderateScale(14),
              paddingHorizontal: moderateScale(20),
              minHeight: moderateScale(48),
            }}
          >
            <MaterialCommunityIcons name="logout" size={moderateScale(20)} color={COLORS.destructiveRed} />
            <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: moderateScale(14), color: COLORS.destructiveRed }}>
              Log out
            </Text>
          </Pressable>
        </ScrollView>
      </Animated.View>
    </>
  );
}
