import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/common/Card';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { moderateScale } from '../../utils/scale';
import { getRatingsSummary, getJobFeedback, RatingsSummary, JobFeedback } from '../../services/mock/ratingsMock';
import type { RootStackScreenProps } from '../../navigation/types';

function Stars({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: moderateScale(2) }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <MaterialCommunityIcons
          key={i}
          name={i < Math.round(rating) ? 'star' : 'star-outline'}
          size={moderateScale(14)}
          color="#FEC002"
        />
      ))}
    </View>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: moderateScale(2) }}>
      <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(18), color: colors.text }}>{value}</Text>
      <Text
        style={{
          fontFamily: 'Poppins_400Regular',
          fontSize: moderateScale(11),
          color: colors.textSub,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export function RatingsScreen({ navigation }: RootStackScreenProps<'Ratings'>) {
  const { colors } = useTheme();
  const [summary, setSummary] = useState<RatingsSummary | null>(null);
  const [feedback, setFeedback] = useState<JobFeedback[]>([]);

  useEffect(() => {
    getRatingsSummary().then(setSummary);
    getJobFeedback().then(setFeedback);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader
        title="Ratings & performance"
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <ScrollView
        contentContainerStyle={{ padding: moderateScale(24), gap: moderateScale(16), paddingBottom: moderateScale(48) }}
      >
      <Card>
        {summary ? (
          <View style={{ alignItems: 'center', gap: moderateScale(6) }}>
            <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(36), color: colors.text }}>
              {summary.averageRating.toFixed(1)}
            </Text>
            <Stars rating={summary.averageRating} />
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(12), color: colors.textSub }}>
              from {summary.totalRatings} ratings
            </Text>
          </View>
        ) : (
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(13), color: colors.textSub }}>
            Loading…
          </Text>
        )}
      </Card>

      {summary && (
        <Card>
          <View style={{ flexDirection: 'row' }}>
            <StatBlock label="Acceptance rate" value={`${summary.acceptanceRate}%`} />
            <StatBlock label="Completion rate" value={`${summary.completionRate}%`} />
            <StatBlock label="On-time rate" value={`${summary.onTimeRate}%`} />
          </View>
        </Card>
      )}

      <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(14), color: colors.text }}>
        Recent feedback
      </Text>

      {feedback.map(item => (
        <View
          key={item.id}
          style={{
            paddingVertical: moderateScale(12),
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            gap: moderateScale(4),
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: moderateScale(13), color: colors.text }}>
              {item.customerName}
            </Text>
            <Stars rating={item.rating} />
          </View>
          {item.comment ? (
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(12), color: colors.textSub }}>
              "{item.comment}"
            </Text>
          ) : null}
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(11), color: colors.textMuted }}>
            {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </Text>
        </View>
      ))}
      </ScrollView>
    </View>
  );
}
