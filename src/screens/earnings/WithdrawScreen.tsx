import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/common/FormField';
import { PaymentRailBadge } from '../../components/common/PaymentRailBadge';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { ScreenShell } from '../../components/common/ScreenShell';
import { moderateScale } from '../../utils/scale';
import { useScrollBottomPadding } from '../../utils/screenInsets';
import { COLORS } from '../../constants/colors';
import { SHARED_DARK } from '../../constants/darkTheme';
import { walletService } from '../../api/walletService';
import type { RootStackScreenProps } from '../../navigation/types';

type PayoutRail = 'mtn' | 'telecel' | 'airtel';

// 'bank' has no backend support today — /wallet/withdraw only accepts
// mobile-money providers (mtn/telecel/airtel), so it's left out here rather
// than offered and silently failing.
const PAYOUT_METHODS: { key: PayoutRail; label: string }[] = [
  { key: 'mtn', label: 'MTN MoMo' },
  { key: 'telecel', label: 'Telecel Cash' },
  { key: 'airtel', label: 'Airtel Money' },
];

export function WithdrawScreen({ navigation }: RootStackScreenProps<'Withdraw'>) {
  const { isDark, colors } = useTheme();
  // COLORS.selectedRing and COLORS.brandGreen are the same hex — one shared
  // dark-mode accent covers both roles.
  const activeGreen = isDark ? SHARED_DARK.accentGreen : COLORS.brandGreen;
  const errorText = isDark ? SHARED_DARK.destructiveText : COLORS.destructiveRed;
  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [rail, setRail] = useState<PayoutRail>('mtn');
  const [accountDetail, setAccountDetail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ reference: string; newBalanceGHS: number } | null>(null);
  const scrollBottomPadding = useScrollBottomPadding();

  useEffect(() => {
    walletService
      .getWallet()
      .then((res) => setBalance(res.data.wallet.available_balance))
      .catch(() => {});
  }, []);

  const parsedAmount = parseFloat(amount);
  const canSubmit =
    balance != null &&
    amount.length > 0 &&
    !Number.isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    parsedAmount <= balance &&
    accountDetail.trim().length > 0;

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await walletService.withdraw({
        amount: parsedAmount,
        phone: accountDetail.trim(),
        provider: rail,
      });
      const newBalance = (balance ?? 0) - parsedAmount;
      setSuccess({ reference: res.data.reference, newBalanceGHS: newBalance });
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Withdrawal failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
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
        <MaterialCommunityIcons name="clock-check-outline" size={moderateScale(64)} color={activeGreen} />
        <Text
          style={{
            fontFamily: 'Poppins_700Bold',
            fontSize: moderateScale(20),
            color: colors.text,
            textAlign: 'center',
          }}
        >
          Withdrawal requested
        </Text>
        <Text
          style={{
            fontFamily: 'Poppins_400Regular',
            fontSize: moderateScale(13),
            color: colors.textSub,
            textAlign: 'center',
          }}
        >
          Reference {success.reference}. Funds usually arrive within a few minutes.
        </Text>
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(12), color: colors.textSub }}>
          New balance: GHS {success.newBalanceGHS.toFixed(2)}
        </Text>
        <Button label="Done" onPress={() => navigation.goBack()} />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <ScreenHeader onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} />
      <ScrollView
        contentContainerStyle={{ padding: moderateScale(24), gap: moderateScale(18), paddingBottom: scrollBottomPadding }}
      >
      <View style={{ gap: moderateScale(4) }}>
        <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(22), color: colors.text }}>
          Withdraw
        </Text>
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(13), color: colors.textSub }}>
          Available balance: {balance != null ? `GHS ${balance.toFixed(2)}` : '…'}
        </Text>
      </View>

      <FormField
        label="Amount (GHS)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="e.g. 50.00"
      />

      <View style={{ gap: moderateScale(10) }}>
        <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: moderateScale(13), color: colors.text }}>
          Payout method
        </Text>
        {PAYOUT_METHODS.map(method => {
          const selected = rail === method.key;
          return (
            <Pressable
              key={method.key}
              onPress={() => setRail(method.key)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: moderateScale(12),
                padding: moderateScale(10),
                borderRadius: moderateScale(16),
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? activeGreen : colors.border,
                minHeight: moderateScale(44),
              }}
            >
              <PaymentRailBadge rail={method.key} />
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: moderateScale(14), color: colors.text, flex: 1 }}>
                {method.label}
              </Text>
              {selected && (
                <MaterialCommunityIcons name="check-circle" size={moderateScale(20)} color={activeGreen} />
              )}
            </Pressable>
          );
        })}
      </View>

      <FormField
        label="Mobile money number"
        value={accountDetail}
        onChangeText={setAccountDetail}
        keyboardType="phone-pad"
        placeholder="024 123 4567"
      />

      {error ? (
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(12), color: errorText }}>
          {error}
        </Text>
      ) : null}

      <Button label="Confirm withdrawal" size="lg" onPress={handleSubmit} disabled={!canSubmit} loading={submitting} />
      </ScrollView>
    </ScreenShell>
  );
}
