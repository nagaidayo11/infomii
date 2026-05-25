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

Auth matches web: **full gate** (launch requires login), email/password, Google OAuth, Apple (iOS), plus magic link. **Team invites**: enter code on login or open `infomii://invite/CODE` — redeemed via `redeem_hotel_invite` after sign-in (same as Web `/login`).

### Google OAuth（アプリに戻る設定）

モバイルは **`{EXPO_PUBLIC_APP_URL}/auth/mobile-callback`** に戻します（ログイン画面にも表示）。

1. Supabase → **Authentication → URL Configuration → Redirect URLs** に追加:
   - `https://infomii.com/auth/mobile-callback`（本番 Web と同じドメイン）
   - ローカル Web を使う場合: `http://localhost:3000/auth/mobile-callback`
2. 上記と同じ URL で Web をデプロイ（`src/app/auth/mobile-callback`）していること
3. `EXPO_PUBLIC_APP_URL` がその Web のオリジンと一致していること
4. 変更後に `npx expo start` を再起動

`infomii://` だけを Redirect URLs に入れても Supabase が Web に逃がすことがあります。**必ず `/auth/mobile-callback` の https URL を登録**してください。

## Structure

- `app/` — Expo Router screens (tabs + itinerary detail)
- `src/design/` — colors, spacing, typography
- `src/data/` — sample itinerary cards (feed; requires login to open app)
- `src/components/` — cards, explore deck, timeline
- `src/stores/` — saved library (AsyncStorage), optional Supabase auth

## Design

Soft mist blue, frosted tab bar, large cards, horizontal discovery sections, swipe explore deck. No ads.

## Cross-edit with Web (cards as source of truth)

Mobile **作る** and Web **Editor 2.0** share the same Supabase tables:

| Table | Role |
|-------|------|
| `pages` | Page metadata (`id`, `slug`, `title`) |
| `cards` | **Canonical content** (same as Web canvas) |
| `informations` | Publish state, slug mirror, legacy `content_blocks` (not written by App save) |

- **Save / publish on App** → `savePageCards` + `informations.status`
- **Form editing** → tap a card on **作る** to open native fields (hero, text, gallery, schedule, …)
- **Advanced editing** → in-app **Web エディタ** (`/editor/[pageId]`) via authenticated WebView
- **Public preview** → `/v/[slug]?preview=1` (draft) or `/p/[slug]` (published), same as Web
- **Business-only cards** (`hero_slider`, `campaign_timer`, …) → view-only on App; edit on Web with Business plan
- **Detail screen** → 「このしおりを編集」opens 作る with `pageId` + `informationId`

Set `EXPO_PUBLIC_APP_URL` to your deployed Web origin (e.g. `https://infomii.com`) so WebView and image URLs resolve correctly.
