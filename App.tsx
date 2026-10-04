import { enableScreens } from "react-native-screens";
enableScreens();

import "react-native-gesture-handler";

import { useEffect, useMemo } from "react";
import { Text, TextInput, StatusBar } from "react-native";
import { Provider } from "react-redux";
import { Toaster } from "sonner-native";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import * as SplashScreen from "expo-splash-screen";

import { store } from "./src/store";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { AppSidebar } from "./src/components/AppSidebar";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { PaystackCheckoutProvider } from "./src/context/PaystackCheckoutContext";
import { hydrateDriverProfile } from "./src/slices/driverProfile/hydrateDriverProfile";
import {
  configureNotifications,
  registerBackgroundMessageHandler,
  setupNotificationListeners,
} from "./src/services/pushNotifications";
import { useDriverPresence } from "./src/hooks/useDriverPresence";
import { env } from "./src/utils/env";
import type { RootStackParamList } from "./src/navigation/types";

// Apply Poppins as the global default for unstyled Text / TextInput
if ((Text as any).defaultProps == null) (Text as any).defaultProps = {};
(Text as any).defaultProps.style = { fontFamily: 'Poppins_400Regular' };
if ((TextInput as any).defaultProps == null) (TextInput as any).defaultProps = {};
(TextInput as any).defaultProps.style = { fontFamily: 'Poppins_400Regular' };
import "./global.css";

SplashScreen.preventAutoHideAsync().catch(() => {});
registerBackgroundMessageHandler();

function DriverPresence() {
  useDriverPresence();
  return null;
}

function AppContent() {
  const { isDark, colors } = useTheme();
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  // Match the navigator's background to the screens' (ScreenShell uses colors.bg)
  // so React Navigation's default grey doesn't show during screen transitions.
  const navigationTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: { ...base.colors, background: colors.bg, card: colors.bg },
    };
  }, [isDark, colors.bg]);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef} theme={navigationTheme}>
          <StatusBar
            barStyle={isDark ? "light-content" : "dark-content"}
            backgroundColor={colors.bg}
            translucent={false}
          />
          <DriverPresence />
          <RootNavigator />
          <AppSidebar navigationRef={navigationRef} />
          <Toaster />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins: Poppins_400Regular,
  });

  useEffect(() => {
    hydrateDriverProfile();
    configureNotifications();
    return setupNotificationListeners();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <PaystackCheckoutProvider publicKey={env.paystackPublicKey} currency="GHS" debug={__DEV__}>
        <AppContent />
      </PaystackCheckoutProvider>
    </ThemeProvider>
  );
}
