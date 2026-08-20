import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { toast } from 'sonner-native';

import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/common/FormField';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { ScreenShell } from '../../components/common/ScreenShell';
import { moderateScale } from '../../utils/scale';
import { useScrollBottomPadding } from '../../utils/screenInsets';
import { COLORS } from '../../constants/colors';
import { SHARED_DARK } from '../../constants/darkTheme';
import { useWalletPaystackCheckout } from '../../hooks/useWalletPaystackCheckout';
import { formatAuthPhone } from '../../utils/paymentProviders';
import type { RootState } from '../../store';
import type { RootStackScreenProps } from '../../navigation/types';

const QUICK_AMOUNTS = [10, 20, 50, 100, 200];

export function CreditAccountScreen({
  navigation,
  route,
}: RootStackScreenProps<'CreditAccount'>) {
  const { isDark, colors } = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);
  const { startDeposit, isLoading } = useWalletPaystackCheckout();

  const {
    provider = 'mtn',
    methodLabel = 'Mobile Money',
    channel = 'mobile_money',
  } = route.params ?? {};

  const [phone, setPhone] = useState(formatAuthPhone(user?.phone) || '');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState('50');
  const scrollBottomPadding = useScrollBottomPadding();

  const parseAmount = () => {
    if (selectedAmount) return selectedAmount;
    const numeric = Number(customAmount.replace(/[^\d.]/g, ''));
    return numeric || 0;
  };

  const handleTopUp = async () => {
    const amount = parseAmount();
    if (amount <= 0 || isLoading) return;

    if (!user?.email) {
      toast.error('A verified email is required to complete payment.');
      return;
    }

    await startDeposit({
      email: user.email,
      phone: channel === 'mobile_money' ? phone : formatAuthPhone(user.phone),
      amount,
      provider,
      paymentMethodLabel: methodLabel,
      channel,
    });
  };

  return (
    <ScreenShell>
      <ScreenHeader onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} />
      <ScrollView
        contentContainerStyle={{
          padding: moderateScale(24),
          gap: moderateScale(18),
          paddingBottom: scrollBottomPadding,
        }}
      >
        <View style={{ gap: moderateScale(4) }}>
          <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: moderateScale(22), color: colors.text }}>
            Top up wallet
          </Text>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: moderateScale(13), color: colors.textSub }}>
            Payment method: {methodLabel}
          </Text>
        </View>

        {channel === 'mobile_money' ? (
          <FormField
            label="Mobile money number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="024 123 4567"
          />
        ) : null}

        <FormField
          label="Amount (GHS)"
          value={customAmount}
          onChangeText={(text) => {
            setCustomAmount(text);
            setSelectedAmount(null);
          }}
          keyboardType="decimal-pad"
          placeholder="e.g. 50.00"
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: moderateScale(8) }}>
            {QUICK_AMOUNTS.map((amount) => {
              const selected = selectedAmount === amount;
              return (
                <Pressable
                  key={amount}
                  onPress={() => {
                    setSelectedAmount(amount);
                    setCustomAmount(String(amount));
                  }}
                  style={{
                    paddingHorizontal: moderateScale(16),
                    paddingVertical: moderateScale(10),
                    borderRadius: moderateScale(999),
                    backgroundColor: selected ? COLORS.brandGreen : colors.surface,
                    borderWidth: 1,
                    borderColor: selected ? COLORS.brandGreen : colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Poppins_500Medium',
                      fontSize: moderateScale(13),
                      color: selected ? '#FFFFFF' : colors.text,
                    }}
                  >
                    GHS {amount}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: moderateScale(8),
            padding: moderateScale(12),
            borderRadius: moderateScale(12),
            backgroundColor: isDark ? SHARED_DARK.brandTintBg : `${COLORS.brandGreen}14`,
          }}
        >
          <MaterialCommunityIcons name="shield-check-outline" size={moderateScale(18)} color={COLORS.brandGreen} />
          <Text style={{ flex: 1, fontFamily: 'Poppins_400Regular', fontSize: moderateScale(12), color: colors.textSub }}>
            Payments are processed securely via Paystack.
          </Text>
        </View>

        <Button label="Top up" size="lg" onPress={handleTopUp} loading={isLoading} disabled={isLoading} />
      </ScrollView>
    </ScreenShell>
  );
}
