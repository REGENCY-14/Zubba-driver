import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { moderateScale } from '../../utils/scale';
import { acceptTerms, setApplicationStatus } from '../../slices/driverProfile/driverProfileSlice';
import { submitKycApplication } from '../../services/mock/kycMock';
import { DRIVER_TERMS_TEXT } from '../../constants/legalText';
import type { RootStackScreenProps } from '../../navigation/types';

export function TermsScreen({ navigation }: RootStackScreenProps<'Terms'>) {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    dispatch(acceptTerms());
    const result = await submitKycApplication();
    dispatch(setApplicationStatus({ status: result.applicationStatus }));
    setLoading(false);
    navigation.reset({ index: 0, routes: [{ name: 'ApplicationStatus' }] });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader
        title="Driver terms"
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <View style={{ flex: 1, padding: moderateScale(24), gap: moderateScale(16) }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: moderateScale(16) }}>
        <Text
          style={{
            fontFamily: 'Poppins_400Regular',
            fontSize: moderateScale(13),
            color: colors.textSub,
            lineHeight: moderateScale(20),
          }}
        >
          {DRIVER_TERMS_TEXT}
        </Text>
      </ScrollView>

      <Pressable
        onPress={() => setAgreed(a => !a)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: agreed }}
        accessibilityLabel="I have read and agree to the Driver Terms of Service"
        style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(10), minHeight: moderateScale(44) }}
      >
        <View
          style={{
            width: moderateScale(22),
            height: moderateScale(22),
            borderRadius: moderateScale(6),
            borderWidth: 1.5,
            borderColor: agreed ? '#31973D' : colors.border,
            backgroundColor: agreed ? '#31973D' : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {agreed && <MaterialCommunityIcons name="check" size={moderateScale(16)} color="#FFFFFF" />}
        </View>
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(13), color: colors.text, flex: 1 }}>
          I have read and agree to the Driver Terms of Service
        </Text>
      </Pressable>

      <Button label="Accept & submit application" onPress={handleAccept} disabled={!agreed} loading={loading} />
      </View>
    </View>
  );
}
