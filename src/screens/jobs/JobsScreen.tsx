import { useCallback, useEffect, useState } from 'react';
import { Pressable, SectionList, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { AppBottomNav } from '../../components/AppBottomNav';
import { StatusPill, StatusKind } from '../../components/common/StatusPill';
import { EmptyState } from '../../components/common/EmptyState';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { moderateScale } from '../../utils/scale';
import { COLORS } from '../../constants/colors';
import { driverService } from '../../api/driverService';
import { toJob, Job, JobStatus } from '../../utils/jobMapping';
import { toggleSidebar } from '../../slices/ui/uiSlice';
import type { RootStackScreenProps } from '../../navigation/types';

type JobsTab = 'active' | 'upcoming' | 'history';

const TABS: { key: JobsTab; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'history', label: 'History' },
];

const STATUS_LABEL: Record<JobStatus, string> = {
  paid: 'Paid',
  accepted: 'Accepted',
  en_route: 'En route',
  arrived: 'Arrived',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function statusPillKind(status: JobStatus): StatusKind {
  if (status === 'completed') return 'success';
  if (status === 'cancelled') return 'failed';
  return 'pending';
}

const EMPTY_COPY: Record<JobsTab, { title: string; subtitle: string }> = {
  active: {
    title: 'No active jobs',
    subtitle: "Jobs you've accepted and are working on will show up here.",
  },
  upcoming: {
    title: 'No upcoming jobs',
    subtitle: 'Scheduled pickup assignments for drivers are not available yet.',
  },
  history: {
    title: 'No job history yet',
    subtitle: 'Completed and cancelled jobs will show up here.',
  },
};

export function JobsScreen({ navigation }: RootStackScreenProps<'Jobs'>) {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<JobsTab>('active');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (tab: JobsTab) => {
    setLoading(true);
    setJobs([]);

    if (tab === 'upcoming') {
      // No backend endpoint exposes a driver's upcoming scheduled pickups yet
      // (schedules are customer-only) — real empty state, not fabricated data.
      setLoading(false);
      return;
    }

    try {
      const status = tab === 'active' ? 'paid,accepted,en_route,arrived' : 'completed,cancelled';
      const res = await driverService.getMyRequests({ status, limit: 50 });
      setJobs(res.data.items.map(toJob));
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(activeTab);
  }, [activeTab, load]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Jobs" onMenuPress={() => dispatch(toggleSidebar())} horizontalPadding={20} />
      <View style={{ paddingHorizontal: moderateScale(20), paddingTop: moderateScale(4) }}>
        <View style={{ flexDirection: 'row', gap: moderateScale(8) }}>
          {TABS.map(tab => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
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
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <SectionList
        sections={[{ title: null as string | null, data: jobs }]}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: moderateScale(20), paddingBottom: moderateScale(140), flexGrow: 1 }}
        ListEmptyComponent={
          loading ? (
            <Text
              style={{
                fontFamily: 'Poppins_400Regular',
                fontSize: moderateScale(13),
                color: colors.textSub,
                textAlign: 'center',
                padding: moderateScale(32),
              }}
            >
              Loading…
            </Text>
          ) : (
            <EmptyState title={EMPTY_COPY[activeTab].title} subtitle={EMPTY_COPY[activeTab].subtitle} />
          )
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
            accessibilityRole="button"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: moderateScale(14),
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              gap: moderateScale(12),
              minHeight: moderateScale(44),
            }}
          >
            <View style={{ flex: 1, gap: moderateScale(4) }}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(14), color: colors.text }}>
                {item.customerName}
              </Text>
              <Text
                style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(12), color: colors.textSub }}
                numberOfLines={1}
              >
                {item.pickupAddress}
              </Text>
              {item.scheduledFor ? (
                <Text
                  style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(11), color: colors.textMuted }}
                >
                  {new Date(item.scheduledFor).toLocaleString('en-GB', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </Text>
              ) : null}
            </View>
            <View style={{ alignItems: 'flex-end', gap: moderateScale(6) }}>
              <StatusPill status={statusPillKind(item.status)} label={STATUS_LABEL[item.status]} />
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(13), color: colors.text }}>
                GHS {(item.amountEarned ?? item.estimatedPay).toFixed(2)}
              </Text>
            </View>
          </Pressable>
        )}
      />

      <AppBottomNav activeTab="jobs" navigation={navigation} />
    </View>
  );
}
