import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/common/FormField';
import { PaymentRailBadge } from '../../components/common/PaymentRailBadge';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { moderateScale } from '../../utils/scale';
import { COLORS } from '../../constants/colors';
import { getWalletBalance, submitWithdrawal, PayoutRail } from '../../services/mock/walletMock';
import type { RootStackScreenProps } from '../../navigation/types';

const PAYOUT_METHODS: { key: PayoutRail; label: string }[] = [
  { key: 'mtn', label: 'MTN MoMo' },
  { key: 'telecel', label: 'Telecel Cash' },
  { key: 'airtel', label: 'Airtel Money' },
  { key: 'bank', label: 'Bank transfer' },
];

// Mirrors the customer app's WithdrawScreen pattern, reusing the same payment-rail
// badge colors for payout selection (DRIVER_APP_HANDOFF.md §4).
export function WithdrawScreen({ navigation }: RootStackScreenProps<'Withdraw'>) {
  const { colors } = useTheme();
  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [rail, setRail] = useState<PayoutRail>('mtn');
  const [accountDetail, setAccountDetail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ reference: string; newBalanceGHS: number } | null>(null);

  useEffect(() => {
    getWalletBalance().then(b => setBalance(b.availableGHS));
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
    const result = await submitWithdrawal({ amountGHS: parsedAmount, rail, accountDetail: accountDetail.trim() });
    setSubmitting(false);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    setSuccess({ reference: result.reference, newBalanceGHS: result.newBalanceGHS });
  };

  if (success) {
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
        <MaterialCommunityIcons name="clock-check-outline" size={moderateScale(64)} color={COLORS.brandGreen} />
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
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} />
      <ScrollView
        contentContainerStyle={{ padding: moderateScale(24), gap: moderateScale(18), paddingBottom: moderateScale(48) }}
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
                borderColor: selected ? COLORS.selectedRing : colors.border,
                minHeight: moderateScale(44),
              }}
            >
              <PaymentRailBadge rail={method.key} />
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: moderateScale(14), color: colors.text, flex: 1 }}>
                {method.label}
              </Text>
              {selected && (
                <MaterialCommunityIcons name="check-circle" size={moderateScale(20)} color={COLORS.selectedRing} />
              )}
            </Pressable>
          );
        })}
      </View>

      <FormField
        label={rail === 'bank' ? 'Bank account number' : 'Mobile money number'}
        value={accountDetail}
        onChangeText={setAccountDetail}
        keyboardType={rail === 'bank' ? 'number-pad' : 'phone-pad'}
        placeholder={rail === 'bank' ? '0123456789' : '024 123 4567'}
      />

      {error ? (
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(12), color: '#EF4444' }}>
          {error}
        </Text>
      ) : null}

      <Button label="Confirm withdrawal" size="lg" onPress={handleSubmit} disabled={!canSubmit} loading={submitting} />
      </ScrollView>
    </View>
  );
}
