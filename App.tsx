import { enableScreens } from "react-native-screens";
enableScreens();

import "react-native-gesture-handler";

import { useEffect } from "react";
import { Text, TextInput, StatusBar } from "react-native";
import { Provider } from "react-redux";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
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
import { hydrateAuth } from "./src/slices/auth/hydrateAuth";
import { hydrateDriverProfile } from "./src/slices/driverProfile/hydrateDriverProfile";
import type { RootStackParamList } from "./src/navigation/types";

// Apply Poppins as the global default for unstyled Text / TextInput
if ((Text as any).defaultProps == null) (Text as any).defaultProps = {};
(Text as any).defaultProps.style = { fontFamily: 'Poppins_400Regular' };
if ((TextInput as any).defaultProps == null) (TextInput as any).defaultProps = {};
(TextInput as any).defaultProps.style = { fontFamily: 'Poppins_400Regular' };
import "./global.css";

SplashScreen.preventAutoHideAsync().catch(() => {});

function AppContent() {
  const { isDark, colors } = useTheme();
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  return (
    <Provider store={store}>
      <NavigationContainer ref={navigationRef}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={colors.bg}
          translucent={false}
        />
        <RootNavigator />
        <AppSidebar navigationRef={navigationRef} />
      </NavigationContainer>
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
    hydrateAuth();
    hydrateDriverProfile();
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
      <AppContent />
    </ThemeProvider>
  );
}
