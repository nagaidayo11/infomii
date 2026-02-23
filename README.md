## Hotel Information Builder (MVP)

ホテル向けインフォメーション作成サービスのMVPです。

### 画面
- `/login` ログイン/新規登録
- `/dashboard` ダッシュボード
- `/editor/[id]` 編集画面
- `/p/[slug]` 公開ページ

### テンプレート
- ダッシュボード内の `作成` タブで、ホテル運用向けテンプレを選択して新規作成できます。
- `ダッシュボード` タブと `作成` タブを切り替えて運用画面と作成画面を分離できます。
- ホテルタイプ別フィルタ:
  - すべて
  - ビジネス
  - リゾート
  - 旅館
- 収録テンプレ:
  - 【ビジネス】チェックイン・館内基本案内
  - 【ビジネス】朝食案内
  - 【ビジネス】連泊清掃のご案内
  - 【リゾート】アクティビティのご案内
  - 【リゾート】プール利用案内
  - 【リゾート】ハッピーアワーのご案内
  - 【旅館】お食事処のご案内
  - 【旅館】大浴場・貸切風呂のご案内
  - 【旅館】館内での過ごし方

### セットアップ
```bash
npm install
cp .env.example .env.local
npm run dev
```

### Supabase準備
1. Supabaseプロジェクトを作成
2. SQL Editorで `supabase/schema.sql` を実行
3. `.env.local` に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定

### 認証
- 管理画面 (`/dashboard`, `/editor/[id]`) はログイン必須です。
- `/login` でメールアドレス+パスワードのログイン/新規登録ができます。
- 既に `supabase/schema.sql` を実行済みの場合も、認証/施設分離ポリシー反映のため再実行してください。

### 施設分離
- 初回ログイン時にホテル情報が自動作成され、ユーザーはその施設に紐づきます。
- `informations.hotel_id` とRLSにより、管理画面では自施設データのみ参照/更新できます。
- ダッシュボードの「施設設定」から施設名を更新できます（`schema.sql` 再実行後）。

### スタッフ招待
- ダッシュボードの「スタッフ招待」で招待コードを発行できます。
- スタッフは `/login` の「招待コード」にコードを入力して新規登録/ログインすると同じ施設に参加できます。
- 招待コードは初回使用時に自動で無効化されるため、使い捨てで運用できます。

### 公開予約
- 編集画面で `公開開始日時 / 公開終了日時` を設定できます。
- 公開ページは `status=published` かつ予約時間内のみ表示されます。

### 課金土台（施設単位）
- `subscriptions` テーブルで `plan/status/max_published_pages` を管理します。
- ダッシュボードの「契約プラン」から `free/pro` とステータスを更新できます（MVP運用用）。
- `free` プランは公開上限3件、`pro` は公開上限1000件です。
- 上限に達した状態で下書きを公開しようとするとエラーになります。

### Stripe連携（Checkout + Webhook）
1. Stripeで `Pro` 用の月額Priceを作成し、`STRIPE_PRO_PRICE_ID` に設定
2. `.env.local` に以下を設定
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
3. Stripe Dashboard でWebhookエンドポイントを作成
   - URL: `https://<your-domain>/api/stripe/webhook`
   - イベント: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. ローカル検証時は Stripe CLI で転送
   - `stripe listen --forward-to localhost:3000/api/stripe/webhook`
5. Webhook失敗通知を使う場合（任意）
   - `.env.local` に `SLACK_WEBHOOK_URL` を設定
   - 失敗時にイベント種別/ID/エラー内容をSlack通知

### Stripe Customer Portal（請求書・カード管理）
- ダッシュボードの「請求書・カード管理」ボタンからStripe Customer Portalへ遷移できます。
- 前提:
  - `STRIPE_SECRET_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_APP_URL`
  - Checkoutを1回実行済み（`subscriptions.stripe_customer_id` が保存されていること）
- 未契約状態で押した場合は「先にアップグレードを実行してください。」のエラーを返します。

### 補足
- Supabase未設定時は認証画面で設定案内を表示します。
- 公開ページ `/p/[slug]` はログイン不要です。
- スキーマ更新を反映するため、機能追加時は `supabase/schema.sql` を再実行してください。

### ブロックエディタ（MVP）
- 編集画面で以下ブロックを追加できます。
  - 見出し
  - 段落
  - 画像
  - 区切り線
- ブロックは並び替え / 削除に対応しています。
- デザイン設定（背景色 / 文字色 / タイトルサイズ / 本文サイズ）を変更できます。
- これらは `informations.content_blocks` / `informations.theme` に保存され、公開ページにも反映されます。

### 閲覧分析（直近7日）
- 公開ページ `/p/[slug]` の表示時に `information_views` へ閲覧ログを記録します。
- 編集画面のQR画像は `?src=qr` を付与して生成されるため、QR経由数を分離して集計できます。
- ダッシュボードで以下を確認できます。
  - 総閲覧数（7日）
  - QR経由数（7日）
  - 本日の閲覧数
  - 本日のQR経由数
  - 閲覧上位ページ（Top 5）

### 監査ログ
- `audit_logs` テーブルに主要操作の履歴を記録します。
- ダッシュボードで最新20件を確認できます。
- 現在の記録対象:
  - インフォメーション新規作成
  - 公開 / 下書き戻し
  - 施設名更新
  - プラン更新
  - 招待コード発行 / 無効化
