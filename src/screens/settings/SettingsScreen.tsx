import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { AppBottomNav } from '../../components/AppBottomNav';
import { Card } from '../../components/common/Card';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { ScreenShell } from '../../components/common/ScreenShell';
import { moderateScale } from '../../utils/scale';
import { useScrollBottomPadding } from '../../utils/screenInsets';
import { COLORS } from '../../constants/colors';
import { SHARED_DARK } from '../../constants/darkTheme';
import { logout } from '../../slices/auth/authSlice';
import { clearStoredAuth } from '../../utils/authStorage';
import { driverService } from '../../api/driverService';
import { toggleSidebar } from '../../slices/ui/uiSlice';
import type { RootState } from '../../store';
import type { RootStackScreenProps } from '../../navigation/types';

interface SettingsRow {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
}

export function SettingsScreen({ navigation }: RootStackScreenProps<'Settings'>) {
  const { colors, isDark, toggle } = useTheme();
  const activeGreen = isDark ? SHARED_DARK.accentGreen : COLORS.brandGreen;
  const destructiveColor = isDark ? SHARED_DARK.signOutText : COLORS.destructiveRed;
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const initials = user
    ? (`${user.firstname?.[0] ?? ''}${user.lastname?.[0] ?? ''}`.toUpperCase() || 'ZB')
    : 'ZB';

  const handleLogout = async () => {
    // Drop availability before clearing the token so nearby matching stops.
    await driverService.updateMe({ is_available: false }).catch(() => {});
    await clearStoredAuth();
    dispatch(logout());
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  const rows: SettingsRow[] = [
    {
      icon: 'truck-outline',
      label: 'Vehicle & documents',
      onPress: () => navigation.navigate('VehicleDocuments'),
    },
    {
      icon: 'star-outline',
      label: 'Ratings & performance',
      onPress: () => navigation.navigate('Ratings'),
    },
    {
      icon: 'bell-outline',
      label: 'Notifications',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      icon: 'help-circle-outline',
      label: 'Help & support',
      onPress: () => navigation.navigate('HelpCenter'),
    },
    {
      icon: 'file-document-outline',
      label: 'Legal',
      onPress: () => navigation.navigate('Legal'),
    },
    {
      icon: 'information-outline',
      label: 'About Zubba Driver',
      onPress: () => navigation.navigate('AboutUs'),
    },
  ];

  const scrollBottomPadding = useScrollBottomPadding({ withBottomNav: true });

  return (
    <ScreenShell edges={['top', 'left', 'right']}>
      <ScreenHeader title="Settings" onMenuPress={() => dispatch(toggleSidebar())} horizontalPadding={20} />
      <ScrollView
        contentContainerStyle={{ padding: moderateScale(20), gap: moderateScale(16), paddingBottom: scrollBottomPadding }}
      >
        <Pressable onPress={() => navigation.navigate('Profile')} accessibilityRole="button">
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(14) }}>
              <View
                style={{
                  width: moderateScale(56),
                  height: moderateScale(56),
                  borderRadius: moderateScale(28),
                  backgroundColor: activeGreen,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(18), color: '#FFFFFF' }}>
                  {initials}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(16), color: colors.text }}>
                  {user?.firstname || 'Driver'} {user?.lastname ?? ''}
                </Text>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(13), color: colors.textSub }}>
                  {user?.phone ?? '—'}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={moderateScale(22)} color={colors.textSub} />
            </View>
          </Card>
        </Pressable>

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(10) }}>
              <MaterialCommunityIcons
                name={isDark ? 'weather-night' : 'white-balance-sunny'}
                size={moderateScale(20)}
                color={colors.textSub}
              />
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: moderateScale(14), color: colors.text }}>
                {isDark ? 'Dark mode' : 'Light mode'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggle}
              trackColor={{ false: colors.border, true: activeGreen }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Toggle dark mode"
            />
          </View>
        </Card>

        <Card style={{ padding: 0 }}>
          {rows.map((row, index) => (
            <Pressable
              key={row.label}
              onPress={row.onPress}
              accessibilityRole="button"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: moderateScale(12),
                padding: moderateScale(16),
                minHeight: moderateScale(44),
                borderBottomWidth: index < rows.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
              }}
            >
              <MaterialCommunityIcons name={row.icon} size={moderateScale(20)} color={colors.textSub} />
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: moderateScale(14), color: colors.text, flex: 1 }}>
                {row.label}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={moderateScale(20)} color={colors.textSub} />
            </Pressable>
          ))}
        </Card>

        <Pressable
          onPress={handleLogout}
          accessibilityRole="button"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: moderateScale(8),
            minHeight: moderateScale(48),
            borderRadius: 9999,
            borderWidth: 1,
            backgroundColor: isDark ? SHARED_DARK.signOutBg : 'transparent',
            borderColor: isDark ? SHARED_DARK.signOutBorder : COLORS.destructiveRed,
          }}
        >
          <MaterialCommunityIcons name="logout" size={moderateScale(18)} color={destructiveColor} />
          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(14), color: destructiveColor }}>
            Log out
          </Text>
        </Pressable>
      </ScrollView>

      <AppBottomNav activeTab="settings" navigation={navigation} />
    </ScreenShell>
  );
}
