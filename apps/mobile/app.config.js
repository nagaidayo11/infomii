/**
 * Local dev: disable OTA updates (stops "New update available, downloading…" in Expo Go).
 * Slug infomii-dev avoids fetching published @naiai/infomii from Expo servers.
 */
/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  name: "Infomii",
  slug: "infomii-dev",
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
    [
      "expo-notifications",
      {
        icon: "./assets/icon.png",
        color: "#0d9488",
      },
    ],
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
