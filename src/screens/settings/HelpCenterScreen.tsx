import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { moderateScale } from '../../utils/scale';
import { getFaqs, Faq } from '../../services/mock/supportMock';
import type { RootStackScreenProps } from '../../navigation/types';

export function HelpCenterScreen({ navigation }: RootStackScreenProps<'HelpCenter'>) {
  const { colors } = useTheme();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    getFaqs().then(setFaqs);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader
        title="Help & support"
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <ScrollView
        contentContainerStyle={{ padding: moderateScale(24), gap: moderateScale(16), paddingBottom: moderateScale(48) }}
      >
      {faqs.map(faq => {
        const expanded = expandedId === faq.id;
        return (
          <Pressable
            key={faq.id}
            onPress={() => setExpandedId(expanded ? null : faq.id)}
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            style={{ minHeight: moderateScale(44) }}
          >
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text
                  style={{
                    fontFamily: 'Poppins_600SemiBold',
                    fontSize: moderateScale(14),
                    color: colors.text,
                    flex: 1,
                  }}
                >
                  {faq.question}
                </Text>
                <MaterialCommunityIcons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={moderateScale(20)}
                  color={colors.textSub}
                />
              </View>
              {expanded && (
                <Text
                  style={{
                    fontFamily: 'Poppins_400Regular',
                    fontSize: moderateScale(13),
                    color: colors.textSub,
                    marginTop: moderateScale(10),
                    lineHeight: moderateScale(19),
                  }}
                >
                  {faq.answer}
                </Text>
              )}
            </Card>
          </Pressable>
        );
      })}

      <Button label="Report an issue" variant="secondary" onPress={() => navigation.navigate('ReportIssue')} />
      </ScrollView>
    </View>
  );
}
