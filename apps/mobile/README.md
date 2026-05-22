# Infomii Mobile (iOS-first)

Calm travel utility app — React Native, Expo Router, TypeScript.

## Run

```bash
cd apps/mobile
npm install
npm run ios
```

Copy `.env.example` to `.env` and set:

- `EXPO_PUBLIC_SUPABASE_*` — same project as web (auth + drafts + published feed)
- `EXPO_PUBLIC_APP_URL` — share links / QR target (`/p/[slug]`)

Auth matches web: email/password, Google OAuth, plus mobile magic link & Apple (requires Supabase providers).

## Structure

- `app/` — Expo Router screens (tabs + itinerary detail)
- `src/design/` — colors, spacing, typography
- `src/data/` — sample one-day itinerary cards (no login required)
- `src/components/` — cards, explore deck, timeline
- `src/stores/` — saved library (AsyncStorage), optional Supabase auth

## Design

Soft mist blue, frosted tab bar, large cards, horizontal discovery sections, swipe explore deck. No ads, no forced login on launch.
