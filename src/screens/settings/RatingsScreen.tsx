import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/common/Card';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { ScreenShell } from '../../components/common/ScreenShell';
import { moderateScale } from '../../utils/scale';
import { useScrollBottomPadding } from '../../utils/screenInsets';
import { ratingService, DriverRatingItem, DriverRatingSummary } from '../../api/ratingService';
import { handleApiError } from '../../utils/handleApiError';
import type { RootState } from '../../store';
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
  const user = useSelector((state: RootState) => state.auth.user);
  const [summary, setSummary] = useState<DriverRatingSummary | null>(null);
  const [feedback, setFeedback] = useState<DriverRatingItem[]>([]);
  const scrollBottomPadding = useScrollBottomPadding();

  useEffect(() => {
    if (!user) return;
    ratingService
      .getDriverRating(user.id, { limit: 50 })
      .then((res) => {
        setSummary(res.data);
        setFeedback(res.data.items.filter((item) => item.comment));
      })
      .catch((err) => handleApiError(err));
  }, [user]);

  return (
    <ScreenShell>
      <ScreenHeader
        title="Ratings & performance"
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <ScrollView
        contentContainerStyle={{ padding: moderateScale(24), gap: moderateScale(16), paddingBottom: scrollBottomPadding }}
      >
      <Card>
        {summary ? (
          <View style={{ alignItems: 'center', gap: moderateScale(6) }}>
            <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(36), color: colors.text }}>
              {Number(summary.averageScore).toFixed(1)}
            </Text>
            <Stars rating={Number(summary.averageScore)} />
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

      {summary && Number(summary.totalRatings) > 0 && (
        <Card>
          <View style={{ flexDirection: 'row' }}>
            <StatBlock label="Service" value={Number(summary.serviceRating).toFixed(1)} />
            <StatBlock label="Professionalism" value={Number(summary.professionalismRating).toFixed(1)} />
            <StatBlock label="Eco-friendly" value={Number(summary.ecoFriendlyRating).toFixed(1)} />
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
            <Stars rating={item.score} />
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(11), color: colors.textMuted }}>
              {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </Text>
          </View>
          {item.comment ? (
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(12), color: colors.textSub }}>
              "{item.comment}"
            </Text>
          ) : null}
        </View>
      ))}
      </ScrollView>
    </ScreenShell>
  );
}
