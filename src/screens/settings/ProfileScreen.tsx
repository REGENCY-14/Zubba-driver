import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/common/FormField';
import { ImagePickerField } from '../../components/common/ImagePickerField';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { ScreenShell } from '../../components/common/ScreenShell';
import { moderateScale } from '../../utils/scale';
import { useScrollBottomPadding } from '../../utils/screenInsets';
import { updateUser } from '../../slices/auth/authSlice';
import { saveAuthUser } from '../../utils/authStorage';
import { userService } from '../../api/userService';
import { driverService } from '../../api/driverService';
import { uploadKycDocument } from '../../services/kycUploadService';
import { handleApiError } from '../../utils/handleApiError';
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
  const scrollBottomPadding = useScrollBottomPadding();

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const isNewLocalPhoto = profilePhoto && profilePhoto !== user.profile_picture && !profilePhoto.startsWith('http');
      const uploadedPhoto = isNewLocalPhoto ? await uploadKycDocument(user.id, 'profile', profilePhoto!) : profilePhoto;

      const res = await userService.updateUser(user.id, {
        firstname,
        lastname,
        profile_picture: uploadedPhoto,
      });
      await driverService.updateMe({ profile_picture: uploadedPhoto }).catch(() => {});

      dispatch(updateUser(res.data.user));
      await saveAuthUser({ ...user, ...res.data.user });
      navigation.goBack();
    } catch (err) {
      handleApiError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenShell>
      <ScreenHeader
        title="Edit profile"
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <ScrollView
        contentContainerStyle={{ padding: moderateScale(24), gap: moderateScale(18), paddingBottom: scrollBottomPadding }}
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
    </ScreenShell>
  );
}
