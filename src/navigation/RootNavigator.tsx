import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { VerifyOtpScreen } from '../screens/auth/VerifyOtpScreen';
import { KycScreen } from '../screens/onboarding/KycScreen';
import { TermsScreen } from '../screens/onboarding/TermsScreen';
import { ApplicationStatusScreen } from '../screens/onboarding/ApplicationStatusScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { JobsScreen } from '../screens/jobs/JobsScreen';
import { JobDetailScreen } from '../screens/jobs/JobDetailScreen';
import { CollectionCodeScreen } from '../screens/collection/CollectionCodeScreen';
import { EarningsScreen } from '../screens/earnings/EarningsScreen';
import { WithdrawScreen } from '../screens/earnings/WithdrawScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { ProfileScreen } from '../screens/settings/ProfileScreen';
import { VehicleDocumentsScreen } from '../screens/settings/VehicleDocumentsScreen';
import { RatingsScreen } from '../screens/settings/RatingsScreen';
import { NotificationsScreen } from '../screens/settings/NotificationsScreen';
import { HelpCenterScreen } from '../screens/settings/HelpCenterScreen';
import { ReportIssueScreen } from '../screens/settings/ReportIssueScreen';
import { LegalScreen } from '../screens/settings/LegalScreen';
import { AboutUsScreen } from '../screens/settings/AboutUsScreen';

// Single flat native stack, matching the customer app's RootNavigator.tsx —
// there is no separate tab-navigator package; AppBottomNav is rendered manually
// inside each top-level screen (DRIVER_APP_HANDOFF.md §5).
const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
      <Stack.Screen name="Kyc" component={KycScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="ApplicationStatus" component={ApplicationStatusScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Jobs" component={JobsScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="CollectionCode" component={CollectionCodeScreen} />
      <Stack.Screen name="Earnings" component={EarningsScreen} />
      <Stack.Screen name="Withdraw" component={WithdrawScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="VehicleDocuments" component={VehicleDocumentsScreen} />
      <Stack.Screen name="Ratings" component={RatingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="ReportIssue" component={ReportIssueScreen} />
      <Stack.Screen name="Legal" component={LegalScreen} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen} />
    </Stack.Navigator>
  );
}
