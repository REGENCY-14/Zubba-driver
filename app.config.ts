import "dotenv/config";
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Zubba Driver",
  slug: "zubba-driver",
  owner: "andyaa",
  scheme: "com.zubba.driver",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  icon: "./assets/ic_launcher_round.png",
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.zubbadevs.zubbadriver",
    googleServicesFile: process.env.GOOGLE_SERVICE_INFO_PLIST ?? "./GoogleService-Info.plist",
    infoPlist: {
      UIBackgroundModes: ["remote-notification"],
    },
  },
  android: {
    package: "com.zubba.driver",
    // On EAS Build this is the path of the uploaded file env var; the file itself is gitignored.
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
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
        backgroundColor: "#2EA043",
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
    "@react-native-firebase/app",
    "@react-native-firebase/messaging",
    "./plugins/withFirebaseNotificationMeta",
    [
      "expo-build-properties",
      {
        android: {
          buildArchs: ["arm64-v8a"],
          cmakeVersion: "4.1.2",
        },
        ios: {
          // Required by React Native Firebase on iOS.
          useFrameworks: "dynamic",
        },
      },
    ],
    [
      "expo-notifications",
      {
        icon: "./assets/ic_launcher.png",
        color: "#2EA043",
      },
    ],
  ],
  extra: {
    eas: {
      projectId: "cf088b54-0a40-4a5c-a1ce-5924ddd1c386",
    },
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    supabaseDriverDocsBucket: process.env.EXPO_PUBLIC_SUPABASE_DRIVER_DOCS_BUCKET,
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    maptilerKey: process.env.EXPO_PUBLIC_MAPTILER_KEY,
    paystackPublicKey: process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY,
  },
});
