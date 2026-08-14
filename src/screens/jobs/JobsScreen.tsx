import { useCallback, useState } from 'react';
import { Pressable, ScrollView, SectionList, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { AppBottomNav } from '../../components/AppBottomNav';
import { StatusPill, StatusKind } from '../../components/common/StatusPill';
import { EmptyState } from '../../components/common/EmptyState';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { ScreenShell } from '../../components/common/ScreenShell';
import { moderateScale } from '../../utils/scale';
import { useScrollBottomPadding } from '../../utils/screenInsets';
import { COLORS } from '../../constants/colors';
import { driverService } from '../../api/driverService';
import { toJob, Job, JobStatus } from '../../utils/jobMapping';
import { toggleSidebar } from '../../slices/ui/uiSlice';
import type { RootStackScreenProps } from '../../navigation/types';

type StatusFilter = 'all' | JobStatus;

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'paid', label: 'Paid' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'en_route', label: 'En route' },
  { key: 'arrived', label: 'Arrived' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const ALL_STATUSES = STATUS_FILTERS.filter((f) => f.key !== 'all')
  .map((f) => f.key)
  .join(',');

const STATUS_LABEL: Record<JobStatus, string> = {
  pending: 'Pending',
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

export function JobsScreen({ navigation }: RootStackScreenProps<'Jobs'>) {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (filter: StatusFilter) => {
    setLoading(true);
    try {
      const status = filter === 'all' ? ALL_STATUSES : filter;
      const res = await driverService.getMyRequests({ status, limit: 50 });
      setJobs(res.data.items.map(toJob));
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(statusFilter);
    }, [load, statusFilter]),
  );

  const scrollBottomPadding = useScrollBottomPadding({ withBottomNav: true });
  const emptySubtitle =
    statusFilter === 'all'
      ? 'New pickup requests and jobs you have worked will show up here.'
      : `No ${STATUS_LABEL[statusFilter].toLowerCase()} jobs right now.`;

  return (
    <ScreenShell edges={['top', 'left', 'right']}>
      <ScreenHeader title="Jobs" onMenuPress={() => dispatch(toggleSidebar())} horizontalPadding={20} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: moderateScale(20),
          paddingTop: moderateScale(4),
          paddingBottom: moderateScale(8),
          gap: moderateScale(8),
        }}
      >
        {STATUS_FILTERS.map((filter) => {
          const active = statusFilter === filter.key;
          return (
            <Pressable
              key={filter.key}
              onPress={() => setStatusFilter(filter.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{
                minHeight: moderateScale(36),
                paddingHorizontal: moderateScale(14),
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: moderateScale(18),
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
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <SectionList
        sections={[{ title: null as string | null, data: jobs }]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: moderateScale(20), paddingBottom: scrollBottomPadding, flexGrow: 1 }}
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
            <EmptyState title="No jobs" subtitle={emptySubtitle} />
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
    </ScreenShell>
  );
}
