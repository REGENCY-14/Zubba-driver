import { Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../../context/ThemeContext';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { ScreenShell } from '../../components/common/ScreenShell';
import { moderateScale } from '../../utils/scale';
import { useScrollBottomPadding } from '../../utils/screenInsets';
import { COLORS } from '../../constants/colors';
import { depositMethods } from '../../constants/paymentMethods';
import type { RootStackScreenProps } from '../../navigation/types';

export function DepositMethodScreen({ navigation }: RootStackScreenProps<'DepositMethod'>) {
  const { colors } = useTheme();
  const scrollBottomPadding = useScrollBottomPadding();

  return (
    <ScreenShell>
      <ScreenHeader onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} />
      <ScrollView
        contentContainerStyle={{
          padding: moderateScale(24),
          gap: moderateScale(18),
          paddingBottom: scrollBottomPadding,
        }}
      >
        <View style={{ gap: moderateScale(4) }}>
          <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(22), color: colors.text }}>
            Top up wallet
          </Text>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(13), color: colors.textSub }}>
            Choose how you want to add funds via Paystack.
          </Text>
        </View>

        {depositMethods.map((method) => (
          <Pressable
            key={method.id}
            onPress={() =>
              navigation.navigate('CreditAccount', {
                provider: method.id === 'card' ? 'card' : 'mtn',
                methodLabel: method.title,
                channel: method.id,
              })
            }
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: moderateScale(12),
              padding: moderateScale(16),
              borderRadius: moderateScale(16),
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              minHeight: moderateScale(56),
            }}
          >
            <View
              style={{
                width: moderateScale(40),
                height: moderateScale(40),
                borderRadius: moderateScale(20),
                backgroundColor: `${COLORS.brandGreen}1A`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons
                name={method.iconName}
                size={moderateScale(20)}
                color={COLORS.brandGreen}
              />
            </View>
            <Text
              style={{
                flex: 1,
                fontFamily: 'Poppins_500Medium',
                fontSize: moderateScale(15),
                color: colors.text,
              }}
            >
              {method.title}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={moderateScale(22)} color={colors.textSub} />
          </Pressable>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}
