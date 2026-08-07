import { paymentService } from '../api/paymentService';

const VERIFY_ATTEMPTS = 20;
const VERIFY_INTERVAL_MS = 2000;

export async function waitForPaymentSuccess(reference: string) {
  for (let attempt = 0; attempt < VERIFY_ATTEMPTS; attempt += 1) {
    const result = await paymentService.verifyPaymentStatus(reference);
    const status = result.data?.status;

    if (status === 'success') {
      return result.data;
    }

    if (status === 'failed') {
      throw new Error('Payment failed. Please try again.');
    }

    await new Promise<void>((resolve) => {
      setTimeout(resolve, VERIFY_INTERVAL_MS);
    });
  }

  throw new Error(
    'Payment verification timed out. Please check your transaction history.',
  );
}
