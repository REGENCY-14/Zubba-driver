import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { FormField } from '../../components/common/FormField';
import { OTPInput } from '../../components/common/OTPInput';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { moderateScale } from '../../utils/scale';
import { COLORS } from '../../constants/colors';
import {
  getJobById,
  verifyCollectionCode,
  submitPickupLog,
  Job,
  PickupLogResult,
} from '../../services/mock/jobsMock';
import type { RootStackScreenProps } from '../../navigation/types';

type Step = 'code' | 'logging' | 'success';

const MIN_BAGS = 1;
const MAX_BAGS = 20;

// Collection-code entry reuses the ported OTPInput pattern (DRIVER_APP_HANDOFF.md's
// correction: the spec's cross-reference to PaymentVerificationScreen was wrong —
// that screen has no keypad at all). Validated against each job's hardcoded mock
// collectionCode, then hands off to the bag-count/weight logging form.
export function CollectionCodeScreen({ navigation, route }: RootStackScreenProps<'CollectionCode'>) {
  const { jobId } = route.params;
  const { colors } = useTheme();

  const [job, setJob] = useState<Job | null>(null);
  const [step, setStep] = useState<Step>('code');

  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const [bags, setBags] = useState(MIN_BAGS);
  const [weightKg, setWeightKg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PickupLogResult | null>(null);

  useEffect(() => {
    getJobById(jobId).then(j => setJob(j ?? null));
  }, [jobId]);

  const handleCodeComplete = async (code: string) => {
    setVerifying(true);
    setCodeError(null);
    const { valid } = await verifyCollectionCode(jobId, code);
    setVerifying(false);
    if (!valid) {
      setCodeError('Incorrect code. Ask the customer to confirm it and try again.');
      setDigits(['', '', '', '']);
      return;
    }
    setStep('logging');
  };

  const parsedWeight = parseFloat(weightKg);
  const canSubmitLog = weightKg.length > 0 && !Number.isNaN(parsedWeight) && parsedWeight > 0;

  const handleSubmitLog = async () => {
    if (!canSubmitLog) return;
    setSubmitting(true);
    const logResult = await submitPickupLog(jobId, bags, parsedWeight);
    setSubmitting(false);
    setResult(logResult);
    setStep('success');
  };

  if (!job) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(13), color: colors.textSub }}>
          Loading…
        </Text>
      </View>
    );
  }

  if (step === 'success' && result) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
          padding: moderateScale(24),
          gap: moderateScale(16),
        }}
      >
        <MaterialCommunityIcons name="check-decagram" size={moderateScale(64)} color={COLORS.brandGreen} />
        <Text
          style={{
            fontFamily: 'Poppins_700Bold',
            fontSize: moderateScale(20),
            color: colors.text,
            textAlign: 'center',
          }}
        >
          Pickup complete!
        </Text>
        <Text
          style={{
            fontFamily: 'Poppins_400Regular',
            fontSize: moderateScale(13),
            color: colors.textSub,
            textAlign: 'center',
          }}
        >
          {result.bags} bag{result.bags !== 1 ? 's' : ''} • {result.weightKg} kg logged
        </Text>
        <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(24), color: COLORS.brandGreen }}>
          + GHS {result.amountEarned.toFixed(2)}
        </Text>
        <Button
          label="Back to Jobs"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Jobs' }] })}
        />
      </View>
    );
  }

  if (step === 'logging') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader onBack={() => setStep('code')} />
        <View style={{ flex: 1, padding: moderateScale(24), gap: moderateScale(20) }}>
        <View style={{ gap: moderateScale(4) }}>
          <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(22), color: colors.text }}>
            Log the pickup
          </Text>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(13), color: colors.textSub }}>
            Record what you collected from {job.customerName}.
          </Text>
        </View>

        <Card>
          <Text
            style={{
              fontFamily: 'Poppins_500Medium',
              fontSize: moderateScale(13),
              color: colors.text,
              marginBottom: moderateScale(10),
            }}
          >
            Bag count
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: moderateScale(24) }}>
            <Pressable
              onPress={() => setBags(b => Math.max(MIN_BAGS, b - 1))}
              accessibilityRole="button"
              accessibilityLabel="Decrease bag count"
              style={{
                width: moderateScale(44),
                height: moderateScale(44),
                borderRadius: moderateScale(22),
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name="minus" size={moderateScale(20)} color={colors.text} />
            </Pressable>
            <Text
              style={{
                fontFamily: 'Poppins_700Bold',
                fontSize: moderateScale(28),
                color: colors.text,
                minWidth: moderateScale(40),
                textAlign: 'center',
              }}
            >
              {bags}
            </Text>
            <Pressable
              onPress={() => setBags(b => Math.min(MAX_BAGS, b + 1))}
              accessibilityRole="button"
              accessibilityLabel="Increase bag count"
              style={{
                width: moderateScale(44),
                height: moderateScale(44),
                borderRadius: moderateScale(22),
                backgroundColor: COLORS.brandGreen,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name="plus" size={moderateScale(20)} color="#FFFFFF" />
            </Pressable>
          </View>
        </Card>

        <FormField
          label="Total weight (kg)"
          value={weightKg}
          onChangeText={setWeightKg}
          keyboardType="decimal-pad"
          placeholder="e.g. 6.5"
        />

        <Button label="Submit log" size="lg" onPress={handleSubmitLog} disabled={!canSubmitLog} loading={submitting} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} />
      <View style={{ flex: 1, padding: moderateScale(24), gap: moderateScale(20) }}>
        <View style={{ gap: moderateScale(4) }}>
          <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(22), color: colors.text }}>
            Enter collection code
          </Text>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(13), color: colors.textSub }}>
            Ask {job.customerName} for the 4-digit code shown in their app.
          </Text>
        </View>

        <OTPInput value={digits} onChange={setDigits} length={4} onComplete={handleCodeComplete} />

        {codeError ? (
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(12), color: '#EF4444' }}>
            {codeError}
          </Text>
        ) : null}

        {verifying ? (
          <Text
            style={{
              fontFamily: 'Poppins_400Regular',
              fontSize: moderateScale(12),
              color: colors.textSub,
              textAlign: 'center',
            }}
          >
            Verifying…
          </Text>
        ) : null}
      </View>
    </View>
  );
}
