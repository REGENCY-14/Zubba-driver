import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/common/FormField';
import { ImagePickerField } from '../../components/common/ImagePickerField';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { moderateScale } from '../../utils/scale';
import { updateUser } from '../../slices/auth/authSlice';
import { saveAuthUser } from '../../utils/authStorage';
import type { RootState } from '../../store';
import type { RootStackScreenProps } from '../../navigation/types';

export function ProfileScreen({ navigation }: RootStackScreenProps<'Profile'>) {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [firstname, setFirstname] = useState(user?.firstname ?? '');
  const [lastname, setLastname] = useState(user?.lastname ?? '');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(user?.profile_picture ?? null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const updated = { firstname, lastname, profile_picture: profilePhoto };
    dispatch(updateUser(updated));
    await saveAuthUser({ ...user, ...updated });
    setSaving(false);
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader
        title="Edit profile"
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <ScrollView
        contentContainerStyle={{ padding: moderateScale(24), gap: moderateScale(18), paddingBottom: moderateScale(48) }}
      >
        <ImagePickerField label="Profile photo" value={profilePhoto} onChange={setProfilePhoto} />
        <FormField label="First name" value={firstname} onChangeText={setFirstname} />
        <FormField label="Last name" value={lastname} onChangeText={setLastname} />
        <FormField label="Phone number" value={user?.phone ?? ''} editable={false} />

        <View>
          <Text
            style={{
              fontFamily: 'Poppins_400Regular',
              fontSize: moderateScale(11),
              color: colors.textMuted,
              marginBottom: moderateScale(12),
            }}
          >
            To change your phone number, contact support — it's tied to your verified account.
          </Text>
          <Button
            label="Save changes"
            onPress={handleSave}
            disabled={!firstname.trim() || !lastname.trim()}
            loading={saving}
          />
        </View>
      </ScrollView>
    </View>
  );
}
