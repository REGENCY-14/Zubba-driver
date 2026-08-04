import "dotenv/config";
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Zubba Driver",
  slug: "zubba-driver",
  scheme: "com.zubba.driver",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  icon: "./assets/ic_launcher_round.png",
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.zubbadevs.zubbadriver",
  },
  android: {
    package: "com.zubba.driver",
    adaptiveIcon: {
      foregroundImage: "./assets/ic_launcher.png",
      backgroundColor: "#FFFFFF",
    },
  },
  web: {
    favicon: "./assets/ic_launcher_round.png",
  },
  plugins: [
    "expo-font",
    [
      "expo-splash-screen",
      {
        image: "./assets/ic_launcher.png",
        imageWidth: 220,
        resizeMode: "contain",
        backgroundColor: "#FFFFFF",
      },
    ],
    "expo-status-bar",
    [
      "react-native-maps",
      {
        androidGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        iosGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    ],
  ],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    supabaseDriverDocsBucket: process.env.EXPO_PUBLIC_SUPABASE_DRIVER_DOCS_BUCKET,
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    maptilerKey: process.env.EXPO_PUBLIC_MAPTILER_KEY,
  },
});
