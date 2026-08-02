import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/common/FormField';
import { ImagePickerField } from '../../components/common/ImagePickerField';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { moderateScale } from '../../utils/scale';
import { submitKyc } from '../../slices/driverProfile/driverProfileSlice';
import type { VehicleType } from '../../slices/driverProfile/driverProfile.types';
import type { RootState } from '../../store';
import type { RootStackScreenProps } from '../../navigation/types';

const VEHICLE_TYPES: { key: VehicleType; label: string }[] = [
  { key: 'tricycle', label: 'Tricycle' },
  { key: 'motorbike', label: 'Motorbike' },
  { key: 'van', label: 'Van' },
  { key: 'truck', label: 'Truck' },
];

// Re-upload/edit surface for the same KYC data captured during onboarding
// (spec's "documents/KYC re-upload" requirement) — same fields as KycScreen, just
// pre-filled and framed as an update rather than a first-time application.
export function VehicleDocumentsScreen({ navigation }: RootStackScreenProps<'VehicleDocuments'>) {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const kyc = useSelector((state: RootState) => state.driverProfile.kyc);

  const [ghanaCardNumber, setGhanaCardNumber] = useState(kyc?.ghanaCardNumber ?? '');
  const [ghanaCardImage, setGhanaCardImage] = useState<string | null>(kyc?.ghanaCardImage ?? null);
  const [driversLicenseNumber, setDriversLicenseNumber] = useState(kyc?.driversLicenseNumber ?? '');
  const [driversLicenseImage, setDriversLicenseImage] = useState<string | null>(kyc?.driversLicenseImage ?? null);
  const [vehicleType, setVehicleType] = useState<VehicleType>(kyc?.vehicleType ?? 'tricycle');
  const [plateNumber, setPlateNumber] = useState(kyc?.plateNumber ?? '');
  const [vehiclePhoto, setVehiclePhoto] = useState<string | null>(kyc?.vehiclePhoto ?? null);
  const [saving, setSaving] = useState(false);

  const canSave = Boolean(
    ghanaCardNumber.trim() && driversLicenseNumber.trim() && plateNumber.trim() && vehiclePhoto
  );

  const handleSave = () => {
    setSaving(true);
    dispatch(
      submitKyc({
        ghanaCardNumber,
        ghanaCardImage,
        driversLicenseNumber,
        driversLicenseImage,
        vehicleType,
        plateNumber,
        vehiclePhoto,
        profilePhoto: kyc?.profilePhoto ?? null,
      })
    );
    setSaving(false);
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader
        title="Vehicle & documents"
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <ScrollView
        contentContainerStyle={{ padding: moderateScale(24), gap: moderateScale(16), paddingBottom: moderateScale(48) }}
      >
      <FormField
        label="Ghana Card number"
        value={ghanaCardNumber}
        onChangeText={setGhanaCardNumber}
        autoCapitalize="characters"
      />
      <ImagePickerField label="Ghana Card photo" value={ghanaCardImage} onChange={setGhanaCardImage} />

      <FormField label="Driver's license number" value={driversLicenseNumber} onChangeText={setDriversLicenseNumber} />
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
      />
      <ImagePickerField label="Vehicle photo" value={vehiclePhoto} onChange={setVehiclePhoto} />

      <Button label="Save changes" size="lg" onPress={handleSave} disabled={!canSave} loading={saving} />
      </ScrollView>
    </View>
  );
}
