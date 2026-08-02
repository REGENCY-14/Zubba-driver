import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { StatusPill, StatusKind } from '../../components/common/StatusPill';
import { MockMapView } from '../../components/common/MockMapView';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { moderateScale } from '../../utils/scale';
import { COLORS } from '../../constants/colors';
import { getJobById, updateJobStatus, Job, JobStatus } from '../../services/mock/jobsMock';
import type { RootStackScreenProps } from '../../navigation/types';

const STATUS_LABEL: Record<JobStatus, string> = {
  en_route: 'En route',
  arrived: 'Arrived',
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function statusPillKind(status: JobStatus): StatusKind {
  if (status === 'completed') return 'success';
  if (status === 'cancelled') return 'failed';
  return 'pending';
}

export function JobDetailScreen({ navigation, route }: RootStackScreenProps<'JobDetail'>) {
  const { jobId } = route.params;
  const { colors } = useTheme();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getJobById(jobId).then(j => setJob(j ?? null));
  }, [jobId]);

  const handleArrived = async () => {
    if (!job) return;
    setLoading(true);
    await updateJobStatus(job.id, 'arrived');
    setLoading(false);
    setJob({ ...job, status: 'arrived' });
  };

  const handleUnavailableAction = (action: string) => {
    Alert.alert('Not available in this preview', `${action} isn't wired up in this UI-only build.`);
  };

  if (!job) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(13), color: colors.textSub }}>
          Loading job…
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader
        title={job.customerName}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        horizontalPadding={20}
      />
      <ScrollView
        contentContainerStyle={{ padding: moderateScale(20), gap: moderateScale(16), paddingBottom: moderateScale(48) }}
      >
      <MockMapView distanceKm={job.distanceKm} etaMinutes={job.etaMinutes} />

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ gap: moderateScale(4), flex: 1 }}>
            <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(17), color: colors.text }}>
              {job.customerName}
            </Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(13), color: colors.textSub }}>
              {job.pickupAddress}
            </Text>
          </View>
          <StatusPill status={statusPillKind(job.status)} label={STATUS_LABEL[job.status]} />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: moderateScale(16) }}>
          <View>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(11), color: colors.textMuted }}>
              Distance
            </Text>
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(14), color: colors.text }}>
              {job.distanceKm} km • {job.etaMinutes} min
            </Text>
          </View>
          <View>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(11), color: colors.textMuted }}>
              Est. pay
            </Text>
            <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(14), color: COLORS.brandGreen }}>
              GHS {(job.amountEarned ?? job.estimatedPay).toFixed(2)}
            </Text>
          </View>
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: moderateScale(12) }}>
        <View style={{ flex: 1 }}>
          <Button
            label="Call"
            variant="secondary"
            leftIcon={<MaterialCommunityIcons name="phone-outline" size={moderateScale(16)} color={colors.text} />}
            onPress={() => handleUnavailableAction('Calling')}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            label="Message"
            variant="secondary"
            leftIcon={<MaterialCommunityIcons name="message-outline" size={moderateScale(16)} color={colors.text} />}
            onPress={() => handleUnavailableAction('Messaging')}
          />
        </View>
      </View>

      {job.status === 'en_route' && <Button label="Arrived" size="lg" onPress={handleArrived} loading={loading} />}

      {job.status === 'arrived' && (
        <Button
          label="Enter collection code"
          size="lg"
          onPress={() => navigation.navigate('CollectionCode', { jobId: job.id })}
        />
      )}

      {job.status === 'scheduled' && job.scheduledFor && (
        <Card>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(13), color: colors.textSub }}>
            Scheduled for{' '}
            {new Date(job.scheduledFor).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
          </Text>
        </Card>
      )}
      </ScrollView>
    </View>
  );
}
