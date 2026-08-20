import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { OTPInput } from '../../components/common/OTPInput';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { ScreenShell } from '../../components/common/ScreenShell';
import { moderateScale } from '../../utils/scale';
import { COLORS } from '../../constants/colors';
import { SHARED_DARK } from '../../constants/darkTheme';
import { driverService } from '../../api/driverService';
import { toJob, Job } from '../../utils/jobMapping';
import { handleApiError } from '../../utils/handleApiError';
import type { RootStackScreenProps } from '../../navigation/types';

type Step = 'code' | 'logging' | 'waiting' | 'success';

interface PickupLogResult {
  bags: number;
  amountEarned: number;
}

const MIN_BAGS = 1;
const MAX_BAGS = 20;

// Same poll cadence as HomeScreen.tsx's incoming-request poll, for consistency.
const POLL_INTERVAL_MS = 4000;

// Collection-code handshake: the 4-digit code is generated server-side at
// request creation (requests.collection_code) and shown to the customer in
// their app. It's compared client-side first for immediate feedback, but the
// server is the real source of truth — it re-validates the code against
// requests.collection_code when bags are submitted and can reject it (400
// "Incorrect collection code") even if the client-side check passed, since
// the code is spoofable in the request payload.
export function CollectionCodeScreen({ navigation, route }: RootStackScreenProps<'CollectionCode'>) {
  const { jobId } = route.params;
  const { isDark, colors } = useTheme();
  const activeGreen = isDark ? SHARED_DARK.accentGreen : COLORS.brandGreen;
  const errorText = isDark ? SHARED_DARK.destructiveText : COLORS.destructiveRed;
  const insets = useSafeAreaInsets();

  const [job, setJob] = useState<Job | null>(null);
  const [step, setStep] = useState<Step>('code');

  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [enteredCode, setEnteredCode] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const [bags, setBags] = useState(MIN_BAGS);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
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
    setEnteredCode(code);
    setStep('logging');
  };

  const handleSubmitLog = async () => {
    if (!job || !enteredCode) return;
    setSubmitting(true);
    try {
      const res = await driverService.submitBags(job.id, bags, enteredCode);
      setJob(toJob(res.data.request));
      setStep('waiting');
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as any)?.error?.message
        : undefined;
      if (message === 'Incorrect collection code') {
        // The server is the real source of truth on the code — send the
        // driver back to re-enter it rather than trusting the client-side
        // check that already passed.
        setCodeError('Incorrect code. Ask the customer to confirm it and try again.');
        setDigits(['', '', '', '']);
        setEnteredCode(null);
        setStep('code');
      } else {
        handleApiError(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Bags are logged but the request stays "arrived" until the customer pays
  // (backend sets it to "paid" independently). Poll for that transition so
  // "Confirm Collection" can appear without a manual refresh.
  useEffect(() => {
    if (step !== 'waiting' || !job) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await driverService.getRequestById(job.id);
        if (cancelled) return;
        setJob(toJob(res.data));
      } catch {
        // transient network error — try again next tick
      }
    };
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [step, job?.id]);

  const handleConfirmCollection = async () => {
    if (!job) return;
    setConfirming(true);
    try {
      const res = await driverService.updateRequestStatus(job.id, 'completed');
      const completed = toJob(res.data.request);
      setResult({
        bags,
        amountEarned: completed.amountEarned ?? completed.estimatedPay,
      });
      setStep('success');
    } catch (err) {
      handleApiError(err);
    } finally {
      setConfirming(false);
    }
  };

  if (!job) {
    return (
      <ScreenShell>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(13), color: colors.textSub }}>
            Loading…
          </Text>
        </View>
      </ScreenShell>
    );
  }

  if (step === 'success' && result) {
    return (
      <ScreenShell>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: moderateScale(24),
            gap: moderateScale(16),
          }}
        >
        <MaterialCommunityIcons name="check-decagram" size={moderateScale(64)} color={activeGreen} />
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
          {result.bags} bag{result.bags !== 1 ? 's' : ''} logged
        </Text>
        <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(24), color: activeGreen }}>
          + GHS {result.amountEarned.toFixed(2)}
        </Text>
        <Button
          label="Back to Jobs"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Jobs' }] })}
        />
        </View>
      </ScreenShell>
    );
  }

  if (step === 'waiting') {
    const isPaid = job.status === 'paid';
    return (
      <ScreenShell>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: moderateScale(24),
            paddingHorizontal: moderateScale(24),
            paddingBottom: moderateScale(24) + insets.bottom,
            gap: moderateScale(16),
          }}
        >
          <MaterialCommunityIcons
            name={isPaid ? 'cash-check' : 'clock-outline'}
            size={moderateScale(64)}
            color={isPaid ? activeGreen : colors.textSub}
          />
          <Text
            style={{
              fontFamily: 'Poppins_700Bold',
              fontSize: moderateScale(20),
              color: colors.text,
              textAlign: 'center',
            }}
          >
            {isPaid ? 'Payment received' : 'Bags logged'}
          </Text>
          <Text
            style={{
              fontFamily: 'Poppins_400Regular',
              fontSize: moderateScale(13),
              color: colors.textSub,
              textAlign: 'center',
            }}
          >
            {isPaid
              ? `Confirm you've handed over the collection to finish this pickup.`
              : `Waiting for ${job.customerName} to pay for the pickup.`}
          </Text>
          {isPaid && (
            <Button
              label="Confirm Collection"
              size="lg"
              onPress={handleConfirmCollection}
              loading={confirming}
            />
          )}
        </View>
      </ScreenShell>
    );
  }

  if (step === 'logging') {
    return (
      <ScreenShell>
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
                backgroundColor: activeGreen,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name="plus" size={moderateScale(20)} color="#FFFFFF" />
            </Pressable>
          </View>
        </Card>

        <Button label="Submit log" size="lg" onPress={handleSubmitLog} loading={submitting} />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
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
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(12), color: errorText }}>
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
    </ScreenShell>
  );
}
