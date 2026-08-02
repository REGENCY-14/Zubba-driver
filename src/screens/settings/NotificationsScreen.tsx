import { useEffect, useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/common/Card';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { moderateScale } from '../../utils/scale';
import { COLORS } from '../../constants/colors';
import {
  getNotifications,
  getPushEnabled,
  setPushEnabled,
  AppNotification,
  NotificationType,
} from '../../services/mock/notificationsMock';
import type { RootStackScreenProps } from '../../navigation/types';

const TYPE_ICON: Record<NotificationType, keyof typeof MaterialCommunityIcons.glyphMap> = {
  new_job_request: 'bell-ring-outline',
  job_cancelled: 'close-circle-outline',
  payout_complete: 'wallet-outline',
  kyc_status_change: 'shield-check-outline',
  scheduled_reminder: 'calendar-clock-outline',
};

const TYPE_COLOR: Record<NotificationType, string> = {
  new_job_request: COLORS.brandGreen,
  job_cancelled: COLORS.statusFailed,
  payout_complete: COLORS.brandGreen,
  kyc_status_change: COLORS.brandGreen,
  scheduled_reminder: COLORS.statusPending,
};

// Since real push/websocket wiring is out of scope, this in-app list is where the
// 5 notification treatments from spec §5.9 actually live and get demonstrated.
export function NotificationsScreen({ navigation }: RootStackScreenProps<'Notifications'>) {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [pushOn, setPushOn] = useState(true);

  useEffect(() => {
    getNotifications().then(setNotifications);
    getPushEnabled().then(setPushOn);
  }, []);

  const handleTogglePush = async (value: boolean) => {
    setPushOn(value);
    await setPushEnabled(value);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader
        title="Notifications"
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <ScrollView
        contentContainerStyle={{ padding: moderateScale(24), gap: moderateScale(16), paddingBottom: moderateScale(48) }}
      >
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: moderateScale(14), color: colors.text }}>
            Push notifications
          </Text>
          <Switch
            value={pushOn}
            onValueChange={handleTogglePush}
            trackColor={{ false: colors.border, true: COLORS.brandGreen }}
            thumbColor="#FFFFFF"
            accessibilityLabel="Toggle push notifications"
          />
        </View>
      </Card>

      {notifications.map(n => (
        <Card
          key={n.id}
          style={{ opacity: n.read ? 0.7 : 1 }}
          accessibilityLabel={`${n.read ? 'Read' : 'Unread'} notification: ${n.title}`}
        >
          <View style={{ flexDirection: 'row', gap: moderateScale(12) }}>
            <View
              style={{
                width: moderateScale(36),
                height: moderateScale(36),
                borderRadius: moderateScale(18),
                backgroundColor: `${TYPE_COLOR[n.type]}1A`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name={TYPE_ICON[n.type]} size={moderateScale(18)} color={TYPE_COLOR[n.type]} />
            </View>
            <View style={{ flex: 1, gap: moderateScale(2) }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(6) }}>
                <Text
                  style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(13), color: colors.text, flex: 1 }}
                >
                  {n.title}
                </Text>
                {/* Text badge, not a color-only dot — unread state must be legible without relying on color. */}
                {!n.read && (
                  <View
                    style={{
                      paddingHorizontal: moderateScale(7),
                      paddingVertical: moderateScale(2),
                      borderRadius: 9999,
                      backgroundColor: COLORS.brandGreen,
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
      ))}
      </ScrollView>
    </View>
  );
}
