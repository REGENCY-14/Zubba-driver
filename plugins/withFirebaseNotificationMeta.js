const { withAndroidManifest } = require("expo/config-plugins");

// expo-notifications and @react-native-firebase/messaging both declare the default
// FCM notification icon/color meta-data. Keep the app's values (from expo-notifications)
// so the Android manifest merger does not fail.
const FIREBASE_META = [
  "com.google.firebase.messaging.default_notification_color",
  "com.google.firebase.messaging.default_notification_icon",
];

module.exports = function withFirebaseNotificationMeta(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";

    const application = manifest.application?.[0];
    for (const meta of application?.["meta-data"] ?? []) {
      if (FIREBASE_META.includes(meta.$["android:name"])) {
        meta.$["tools:replace"] = "android:resource";
      }
    }
    return config;
  });
};
