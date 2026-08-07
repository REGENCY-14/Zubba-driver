import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner-native';
import { useTheme } from '../../context/ThemeContext';
import { AppBottomNav } from '../../components/AppBottomNav';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { ScreenShell } from '../../components/common/ScreenShell';
import { moderateScale } from '../../utils/scale';
import { useScrollBottomPadding } from '../../utils/screenInsets';
import { COLORS } from '../../constants/colors';
import { driverService } from '../../api/driverService';
import { walletService } from '../../api/walletService';
import { toJob, Job } from '../../utils/jobMapping';
import { handleApiError } from '../../utils/handleApiError';
import { toggleSidebar } from '../../slices/ui/uiSlice';
import type { RootStackScreenProps } from '../../navigation/types';

type EarningsPeriod = 'today' | 'week' | 'month';
interface WalletBalance {
  availableGHS: number;
}

const PERIODS: { key: EarningsPeriod; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

function isWithinPeriod(dateIso: string, period: EarningsPeriod): boolean {
  const date = new Date(dateIso);
  const now = new Date();
  if (period === 'today') return date.toDateString() === now.toDateString();
  const diffDays = (now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000);
  return period === 'week' ? diffDays >= 0 && diffDays <= 7 : diffDays >= 0 && diffDays <= 30;
}

export function EarningsScreen({ navigation, route }: RootStackScreenProps<'Earnings'>) {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const [period, setPeriod] = useState<EarningsPeriod>('week');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<WalletBalance | null>(null);

  const load = useCallback(async (p: EarningsPeriod) => {
    setLoading(true);
    try {
      const res = await driverService.getMyRequests({ status: 'completed', limit: 200 });
      const completed = res.data.items
        .map(toJob)
        .filter((job) => job.completedAt && isWithinPeriod(job.completedAt, p));
      setJobs(completed);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(period);
  }, [period, load]);

  useEffect(() => {
    walletService
      .getWallet()
      .then((res) => setBalance({ availableGHS: res.data.wallet.available_balance }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (route.params?.credited) {
      toast.success('Wallet topped up successfully');
      walletService
        .getWallet()
        .then((res) => setBalance({ availableGHS: res.data.wallet.available_balance }))
        .catch(() => {});
      navigation.setParams({ credited: undefined });
    }
  }, [navigation, route.params?.credited]);

  const totalGHS = jobs.reduce((sum, j) => sum + (j.amountEarned ?? 0), 0);
  const bagsCollected = jobs.reduce((sum, j) => sum + (j.bags ?? 0), 0);
  const scrollBottomPadding = useScrollBottomPadding({ withBottomNav: true });

  return (
    <ScreenShell edges={['top', 'left', 'right']}>
      <ScreenHeader title="Earnings" onMenuPress={() => dispatch(toggleSidebar())} horizontalPadding={20} />
      <ScrollView
        contentContainerStyle={{ padding: moderateScale(20), gap: moderateScale(16), paddingBottom: scrollBottomPadding }}
      >
        <Card>
          <View style={{ gap: moderateScale(14) }}>
            <View>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(12), color: colors.textSub }}>
                Wallet balance
              </Text>
              <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(24), color: colors.text }}>
                {balance ? `GHS ${balance.availableGHS.toFixed(2)}` : '…'}
              </Text>
            </View>
            {/* No fixed width — a longer translated "Withdraw" label sizes the button, not the reverse. */}
            <View style={{ flexDirection: 'row', gap: moderateScale(10) }}>
              <View style={{ flex: 1 }}>
                <Button
                  label="Top up"
                  variant="secondary"
                  onPress={() => navigation.navigate('DepositMethod')}
                  disabled={!balance}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button label="Withdraw" onPress={() => navigation.navigate('Withdraw')} disabled={!balance} />
              </View>
            </View>
          </View>
        </Card>

        <View style={{ flexDirection: 'row', gap: moderateScale(8) }}>
          {PERIODS.map(p => {
            const active = period === p.key;
            return (
              <Pressable
                key={p.key}
                onPress={() => setPeriod(p.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={{
                  flex: 1,
                  minHeight: moderateScale(44),
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: moderateScale(12),
                  backgroundColor: active ? COLORS.brandGreen : colors.surface,
                  borderWidth: 1,
                  borderColor: active ? COLORS.brandGreen : colors.border,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Poppins_500Medium',
                    fontSize: moderateScale(13),
                    color: active ? '#FFFFFF' : colors.text,
                  }}
                >
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Card>
          {loading ? (
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(13), color: colors.textSub }}>
              Loading…
            </Text>
          ) : (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(11), color: colors.textMuted }}>
                  Earned
                </Text>
                <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(20), color: COLORS.brandGreen }}>
                  GHS {totalGHS.toFixed(2)}
                </Text>
              </View>
              <View>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(11), color: colors.textMuted }}>
                  Jobs
                </Text>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(20), color: colors.text }}>
                  {jobs.length}
                </Text>
              </View>
              <View>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(11), color: colors.textMuted }}>
                  Bags
                </Text>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(20), color: colors.text }}>
                  {bagsCollected}
                </Text>
              </View>
            </View>
          )}
        </Card>

        <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(14), color: colors.text }}>
          Per-job breakdown
        </Text>

        {!loading && jobs.length === 0 ? (
          <Card>
            <EmptyState
              title="No completed jobs"
              subtitle={`No pickups completed this ${period === 'today' ? 'day' : period}.`}
            />
          </Card>
        ) : (
          jobs.map(job => (
            <View
              key={job.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: moderateScale(12),
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                gap: moderateScale(12),
              }}
            >
              <View style={{ flex: 1, gap: moderateScale(2) }}>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(13), color: colors.text }}>
                  {job.customerName}
                </Text>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(11), color: colors.textSub }}>
                  {job.completedAt
                    ? new Date(job.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                    : ''}{' '}
                  • {job.bags ?? 0} bag{job.bags !== 1 ? 's' : ''}
                </Text>
              </View>
              <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(14), color: COLORS.brandGreen }}>
                + GHS {(job.amountEarned ?? 0).toFixed(2)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <AppBottomNav activeTab="earnings" navigation={navigation} />
    </ScreenShell>
  );
}
