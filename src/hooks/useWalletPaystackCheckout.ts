import { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { toast } from 'sonner-native';

import { usePaystackCheckout } from '../context/PaystackCheckoutContext';
import { walletService } from '../api/walletService';
import type { RootStackParamList } from '../navigation/types';
import { handleApiError } from '../utils/handleApiError';
import { waitForPaymentSuccess } from '../utils/waitForPaymentSuccess';
import type { PaymentChannel } from '../utils/paymentProviders';

export function useWalletPaystackCheckout() {
  const { checkout } = usePaystackCheckout();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isLoading, setIsLoading] = useState(false);

  const startDeposit = useCallback(
    async (params: {
      email: string;
      phone: string;
      amount: number;
      provider: string;
      paymentMethodLabel: string;
      channel: PaymentChannel;
    }) => {
      const { email, phone, amount, provider, channel } = params;
      const cleanedPhone = phone.replace(/\s/g, '');

      if (amount <= 0) {
        toast.error('Please enter a valid amount.');
        return;
      }

      if (channel === 'mobile_money' && cleanedPhone.length < 10) {
        toast.error('Please enter a valid phone number');
        return;
      }

      if (!email) {
        toast.error('A verified email is required to complete payment.');
        return;
      }

      setIsLoading(true);

      try {
        const initRes = await walletService.initiateDeposit({
          amount,
          email,
          phone: cleanedPhone,
          provider,
          clientInitiated: true,
          payment_method: channel === 'card' ? 'card' : 'mobile_money',
        });

        if (!initRes.success || !initRes.data.reference) {
          toast.error('Failed to initiate deposit. Please try again.');
          return;
        }

        const { reference } = initRes.data;
        setIsLoading(false);

        checkout(
          {
            email,
            amount,
            reference,
            metadata: {
              purpose: 'wallet_deposit',
              phone: cleanedPhone,
              provider,
            },
            onSuccess: async () => {
              setIsLoading(true);
              try {
                await waitForPaymentSuccess(reference);
                navigation.replace('Earnings', { credited: true });
              } catch (error) {
                handleApiError(error);
              } finally {
                setIsLoading(false);
              }
            },
            onCancel: () => {
              toast.error('Payment cancelled');
            },
            onError: () => {
              toast.error('Payment error. Please try again.');
            },
          },
          [channel],
        );
      } catch (error) {
        handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [navigation, checkout],
  );

  return { startDeposit, isLoading };
}
