import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Splash: undefined;
  OnboardLocationAccess: undefined;
  OnboardNotificationsAccess: undefined;
  Welcome: undefined;
  SignUp: undefined;
  SignIn: undefined;
  VerifyOtp: { phone: string; purpose: 'registration' | 'login' };
  Kyc: undefined;
  Terms: undefined;
  ApplicationStatus: undefined;
  Home: undefined;
  Jobs: undefined;
  JobDetail: { jobId: string };
  RouteMap: { jobId: string };
  CollectionCode: { jobId: string };
  Earnings: undefined;
  Withdraw: undefined;
  Settings: undefined;
  Profile: undefined;
  VehicleDocuments: undefined;
  Ratings: undefined;
  Notifications: undefined;
  HelpCenter: undefined;
  ReportIssue: undefined;
  Legal: undefined;
  AboutUs: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;
