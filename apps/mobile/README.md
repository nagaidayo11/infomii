# Hotel Idle Mobile (Expo)

## Setup

```bash
cd /Users/nagai/Desktop/hotel/apps/mobile
npm install
npm run start
```

## Ad Reward Runtime

- Expo Go: falls back to mock ad flow automatically.
- Dev Build: uses `react-native-google-mobile-ads` rewarded ads.

## Enable Real Rewarded Ads (Dev Build)

1. Install dependencies:

```bash
cd /Users/nagai/Desktop/hotel/apps/mobile
npm install
```

2. Optional env vars for rewarded ad unit IDs (`.env`):

```bash
EXPO_PUBLIC_ADMOB_REWARDED_IOS=ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx
EXPO_PUBLIC_ADMOB_REWARDED_ANDROID=ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx
```

3. Build with native modules:

```bash
npx expo prebuild
npx expo run:ios
# or
npx expo run:android
```

## What is migrated

- Core economy loop (passive income + check-in tap)
- Hotel grid growth
- Upgrades
- Achievements
- Save/load with AsyncStorage
- Ad reward mock flow (2x boost / instant reward + cooldown)

## Next replacement point

- Real SDK adapter is already wired in `src/ads/rewarded-ad.ts`.
- Replace test app IDs in `app.json` before production release.
