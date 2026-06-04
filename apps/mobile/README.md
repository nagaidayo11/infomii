# Infomii Mobile (Expo)

Web-first の Infomii を **WebView シェル**で包む iOS / Android アプリです。  
UI・認証・課金はすべて Web（Next.js）側。ネイティブは起動と WebView のみ。

## 前提

- Node.js 20+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)（`npx expo` で可）
- iOS: Xcode + Simulator（Mac）
- Android: Android Studio + エミュレータ

## SDK

**Expo SDK 54** — App Store / Google Play の **Expo Go** と互換（実機で QR スキャン可能）。

## Expo Go で確認（実機）

1. iPhone に **Expo Go** をインストール（App Store）
2. リポジトリルートで **`npm run dev:lan`**（実機から届くよう `0.0.0.0` で起動。`npm run dev` だけでは不可）
3. 別ターミナル:

```bash
cd apps/mobile
echo 'EXPO_PUBLIC_WEB_ORIGIN=http://YOUR_MAC_IP:3000' > .env   # 実機は 127.0.0.1 不可
# 本番 Web だけ見る場合: EXPO_PUBLIC_WEB_ORIGIN=https://www.infomii.com
npm run start:clear   # または npm run restart
```

> **`npx expo start -c` は使わないでください**（`EXPO_NO_METRO_LAZY` が付かず接続エラーになりやすい）。必ず `npm run start` / `npm run restart` を使います。

4. 表示された **QR コード**を Expo Go でスキャン（**ホームの「最近」から開かない**）

> **重要:** 「New update available, downloading…」で止まる場合  
> 1. iPhone で **Expo Go を削除→再インストール**（または設定でデータ消去）  
> 2. **Mac の「ターミナル.app」**で `npm run restart:tunnel`（Cursor 内ターミナルだと失敗することがあります）  
> 3. ターミナルに **`iOS Bundled`** が出てから QR をスキャン

Mac の IP 確認: `ipconfig getifaddr en0`

### トラブルシュート

| 症状 | 対処 |
|------|------|
| `Port 8081 is running` / Expo が起動しない | `cd apps/mobile && npm run restart` |
| `Could not connect to development server` | ① **`npm run restart`**（`npx expo start` 禁止）② ターミナルに **「iOS Bundled」** が出てから接続 ③ **シミュレータ**は `npm run ios` または `npm run restart:sim`（LAN IP ではなく localhost）④ 実機は **設定 → Expo Go → ローカルネットワーク ON** ⑤ ダメなら `npm run restart:tunnel` |
| `Missing script: dev:lan` | **`dev:lan` はリポジトリルート**で実行 |
| iPhone が「downloading…」で止まる | Expo Go を終了 → `npm run restart` → QR を読み直し |

SDK 54 は lazy bundling 既定のため、起動スクリプトで `EXPO_NO_METRO_LAZY=1` を付けています。

## ブラウザでも確認可（UI だけ速い）

1. `npm run dev`（ルート）
2. http://127.0.0.1:3000/dashboard?client=app（DevTools のスマホ幅）

通常 Web UI: `?client=web` または `?client=app` を外す。

## セットアップ

```bash
cd apps/mobile
cp .env.example .env
npm install
```

### 本番 Web を開く（デフォルト）

`.env` の `EXPO_PUBLIC_WEB_ORIGIN` を省略するか `https://www.infomii.com` にします。

### ローカル Next.js を開く

1. リポジトリルートで `npm run dev`（`http://127.0.0.1:3000`）
2. `apps/mobile/.env` に次を設定:

```bash
EXPO_PUBLIC_WEB_ORIGIN=http://127.0.0.1:3000
```

3. iOS シミュレータから実機 IP が必要な場合は、マシンの LAN IP に差し替え（例: `http://192.168.1.10:3000`）。

## 起動

**必ず `apps/mobile` で実行**（リポジトリルートで `expo start` すると SDK 未検出エラーになります）。

```bash
cd apps/mobile
npm start
# またはリポジトリルートから
# npm run mobile
```

```bash
npm run ios           # iOS シミュレータ（localhost で Metro に接続）
npm run restart:sim   # シミュレータ向けにキャッシュクリアして起動
npm run android       # Android エミュレータ
```

初回 URL: `{ORIGIN}/dashboard?client=app`  
Web 側でアプリ用 5 タブ・エディタ UI が有効になります（Phase 1）。

## Web との連携

| 仕組み | 用途 |
|--------|------|
| `?client=app` | 初回ロード |
| Cookie `infomii_client=app` | 以降のナビゲーション |
| User-Agent `InfomiiApp/1.0` | `applicationNameForUserAgent` |
| `window.__INFOMII_CLIENT__ = 'app'` | JS 注入（ページ読み込み前） |

認証は **WebView 内 Cookie**（Supabase）。旧 `infomii://auth` / `mobile-callback` は使いません。

## リリースの考え方

| 変更 | 再ビルド |
|------|----------|
| Web UI・API・料金ページ | 不要（Vercel デプロイのみ） |
| WebView 設定・アイコン・ネイティブ権限 | 必要（EAS Build → TestFlight / Play 内部テスト） |

### TestFlight / Play 内部テスト（概要）

1. [EAS](https://expo.dev/eas) でプロジェクト作成し、`app.json` の `extra.eas.projectId` を設定
2. `eas build --platform ios` / `android`
3. `eas submit` またはストアコンソールから TestFlight / 内部テストトラックへ
4. テスター招待 → インストール → Web は本番 URL のまま検証

## ストア ID

- iOS: `com.infomii.app`
- Android: `com.infomii.app`

## App Store 提出前

- [docs/APP_STORE_REVIEW.md](../docs/APP_STORE_REVIEW.md) — 審査用アカウント、Review Notes、Universal Links、Apple OAuth
- 本番に `APPLE_TEAM_ID` を設定（`/.well-known/apple-app-site-association` は Next の動的ルート）
- `npm install` 後に EAS Build（初回提出は Push なし。後から `expo-notifications` を追加可）

## 実装済み（ストア向け）

- Sign in with Apple（Web ログイン画面。Supabase Apple プロバイダ要設定）
- ユニバーサルリンク（`associatedDomains` + AASA）
- プッシュ通知（初回 App Store ビルドではオフ。API は Web 側に用意済み）

## トラブルシュート

- **`expo` is not installed`（ルートで実行）**: `cd apps/mobile` してから `npx expo start`。またはルートで `npm run mobile`。
- **Expo Go「requires newer version」**: `apps/mobile` で `npm install` 後、`npx expo start -c` を再実行。SDK は 54 固定です。
- **真っ白 / 接続エラー**: `EXPO_PUBLIC_WEB_ORIGIN` と Next.js の起動を確認。ローカルは HTTP 許可（`app.json` の ATS / cleartext）済み。
- **ログイン後にループ**: Supabase の Redirect URL に `https://www.infomii.com/**` が含まれているか確認。
- **Stripe**: Checkout は WebView 内で `checkout.stripe.com` へ遷移（許可リスト済み）。
