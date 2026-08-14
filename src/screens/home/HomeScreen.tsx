import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/common/Card';
import { AppBottomNav } from '../../components/AppBottomNav';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { ScreenShell } from '../../components/common/ScreenShell';
import { moderateScale } from '../../utils/scale';
import { useScrollBottomPadding } from '../../utils/screenInsets';
import { COLORS } from '../../constants/colors';
import { toggleSidebar } from '../../slices/ui/uiSlice';
import { driverService } from '../../api/driverService';
import { handleApiError } from '../../utils/handleApiError';
import { syncPushNotifications } from '../../services/pushNotifications';
import { IncomingRequestModal, IncomingJobRequest } from './IncomingRequestModal';
import type { DriverRequestItem } from '../../types/request.types';
import type { RootState } from '../../store';
import type { RootStackScreenProps } from '../../navigation/types';

const POLL_INTERVAL_MS = 4000;

interface TodayEarningsSummary {
  totalGHS: number;
  completedJobs: number;
  bagsCollected: number;
}

function toIncomingJobRequest(request: DriverRequestItem): IncomingJobRequest {
  const distanceKm = request.distance_m / 1000;
  return {
    id: request.id,
    customerName:
      [request.customer_firstname, request.customer_lastname].filter(Boolean).join(' ') || 'A customer',
    pickupAddress: request.pickup_address,
    distanceKm: Number(distanceKm.toFixed(1)),
    etaMinutes: Math.max(1, Math.round(distanceKm * 2)),
    estimatedPay: Number(request.pickup_price) + Number(request.service_price),
    bagsEstimate: request.bags ? Math.round(Number(request.bags)) : 1,
  };
}

export function HomeScreen({ navigation }: RootStackScreenProps<'Home'>) {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [earnings, setEarnings] = useState<TodayEarningsSummary | null>(null);
  const [incomingRequest, setIncomingRequest] = useState<DriverRequestItem | null>(null);
  const seenRequestIds = useRef<Set<string>>(new Set());
  const respondingRef = useRef(false);

  useEffect(() => {
    syncPushNotifications().catch(() => {});
  }, []);

  const loadTodayEarnings = useCallback(async () => {
    try {
      const res = await driverService.getMyRequests({ status: 'completed', limit: 100 });
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const todaysJobs = res.data.items.filter(
        (r) => r.completed_at && new Date(r.completed_at) >= startOfToday,
      );
      const totalGHS = todaysJobs.reduce(
        (sum, r) => sum + Number(r.pickup_price) + Number(r.service_price),
        0,
      );
      const bagsCollected = todaysJobs.reduce((sum, r) => sum + Number(r.bags ?? 0), 0);
      setEarnings({ totalGHS, completedJobs: todaysJobs.length, bagsCollected });
    } catch {
      // non-critical — leave earnings card in its loading state
    }
  }, []);

  useEffect(() => {
    loadTodayEarnings();
  }, [loadTodayEarnings]);

  // Drivers are always available while logged in (see useDriverPresence).
  // Polling is the real "incoming request" mechanism — push notifications
  // are a best-effort supplement when the app is backgrounded.
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      if (respondingRef.current) return;
      try {
        // "paid" is included because a customer can pay upfront before the
        // driver responds, which moves status off "pending" without a driver
        // decision ever having happened.
        const res = await driverService.getMyRequests({ status: 'pending,paid', limit: 1 });
        if (cancelled) return;
        const pending = res.data.items[0];
        if (pending && !seenRequestIds.current.has(pending.id)) {
          // Keep the same object reference across polls for a request already
          // being shown — replacing it every tick would reset the modal's
          // response countdown even though nothing about the request changed.
          setIncomingRequest((current) => (current?.id === pending.id ? current : pending));
        }
      } catch {
        // transient network error — try again next tick
      }
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleRespond = async (response: 'accept' | 'decline') => {
    if (!incomingRequest) return;
    const request = incomingRequest;
    seenRequestIds.current.add(request.id);
    setIncomingRequest(null);
    respondingRef.current = true;
    try {
      await driverService.updateRequestStatus(request.id, response === 'accept' ? 'accepted' : 'cancelled');
      if (response === 'accept') {
        navigation.navigate('JobDetail', { jobId: request.id });
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      respondingRef.current = false;
    }
  };

  const initials = user
    ? (`${user.firstname?.[0] ?? ''}${user.lastname?.[0] ?? ''}`.toUpperCase() || 'ZB')
    : 'ZB';
  const firstName = user?.firstname || 'Driver';
  const scrollBottomPadding = useScrollBottomPadding({ withBottomNav: true });

  return (
    <ScreenShell edges={['top', 'left', 'right']}>
      <ScreenHeader onMenuPress={() => dispatch(toggleSidebar())} horizontalPadding={20} />
      <ScrollView
        contentContainerStyle={{ padding: moderateScale(20), gap: moderateScale(16), paddingBottom: scrollBottomPadding }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(13), color: colors.textSub }}>
              Welcome back,
            </Text>
            <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(20), color: colors.text }}>
              {firstName}
            </Text>
          </View>
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
        </View>

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(10) }}>
            <View
              style={{
                width: moderateScale(10),
                height: moderateScale(10),
                borderRadius: moderateScale(5),
                backgroundColor: COLORS.brandGreen,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(15), color: colors.text }}>
                You're online
              </Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(12), color: colors.textSub }}>
                Sharing your location so nearby customers can find you.
              </Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text
            style={{
              fontFamily: 'Poppins_600SemiBold',
              fontSize: moderateScale(14),
              color: colors.text,
              marginBottom: moderateScale(12),
            }}
          >
            Today's earnings
          </Text>
          {earnings ? (
            <View>
              <Text
                style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(22), color: COLORS.brandGreen }}
              >
                GHS {earnings.totalGHS.toFixed(2)}
              </Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(12), color: colors.textSub }}>
                {earnings.completedJobs} jobs • {earnings.bagsCollected} bags
              </Text>
            </View>
          ) : (
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(13), color: colors.textSub }}>
              Loading…
            </Text>
          )}
        </Card>

        <Card>
          <View style={{ gap: moderateScale(12), alignItems: 'center' }}>
            <MaterialCommunityIcons name="radar" size={moderateScale(36)} color={COLORS.brandGreen} />
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(14), color: colors.text }}>
              Waiting for job requests
            </Text>
            <Text
              style={{
                fontFamily: 'Poppins_400Regular',
                fontSize: moderateScale(12),
                color: colors.textSub,
                textAlign: 'center',
              }}
            >
              You'll be notified the moment a customer requests a pickup with you.
            </Text>
          </View>
        </Card>
      </ScrollView>

      <IncomingRequestModal
        request={incomingRequest ? toIncomingJobRequest(incomingRequest) : null}
        onRespond={handleRespond}
      />

      <AppBottomNav activeTab="home" navigation={navigation} />
    </ScreenShell>
  );
}
