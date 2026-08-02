import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { AppBottomNav } from '../../components/AppBottomNav';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { moderateScale } from '../../utils/scale';
import { COLORS } from '../../constants/colors';
import { getEarningsBreakdown, EarningsPeriod, Job } from '../../services/mock/jobsMock';
import { getWalletBalance, WalletBalance } from '../../services/mock/walletMock';
import { toggleSidebar } from '../../slices/ui/uiSlice';
import type { RootStackScreenProps } from '../../navigation/types';

const PERIODS: { key: EarningsPeriod; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

export function EarningsScreen({ navigation }: RootStackScreenProps<'Earnings'>) {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const [period, setPeriod] = useState<EarningsPeriod>('week');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<WalletBalance | null>(null);

  const load = useCallback(async (p: EarningsPeriod) => {
    setLoading(true);
    const data = await getEarningsBreakdown(p);
    setJobs(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(period);
  }, [period, load]);

  useEffect(() => {
    getWalletBalance().then(setBalance);
  }, []);

  const totalGHS = jobs.reduce((sum, j) => sum + (j.amountEarned ?? 0), 0);
  const bagsCollected = jobs.reduce((sum, j) => sum + (j.bags ?? 0), 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Earnings" onMenuPress={() => dispatch(toggleSidebar())} horizontalPadding={20} />
      <ScrollView
        contentContainerStyle={{ padding: moderateScale(20), gap: moderateScale(16), paddingBottom: moderateScale(140) }}
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
            <Button label="Withdraw" onPress={() => navigation.navigate('Withdraw')} disabled={!balance} />
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
    </View>
  );
}
