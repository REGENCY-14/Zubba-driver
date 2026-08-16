import { useRef } from 'react';
import { TextInput, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { moderateScale } from '../../utils/scale';

// Ported from the customer app's src/components/common/OTPInput.tsx
// (DRIVER_APP_HANDOFF.md §4) — the real reusable OTP component, not the
// PaymentVerificationScreen the spec incorrectly cross-references.
export type OTPInputProps = {
  value: string[];
  onChange: (digits: string[]) => void;
  length?: number;
  onComplete?: (otp: string) => void;
};

export function OTPInput({ value, onChange, length = 4, onComplete }: OTPInputProps) {
  const { colors } = useTheme();
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleChangeText = (text: string, index: number) => {
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').slice(0, length).split('');
      const next = Array.from({ length }, (_, i) => digits[i] ?? value[i] ?? '');
      onChange(next);
      const lastFilled = Math.min(digits.length, length) - 1;
      if (lastFilled >= 0) inputRefs.current[lastFilled]?.focus();
      if (digits.length >= length) onComplete?.(next.join(''));
      return;
    }
    const next = [...value];
    next[index] = text;
    onChange(next);
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (text && index === length - 1 && next.every(d => d)) {
      onComplete?.(next.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={{ flexDirection: 'row', gap: moderateScale(12) }}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={ref => {
            inputRefs.current[i] = ref;
          }}
          value={value[i] ?? ''}
          onChangeText={text => handleChangeText(text, i)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
          keyboardType="number-pad"
          maxLength={length}
          accessibilityLabel={`Digit ${i + 1} of ${length}`}
          style={{
            width: moderateScale(44),
            height: moderateScale(44),
            borderRadius: moderateScale(12),
            borderWidth: 1,
            textAlign: 'center',
            textAlignVertical: 'center',
            paddingVertical: 0,
            includeFontPadding: false,
            fontSize: moderateScale(18),
            fontFamily: 'Poppins_600SemiBold',
            color: colors.text,
            backgroundColor: value[i] ? colors.card : colors.surface,
            borderColor: value[i] ? '#34A853' : colors.border,
          }}
        />
      ))}
    </View>
  );
}
