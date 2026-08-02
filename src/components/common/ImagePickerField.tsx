import { Image, Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { moderateScale } from '../../utils/scale';

interface ImagePickerFieldProps {
  label: string;
  value: string | null;
  onChange: (uri: string | null) => void;
}

// Used by the KYC step for document/photo uploads (Ghana Card, driver's license,
// vehicle photo, profile photo) — no equivalent exists in the customer app since it
// has no KYC flow; this is a net-new primitive.
export function ImagePickerField({ label, value, onChange }: ImagePickerFieldProps) {
  const { colors } = useTheme();

  const pick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) {
      onChange(result.assets[0].uri);
    }
  };

  return (
    <View style={{ gap: moderateScale(8) }}>
      <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: moderateScale(13), color: colors.text }}>
        {label}
      </Text>
      <Pressable
        onPress={pick}
        accessibilityRole="button"
        accessibilityLabel={value ? `${label}, selected. Tap to change.` : `Add ${label}`}
        style={{
          height: moderateScale(96),
          borderRadius: moderateScale(16),
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: colors.border,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {value ? (
          <Image source={{ uri: value }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <>
            <MaterialCommunityIcons name="camera-plus-outline" size={moderateScale(28)} color={colors.textSub} />
            <Text
              style={{
                fontFamily: 'Poppins_400Regular',
                fontSize: moderateScale(12),
                color: colors.textSub,
                marginTop: moderateScale(4),
              }}
            >
              Tap to upload
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}
