# App Store 審査チェックリスト（Infomii iOS）

## 審査用デモアカウント（App Review Information に記載）

| 項目 | 値 |
|------|-----|
| メール | `review@infomii.com`（審査用） / `support@infomii.com`（サポート・審査ログイン確認用） |
| パスワード | `.env.local` の `APP_STORE_REVIEW_PASSWORD`（本番のみ。App Store Connect に記載） |
| 公開デモ URL | `https://www.infomii.com/p/app-store-review` |
| 備考 | Google / Apple ログインは使わずメールログインで確認可能にする |

### 推奨セットアップ（本番 DB）

```bash
# .env.local に SUPABASE_SERVICE_ROLE_KEY と APP_STORE_REVIEW_PASSWORD を設定
npm run app-store:seed-review
```

1. ワークスペース 1 件（オーナー: 審査用アカウント）
2. 公開ページ `app-store-review`（シードで `published`）
3. 無料プランのまま（有料は App Store IAP または Web Stripe の説明どおり）

提出前のローカル確認: `npm run app-store:verify`（本番 AASA を叩く。オフラインのみなら `--skip-remote`）

### Review Notes（英語例）

```
Infomii is a WebView shell for our responsive web app at https://www.infomii.com.

Sign in: email/password (demo account above), Sign in with Apple, or Google.

Subscriptions: New Pro/Business purchases on iOS use App Store In-App Purchase (StoreKit) only. Open the Plan tab (bottom navigation) to view tiers and subscribe. Restore purchases in Settings. Web (Stripe) subscribers see the same plan after login but must manage billing on the website (infomii.com). Manage App Store subscriptions in iOS Settings → Apple ID → Subscriptions.

Account deletion: Settings → Delete account.

Legal: Settings → Terms / Privacy / Commerce disclosure.
```

## App Store Connect — プライバシー

申告の目安:

- 連絡先情報（メール）
- ユーザー ID
- 利用状況データ（GA4 本番時）
- コンテンツ（ユーザー作成ページ）
- 第三者: Supabase, Stripe, Google, Apple, AI プロバイダ

## ユニバーサルリンク

1. 本番・プレビュー環境に **`APPLE_TEAM_ID`**（10文字）を設定（Vercel / `.env.local`）
2. `src/app/.well-known/apple-app-site-association/route.ts` が Team ID から AASA を返す
3. `apps/mobile/app.config.js` の `associatedDomains` を EAS ビルドに反映
4. Apple Developer → Identifiers → App ID → Associated Domains 有効化
5. `https://www.infomii.com/.well-known/apple-app-site-association` が JSON（`Content-Type: application/json`）で返ることを確認

## Sign in with Apple（Supabase）

1. Apple Developer: Services ID, Key, Team ID
2. Supabase Dashboard → Authentication → Apple を有効化
3. Redirect URL: `https://<project>.supabase.co/auth/v1/callback`
4. 本番 Web の Site URL / Redirect URLs に `https://www.infomii.com/**` を含める

## Apple In-App Purchase（StoreKit）

1. **App Store Connect** → アプリ → **サブスクリプション** でグループを作成し、次の Product ID を登録（審査用スクリーンショット付き）:
   - `com.infomii.app.pro.monthly`（Pro 月額 ¥1,280 税込）
   - `com.infomii.app.pro.annual`（Pro 年額 ¥12,800）
   - `com.infomii.app.business.monthly`（Business 月額 ¥3,480）
   - `com.infomii.app.business.annual`（Business 年額 ¥34,800）
2. **In-App Purchase 用 API キー**（.p8）を発行し、Vercel に `APPLE_IAP_*` を設定（`.env.example` 参照）
3. **App Store Server Notifications** の Production / Sandbox URL を `https://www.infomii.com/api/apple/webhook` に設定
4. Supabase マイグレーション `20260609120000_apple_iap_subscriptions.sql` を適用
5. iOS は **EAS ビルド必須**（`react-native-iap`）。Expo Go では課金テスト不可
6. サンドボックス Apple ID で Plan タブから購入 → サーバー同期 → Web でも同プラン表示を確認
7. 解約テスト: Plan タブの **「App Store で解約・プラン変更」** または 設定 → App Store → サンドボックスアカウント（TestFlight では通常の「サブスクリプション」に表示されない場合あり）

### 審査用スクリーンショット（Plan タブ）

1. 開発サーバー起動: リポジトリルートで `npm run dev`
2. 自動キャプチャ（Plan タブ含む）:
   ```bash
   npm run app-store:capture-screenshots
   # Plan タブのみ: APP_STORE_CAPTURE_ONLY=06 npm run app-store:capture-screenshots
   ```
3. 出力: `public/app-store/screenshots/raw/06-billing.png`（Free プラン・Pro/Business 申し込みボタン・料金表）
4. 手動の場合: ログイン後、下部ナビの **プラン** → 画面全体を撮影（Stripe の表記が出ていないことを確認）
5. 別端末: 同じ Infomii アカウントでログインすればプランは自動共有（手動の「購入復元」は不要）

## プッシュ通知

- ネイティブ: `apps/mobile/src/lib/push-notifications.ts`（Expo Push Token 取得用。v1 では**起動時に許可ダイアログを出さない**）
- API: `POST /api/push/register`（Bearer セッション必須）
- DB: `supabase/migrations/20260604100000_push_device_tokens.sql` を適用

トークン登録は WebView からセッションを渡すブリッジ実装後、設定画面のユーザー操作から許可を取る予定です。
