import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/common/Card';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { ScreenShell } from '../../components/common/ScreenShell';
import { moderateScale } from '../../utils/scale';
import { useScrollBottomPadding } from '../../utils/screenInsets';
import { COLORS } from '../../constants/colors';
import { SHARED_DARK } from '../../constants/darkTheme';
import { notificationService } from '../../api/notificationService';
import { handleApiError } from '../../utils/handleApiError';
import type { Notification, NotificationPreferences } from '../../types/notification.types';
import type { RootStackScreenProps } from '../../navigation/types';

const TYPE_ICON: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  wallet: 'wallet-outline',
  rewards: 'gift-outline',
  subscription: 'calendar-clock-outline',
  scheduled_pickups: 'calendar-clock-outline',
  arrival_pickups: 'bell-ring-outline',
  system: 'information-outline',
};

const DELIVERY_METHODS: { key: keyof NotificationPreferences; label: string }[] = [
  { key: 'inAppEnabled', label: 'In-app notifications' },
  { key: 'emailEnabled', label: 'Email notifications' },
  { key: 'smsEnabled', label: 'SMS notifications' },
];

export function NotificationsScreen({ navigation }: RootStackScreenProps<'Notifications'>) {
  const { isDark, colors } = useTheme();
  const activeGreen = isDark ? SHARED_DARK.accentGreen : COLORS.brandGreen;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const scrollBottomPadding = useScrollBottomPadding();

  useEffect(() => {
    notificationService
      .getNotifications()
      .then((res) => setNotifications(res.notifications))
      .catch((err) => handleApiError(err));
    notificationService
      .getPreferences()
      .then(setPreferences)
      .catch(() => {});
  }, []);

  const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;
    const previous = preferences;
    setPreferences({ ...preferences, [key]: value });
    try {
      await notificationService.updatePreferences({ [key]: value });
    } catch (err) {
      setPreferences(previous);
      handleApiError(err);
    }
  };

  const handleMarkRead = async (notification: Notification) => {
    if (notification.status === 'read') return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, status: 'read' } : n)),
    );
    notificationService.markAsRead(notification.id).catch(() => {});
  };

  return (
    <ScreenShell>
      <ScreenHeader
        title="Notifications"
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <ScrollView
        contentContainerStyle={{ padding: moderateScale(24), gap: moderateScale(16), paddingBottom: scrollBottomPadding }}
      >
      <Card>
        <View style={{ gap: moderateScale(14) }}>
          {DELIVERY_METHODS.map((method) => (
            <View
              key={method.key}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: moderateScale(14), color: colors.text }}>
                {method.label}
              </Text>
              <Switch
                value={preferences ? Boolean(preferences[method.key]) : false}
                onValueChange={(value) => handleToggle(method.key, value)}
                trackColor={{ false: colors.border, true: activeGreen }}
                thumbColor="#FFFFFF"
                disabled={!preferences}
                accessibilityLabel={`Toggle ${method.label}`}
              />
            </View>
          ))}
        </View>
      </Card>

      {notifications.map(n => {
        const isUnread = n.status !== 'read';
        return (
          <Pressable
            key={n.id}
            onPress={() => handleMarkRead(n)}
            accessibilityRole="button"
            accessibilityLabel={`${isUnread ? 'Unread' : 'Read'} notification: ${n.title}`}
          >
          <Card style={{ opacity: isUnread ? 1 : 0.7 }}>
            <View style={{ flexDirection: 'row', gap: moderateScale(12) }}>
              <View
                style={{
                  width: moderateScale(36),
                  height: moderateScale(36),
                  borderRadius: moderateScale(18),
                  backgroundColor: isDark ? SHARED_DARK.brandTintBg : `${COLORS.brandGreen}1A`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons
                  name={TYPE_ICON[n.type] ?? 'bell-outline'}
                  size={moderateScale(18)}
                  color={activeGreen}
                />
              </View>
              <View style={{ flex: 1, gap: moderateScale(2) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(6) }}>
                  <Text
                    style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(13), color: colors.text, flex: 1 }}
                  >
                    {n.title}
                  </Text>
                  {isUnread && (
                    <View
                      style={{
                        paddingHorizontal: moderateScale(7),
                        paddingVertical: moderateScale(2),
                        borderRadius: 9999,
                        backgroundColor: activeGreen,
                      }}
                    >
                      <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(9), color: '#FFFFFF' }}>
                        NEW
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(12), color: colors.textSub }}>
                  {n.body}
                </Text>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(10), color: colors.textMuted }}>
                  {new Date(n.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                </Text>
              </View>
            </View>
          </Card>
          </Pressable>
        );
      })}
      </ScrollView>
    </ScreenShell>
  );
}
