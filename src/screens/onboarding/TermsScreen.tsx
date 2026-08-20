import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { ScreenShell } from '../../components/common/ScreenShell';
import { moderateScale } from '../../utils/scale';
import { useScrollBottomPadding } from '../../utils/screenInsets';
import { acceptTerms, setApplicationStatus } from '../../slices/driverProfile/driverProfileSlice';
import { updateUser as updateAuthUser } from '../../slices/auth/authSlice';
import { userService } from '../../api/userService';
import { driverService } from '../../api/driverService';
import { uploadKycDocument } from '../../services/kycUploadService';
import { saveAuthUser } from '../../utils/authStorage';
import { handleApiError } from '../../utils/handleApiError';
import { DRIVER_TERMS_TEXT } from '../../constants/legalText';
import { COLORS } from '../../constants/colors';
import { SHARED_DARK } from '../../constants/darkTheme';
import type { RootState } from '../../store';
import type { RootStackScreenProps } from '../../navigation/types';

export function TermsScreen({ navigation }: RootStackScreenProps<'Terms'>) {
  const { isDark, colors } = useTheme();
  const activeGreen = isDark ? SHARED_DARK.accentGreen : COLORS.brandGreen;
  const dispatch = useDispatch();
  const kyc = useSelector((state: RootState) => state.driverProfile.kyc);
  const user = useSelector((state: RootState) => state.auth.user);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollBottomPadding = useScrollBottomPadding();

  const handleAccept = async () => {
    if (!user || !kyc) return;
    setLoading(true);
    try {
      const [ghanaCardPhoto, driversLicensePhoto, vehiclePhoto, profilePhoto] = await Promise.all([
        kyc.ghanaCardImage ? uploadKycDocument(user.id, 'ghana-card', kyc.ghanaCardImage) : null,
        kyc.driversLicenseImage
          ? uploadKycDocument(user.id, 'drivers-license', kyc.driversLicenseImage)
          : null,
        kyc.vehiclePhoto ? uploadKycDocument(user.id, 'vehicle', kyc.vehiclePhoto) : null,
        kyc.profilePhoto ? uploadKycDocument(user.id, 'profile', kyc.profilePhoto) : null,
      ]);

      const acceptResult = await userService.acceptTerms();
      await userService.updateUser(user.id, {
        firstname: user.firstname,
        lastname: user.lastname,
        ...(profilePhoto ? { profile_picture: profilePhoto } : {}),
      });
      await driverService.updateMe({
        vehicle_plate: kyc.plateNumber,
        vehicle_type: kyc.vehicleType,
        ghana_card_number: kyc.ghanaCardNumber,
        drivers_license_number: kyc.driversLicenseNumber,
        ...(ghanaCardPhoto ? { ghana_card_photo: ghanaCardPhoto } : {}),
        ...(driversLicensePhoto ? { drivers_license_photo: driversLicensePhoto } : {}),
        ...(vehiclePhoto ? { vehicle_photo: vehiclePhoto } : {}),
        ...(profilePhoto ? { profile_picture: profilePhoto } : {}),
      });

      const updatedUser = { ...user, ...acceptResult.data.user, ...(profilePhoto ? { profile_picture: profilePhoto } : {}) };
      dispatch(updateAuthUser(updatedUser));
      await saveAuthUser(updatedUser);
      dispatch(acceptTerms());
      dispatch(setApplicationStatus({ status: 'approved' }));
      navigation.reset({ index: 0, routes: [{ name: 'ApplicationStatus' }] });
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell>
      <ScreenHeader
        title="Driver terms"
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <View style={{ flex: 1, padding: moderateScale(24), gap: moderateScale(16) }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: scrollBottomPadding }}>
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
            borderColor: agreed ? activeGreen : colors.border,
            backgroundColor: agreed ? activeGreen : 'transparent',
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
    </ScreenShell>
  );
}
