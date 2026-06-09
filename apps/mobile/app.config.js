/**
 * Slug must match the EAS project (expo.dev → infomii). Updates are disabled below for Expo Go.
 *
 * App icon assets live in ./assets/
 * - icon.png (1024×1024) — iOS App Store + default app icon
 * - android-icon-foreground.png — Android adaptive icon foreground
 * - splash-icon.png — launch splash on #16c59a (resizeMode: contain)
 * - android-icon-foreground.png — same tile as splash; background is flat #16c59a
 * - favicon.png — Expo web preview
 */
/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  name: "Infomii",
  slug: "infomii",
  version: "1.0.0",
  // react-native-iap v12 declares RCT-Folly when New Architecture is on, which
  // conflicts with Expo SDK 54 precompiled React Native during pod install.
  newArchEnabled: false,
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  scheme: "infomii",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#16c59a",
  },
  updates: {
    enabled: false,
    checkAutomatically: "NEVER",
  },
  ios: {
    bundleIdentifier: "com.infomii.app",
    supportsTablet: true,
    usesAppleSignIn: true,
    associatedDomains: ["applinks:www.infomii.com", "applinks:infomii.com"],
    entitlements: {
      "com.apple.developer.applesignin": ["Default"],
    },
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsLocalNetworking: true,
      },
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.infomii.app",
    adaptiveIcon: {
      backgroundColor: "#16c59a",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
  },
  plugins: [
    "react-native-iap",
    [
      "expo-build-properties",
      {
        android: {
          usesCleartextTraffic: true,
        },
      },
    ],
    // Push: enable after App ID has Push Notifications + matching provisioning profile.
    // See docs/APP_STORE_REVIEW.md — expo-notifications plugin removed for first App Store build.
  ],
  web: {
    favicon: "./assets/favicon.png",
  },
  extra: {
    eas: {
      projectId: "32dd7051-db3d-4cb3-bfb3-1347807bd7b8",
    },
  },
  owner: "naiai",
};
