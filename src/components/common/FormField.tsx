import { Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { moderateScale } from '../../utils/scale';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function FormField({ label, error, style, ...inputProps }: FormFieldProps) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: moderateScale(6) }}>
      <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: moderateScale(13), color: colors.text }}>
        {label}
      </Text>
      <TextInput
        placeholderTextColor={colors.textSub}
        style={[
          {
            height: moderateScale(48),
            borderRadius: moderateScale(12),
            borderWidth: 1,
            borderColor: error ? '#EF4444' : colors.border,
            backgroundColor: colors.surface,
            paddingHorizontal: moderateScale(14),
            fontFamily: 'Poppins_400Regular',
            fontSize: moderateScale(14),
            color: colors.text,
          },
          style,
        ]}
        {...inputProps}
      />
      {error ? (
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(11), color: '#EF4444' }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
