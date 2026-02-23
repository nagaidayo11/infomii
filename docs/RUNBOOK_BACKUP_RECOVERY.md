# Backup & Recovery Runbook

最終更新: 2026-02-20
対象: `Store Information`（Next.js + Supabase + Stripe）

## 0. 目的
- 障害時に「迷わず復旧」できること
- 誤操作時に「戻せる」こと
- 本番運用前に手順を1回リハーサルすること

## 1. 体制と判断
- 一次対応: 運用担当ユーザー（運用センターに入れるユーザー）
- 重大インシデント判定:
  - 決済が通るのにプラン反映されない
  - 全ユーザーがログイン後に操作不能
  - 公開ページが連続して 5xx / 4xx を返す

## 2. 障害時の共通フロー（最初に必ず実施）
1. 影響範囲を確認
   - `運用センター` の環境チェック
   - 監査ログの直近イベント
2. 一時対処を先に実施
   - 課金反映不整合なら `Stripeを手動同期`
   - 所属不整合なら `施設所属を再同期`
3. 復旧完了を検証
   - 任意ユーザーでログイン確認
   - 公開ページ表示確認（QR経由含む）
4. インシデント記録
   - 発生時刻、原因、対応、再発防止を残す

## 3. ケース別復旧手順

### 3-1. Supabaseキー更新時
症状:
- `Invalid API key`
- `Supabase service role env が未設定です`

対応:
1. Supabase Project Settings > API で最新キーを確認
2. `.env.local` と本番環境変数を更新
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. サーバー再起動
4. 検証
   - ログイン
   - 新規ページ作成
   - 運用センター表示

完了条件:
- ダッシュボード/編集画面が正常表示
- エラー通知に同種エラーが再発しない

### 3-2. Webhook不達 / 課金反映遅延
症状:
- 決済完了後も `free` のまま
- Stripe CLIで `/api/stripe/webhook` が 4xx

対応:
1. `STRIPE_WEBHOOK_SECRET` を確認
2. ローカル検証（必要時）
   - `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. `運用センター` で `Stripeを手動同期` を実行
4. 監査ログで `billing.subscription_synced` 系イベント確認
5. 必要ならテスト決済を再実行

完了条件:
- プラン表示が期待値に一致
- Webhookが 200 で受信

### 3-3. RLSエラー時
症状:
- `new row violates row-level security policy`
- 所属情報が見つからない

対応:
1. `運用センター` で `施設所属を再同期` 実行
2. Supabase SQL Editor で対象ユーザーの membership を確認
3. 不足時は管理者で membership を補正

確認SQL:
```sql
select user_id, hotel_id, created_at
from public.hotel_memberships
order by created_at desc
limit 20;
```

完了条件:
- 新規作成/保存が通る
- 監査ログにエラー連発がない

## 4. 誤削除時の復元手順

### 4-1. 5秒以内
- UIの `取り消し` で復元（最優先）

### 4-2. 5秒を過ぎた場合
現状:
- アプリに「ごみ箱」は未実装

運用:
1. 直近の監査ログから削除対象タイトルと時刻を特定
2. 可能なら Supabase バックアップ/PITR から復元
3. 復元できない場合はテンプレートから再作成

## 5. バックアップ方針（最低限）
- 週1で以下テーブルをエクスポート（CSV/SQL）
  - `public.informations`
  - `public.subscriptions`
  - `public.hotel_memberships`
  - `public.audit_logs`
- 大きな仕様変更前は臨時バックアップを追加

## 6. 本番前リハーサル（必須）
実施日を決めて、以下を連続で実行:
1. Webhook一時停止想定 → 手動同期で復旧
2. membership不整合想定 → 再同期で復旧
3. 誤削除想定 → 5秒取り消しで復元
4. 別ユーザーでも同じ復旧導線が使えるか確認

記録テンプレート:
- 発生時刻:
- 症状:
- 原因:
- 対応:
- 復旧時刻:
- 再発防止:

## 7. 連絡テンプレート（障害告知）
```text
現在、一部機能で障害を確認しています。
影響: {影響内容}
対応状況: {対応中/復旧済み}
次回更新予定: {時刻}
```
