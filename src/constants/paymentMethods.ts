export type DepositMethodOption = {
  id: 'mobile_money' | 'card';
  title: string;
  iconName: 'cellphone' | 'credit-card-outline';
};

export const depositMethods: DepositMethodOption[] = [
  {
    id: 'mobile_money',
    title: 'Mobile Money',
    iconName: 'cellphone',
  },
  {
    id: 'card',
    title: 'Card',
    iconName: 'credit-card-outline',
  },
];

export type WithdrawNetworkId = 'mtn' | 'telecel' | 'airtel';

export type WithdrawNetworkOption = {
  id: WithdrawNetworkId;
  title: string;
};

export const withdrawNetworks: WithdrawNetworkOption[] = [
  { id: 'mtn', title: 'MTN Mobile Money' },
  { id: 'telecel', title: 'Telecel Cash' },
  { id: 'airtel', title: 'AirtelTigo Money' },
];
