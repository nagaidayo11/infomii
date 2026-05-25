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

モバイル Google ログインの戻り先（ログイン画面に表示）:

- **Expo Go**: `exp://…/--/auth/callback`（端末・起動ごとに異なる場合あり）
- **開発ビルド/本番**: `https://…/auth/mobile-callback`

1. Supabase → **Redirect URLs** — **Expo Go** はログイン画面の `exp://…` をそのまま1件追加。本番ビルドは `https://infomii.com/auth/mobile-callback*`
2. Web をデプロイ（`auth/mobile-callback` — `infomii://` へは飛ばさない）
3. `npx expo start -c` で再起動

「アプリを開く」でエラーになるのは `infomii://` 未登録（Expo Go）が原因です。上記 `exp://` を登録してください。

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
