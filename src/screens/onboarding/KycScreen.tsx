import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/common/FormField';
import { ImagePickerField } from '../../components/common/ImagePickerField';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { ScreenShell } from '../../components/common/ScreenShell';
import { moderateScale } from '../../utils/scale';
import { useScrollBottomPadding } from '../../utils/screenInsets';
import { submitKyc as submitKycAction } from '../../slices/driverProfile/driverProfileSlice';
import { updateUser } from '../../slices/auth/authSlice';
import { saveAuthUser } from '../../utils/authStorage';
import type { VehicleType } from '../../slices/driverProfile/driverProfile.types';
import type { RootStackScreenProps } from '../../navigation/types';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

const VEHICLE_TYPES: { key: VehicleType; label: string }[] = [
  { key: 'tricycle', label: 'Tricycle' },
  { key: 'motorbike', label: 'Motorbike' },
  { key: 'van', label: 'Van' },
  { key: 'truck', label: 'Truck' },
];

export function KycScreen({ navigation }: RootStackScreenProps<'Kyc'>) {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const kyc = useSelector((state: RootState) => state.driverProfile.kyc);

  const [firstname, setFirstname] = useState(user?.firstname ?? '');
  const [lastname, setLastname] = useState(user?.lastname ?? '');
  const [ghanaCardNumber, setGhanaCardNumber] = useState(kyc?.ghanaCardNumber ?? '');
  const [ghanaCardImage, setGhanaCardImage] = useState<string | null>(kyc?.ghanaCardImage ?? null);
  const [driversLicenseNumber, setDriversLicenseNumber] = useState(kyc?.driversLicenseNumber ?? '');
  const [driversLicenseImage, setDriversLicenseImage] = useState<string | null>(
    kyc?.driversLicenseImage ?? null
  );
  const [vehicleType, setVehicleType] = useState<VehicleType>(kyc?.vehicleType ?? 'tricycle');
  const [plateNumber, setPlateNumber] = useState(kyc?.plateNumber ?? '');
  const [vehiclePhoto, setVehiclePhoto] = useState<string | null>(kyc?.vehiclePhoto ?? null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(kyc?.profilePhoto ?? null);
  const scrollBottomPadding = useScrollBottomPadding();

  const canContinue = Boolean(
    firstname.trim() &&
      lastname.trim() &&
      ghanaCardNumber.trim() &&
      ghanaCardImage &&
      driversLicenseNumber.trim() &&
      driversLicenseImage &&
      plateNumber.trim() &&
      vehiclePhoto &&
      profilePhoto
  );

  const handleContinue = () => {
    dispatch(
      submitKycAction({
        ghanaCardNumber,
        ghanaCardImage,
        driversLicenseNumber,
        driversLicenseImage,
        vehicleType,
        plateNumber,
        vehiclePhoto,
        profilePhoto,
      })
    );
    dispatch(updateUser({ firstname, lastname, profile_picture: profilePhoto }));
    if (user) {
      saveAuthUser({ ...user, firstname, lastname, profile_picture: profilePhoto });
    }
    navigation.navigate('Terms');
  };

  return (
    <ScreenShell>
      <ScreenHeader
        onBack={() =>
          // VerifyOtpScreen reaches this screen via navigation.reset (not
          // navigate), so there's normally nothing to go back to — fall back
          // to Welcome instead of hiding the back button altogether.
          navigation.canGoBack()
            ? navigation.goBack()
            : navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] })
        }
      />
      <ScrollView
        contentContainerStyle={{ padding: moderateScale(24), gap: moderateScale(16), paddingBottom: scrollBottomPadding }}
      >
      <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(22), color: colors.text }}>
        Driver verification
      </Text>
      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(13), color: colors.textSub }}>
        We need a few details before you can start accepting jobs.
      </Text>

      <FormField label="First name" value={firstname} onChangeText={setFirstname} />
      <FormField label="Last name" value={lastname} onChangeText={setLastname} />

      <FormField
        label="Ghana Card number"
        value={ghanaCardNumber}
        onChangeText={setGhanaCardNumber}
        placeholder="GHA-XXXXXXXXX-X"
        autoCapitalize="characters"
      />
      <ImagePickerField label="Ghana Card photo" value={ghanaCardImage} onChange={setGhanaCardImage} />

      <FormField
        label="Driver's license number"
        value={driversLicenseNumber}
        onChangeText={setDriversLicenseNumber}
      />
      <ImagePickerField
        label="Driver's license photo"
        value={driversLicenseImage}
        onChange={setDriversLicenseImage}
      />

      <View style={{ gap: moderateScale(8) }}>
        <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: moderateScale(13), color: colors.text }}>
          Vehicle type
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: moderateScale(8) }}>
          {VEHICLE_TYPES.map(v => {
            const active = vehicleType === v.key;
            return (
              <Pressable
                key={v.key}
                onPress={() => setVehicleType(v.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={{
                  paddingHorizontal: moderateScale(16),
                  paddingVertical: moderateScale(10),
                  minHeight: moderateScale(44),
                  justifyContent: 'center',
                  borderRadius: 9999,
                  backgroundColor: active ? '#31973D' : colors.surface,
                  borderWidth: 1,
                  borderColor: active ? '#31973D' : colors.border,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Poppins_500Medium',
                    fontSize: moderateScale(13),
                    color: active ? '#FFFFFF' : colors.text,
                  }}
                >
                  {v.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FormField
        label="Plate number"
        value={plateNumber}
        onChangeText={setPlateNumber}
        autoCapitalize="characters"
        placeholder="GX-1234-24"
      />
      <ImagePickerField label="Vehicle photo" value={vehiclePhoto} onChange={setVehiclePhoto} />
      <ImagePickerField label="Profile photo" value={profilePhoto} onChange={setProfilePhoto} />

      <Button label="Continue" onPress={handleContinue} disabled={!canContinue} />
      </ScrollView>
    </ScreenShell>
  );
}
