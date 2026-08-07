export type PaymentChannel = 'mobile_money' | 'card';

export function formatAuthPhone(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('233') && digits.length >= 12) {
    return `0${digits.slice(3, 12)}`;
  }
  if (digits.startsWith('0')) {
    return digits.slice(0, 10);
  }
  return digits.length >= 9 ? `0${digits.slice(-9)}` : digits;
}

export function getMethodLabel(channel: PaymentChannel): string {
  return channel === 'card' ? 'Card' : 'Mobile Money';
}
