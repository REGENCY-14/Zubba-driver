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
import { driverService } from '../../api/driverService';
import { toJob, Job } from '../../utils/jobMapping';
import { handleApiError } from '../../utils/handleApiError';
import type { RootStackScreenProps } from '../../navigation/types';

type Step = 'code' | 'logging' | 'success';

interface PickupLogResult {
  bags: number;
  weightKg: number;
  amountEarned: number;
}

const MIN_BAGS = 1;
const MAX_BAGS = 20;

// Collection-code handshake: the 4-digit code is generated server-side at
// request creation (requests.collection_code) and shown to the customer in
// their app — verified here client-side against the value already fetched
// with the job, no separate "verify" endpoint exists or is needed.
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
    driverService
      .getRequestById(jobId)
      .then((res) => setJob(toJob(res.data)))
      .catch((err) => handleApiError(err));
  }, [jobId]);

  const handleCodeComplete = async (code: string) => {
    setVerifying(true);
    setCodeError(null);
    setVerifying(false);
    if (!job || code !== job.collectionCode) {
      setCodeError('Incorrect code. Ask the customer to confirm it and try again.');
      setDigits(['', '', '', '']);
      return;
    }
    setStep('logging');
  };

  const parsedWeight = parseFloat(weightKg);
  const canSubmitLog = weightKg.length > 0 && !Number.isNaN(parsedWeight) && parsedWeight > 0;

  const handleSubmitLog = async () => {
    if (!canSubmitLog || !job) return;
    setSubmitting(true);
    try {
      await driverService.submitBags(job.id, bags);
      const res = await driverService.updateRequestStatus(job.id, 'completed');
      const completed = toJob(res.data.request);
      setResult({
        bags,
        weightKg: parsedWeight,
        amountEarned: completed.amountEarned ?? completed.estimatedPay,
      });
      setStep('success');
    } catch (err) {
      handleApiError(err);
    } finally {
      setSubmitting(false);
    }
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
