import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/common/FormField';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { ScreenShell } from '../../components/common/ScreenShell';
import { moderateScale } from '../../utils/scale';
import { COLORS } from '../../constants/colors';
import { SHARED_DARK } from '../../constants/darkTheme';
import { submitIssueReport, IssueCategory } from '../../services/mock/supportMock';
import type { RootStackScreenProps } from '../../navigation/types';

const CATEGORIES: { key: IssueCategory; label: string }[] = [
  { key: 'payment', label: 'Payment' },
  { key: 'vehicle', label: 'Vehicle' },
  { key: 'customer_behavior', label: 'Customer behavior' },
  { key: 'app_bug', label: 'App bug' },
  { key: 'other', label: 'Other' },
];

export function ReportIssueScreen({ navigation }: RootStackScreenProps<'ReportIssue'>) {
  const { isDark, colors } = useTheme();
  const activeGreen = isDark ? SHARED_DARK.accentGreen : COLORS.brandGreen;
  const [category, setCategory] = useState<IssueCategory>('app_bug');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketRef, setTicketRef] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await submitIssueReport(category, description.trim());
    setSubmitting(false);
    setTicketRef(result.ticketRef);
  };

  if (ticketRef) {
    return (
      <ScreenShell>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: moderateScale(24),
            gap: moderateScale(16),
          }}
        >
        <MaterialCommunityIcons name="check-decagram" size={moderateScale(56)} color={activeGreen} />
        <Text
          style={{
            fontFamily: 'Poppins_700Bold',
            fontSize: moderateScale(18),
            color: colors.text,
            textAlign: 'center',
          }}
        >
          Report submitted
        </Text>
        <Text
          style={{
            fontFamily: 'Poppins_400Regular',
            fontSize: moderateScale(13),
            color: colors.textSub,
            textAlign: 'center',
          }}
        >
          Ticket {ticketRef}. Our support team will follow up if needed.
        </Text>
        <Button label="Done" onPress={() => navigation.goBack()} />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <ScreenHeader
        title="Report an issue"
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <View style={{ flex: 1, padding: moderateScale(24), gap: moderateScale(18) }}>
      <View style={{ gap: moderateScale(8) }}>
        <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: moderateScale(13), color: colors.text }}>
          Category
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: moderateScale(8) }}>
          {CATEGORIES.map(c => {
            const active = category === c.key;
            return (
              <Pressable
                key={c.key}
                onPress={() => setCategory(c.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={{
                  paddingHorizontal: moderateScale(14),
                  paddingVertical: moderateScale(10),
                  minHeight: moderateScale(44),
                  justifyContent: 'center',
                  borderRadius: 9999,
                  backgroundColor: active ? activeGreen : colors.surface,
                  borderWidth: 1,
                  borderColor: active ? activeGreen : colors.border,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Poppins_500Medium',
                    fontSize: moderateScale(12),
                    color: active ? '#FFFFFF' : colors.text,
                  }}
                >
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FormField
        label="Describe what happened"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={5}
        style={{ height: moderateScale(120), textAlignVertical: 'top', paddingTop: moderateScale(12) }}
        placeholder="Include as much detail as you can…"
      />

      <Button
        label="Submit report"
        size="lg"
        onPress={handleSubmit}
        disabled={!description.trim()}
        loading={submitting}
      />
      </View>
    </ScreenShell>
  );
}
