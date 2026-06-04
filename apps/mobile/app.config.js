/**
 * Slug must match the EAS project (expo.dev → infomii). Updates are disabled below for Expo Go.
 */
/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  name: "Infomii",
  slug: "infomii",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  scheme: "infomii",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#f1f5f9",
  },
  updates: {
    enabled: false,
    checkAutomatically: "NEVER",
  },
  ios: {
    bundleIdentifier: "com.infomii.app",
    supportsTablet: true,
    associatedDomains: ["applinks:www.infomii.com", "applinks:infomii.com"],
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
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
  },
  plugins: [
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
