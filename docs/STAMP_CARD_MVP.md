# スタンプカード MVP — 作業メモ / 手動確認手順

## 設計（最小）

| ルート | 役割 |
| --- | --- |
| `/s/p/{slug}` | 入口（個人カード発行 / 任意復元） |
| `/s/{token}` | マイカード（進捗・押印・利用・任意アカウント保存） |
| `/s/press/{stampCode}` | 押印QRのシステムカメラ読取時の案内 |
| `/editor/stamp/{pageId}` | 施設向け編集・QR・運用 |
| `/api/stamp/*` | 発行・付与・交換・運用・復元 |

データ: `pages.kind='stamp'` + `stamp_programs` / `stamp_cards` / `stamp_events` / `stamp_redemptions`  
進捗はイベント集計。ゲストはログイン不要で開始可能。Businessのみ。  
カードは常時**10枠**。ゲストは **5個特典 / 10個特典** を選択。利用するとその個数分を消費し、余りは残る。

## 押印ルール（1日1回）

- 既定: **施設タイムゾーンの午前4時にリセットする 1日1回**
- `stamp_programs.once_per_day` + `timezone`（IANA）
- ゲスト押印は `stamp_events.stamp_day` で同一カード・同一営業日を一意制約
- レガシー行（`stamp_day` null）は `created_at` から営業日を推定（backfill マイグレーションあり）
- スタッフ手動付与はこの制限の対象外

## 特典利用フロー

スタッフが目の前で確認したうえで、ゲストがマイカードから利用する。

1. 「スタッフ確認のうえ利用」をタップ  
2. 確認ダイアログ 1/3（スタッフ確認済みか）  
3. 確認ダイアログ 2/3（特典内容・消費数）  
4. 確認ダイアログ 3/3（最終確認）→ スタンプ消費  

消費はDB関数 `stamp_redeem_atomic`（対象カード行を `for update` でロック）で原子的に処理し、
同時タップによる二重消費を防ぐ。余りスタンプの引き継ぎも同一トランザクション内で行う。

## 押印QR（任意で回転式）

- 既定は固定の印刷用QR（`/s/press/{stamp_code}`）。
- `stamp_programs.rotating_qr = true` にすると、会計時にスタッフ端末で
  約90秒ごとに変わるQRを表示（`/api/stamp/programs/{pageId}/press-token`）。
- サーバは `stamp_code` を秘密鍵にした時間バケットのHMACトークンを検証（現在±1バケット許容）。
- 写真の使い回しを短時間に限定できる。回転式のときは印刷不可。

## 任意のアカウント復元

- Google / Apple でカードを任意保存（`stamp_cards.owner_user_id`）
- 入口で同じアカウントなら保存済みカードを復元
- 認証なしでも利用可（端末の localStorage + ブックマーク）
- スタンプゲストの OAuth 戻り先は `/s/...`。施設ワークスペースは自動作成しない
- 再発行時も `owner_user_id` を引き継ぐ
- 端末カードと保存済みカードが競合する場合は、統合せず**どちらを使うか選択**（`resolve: current | existing`）。
  「今の端末」を選ぶと保存済みカードは revoke される

### Auth プロバイダ設定（必須）

ゲストの「保存 / 復元」は施設ログインと同じ Supabase Auth プロバイダを使います。

1. Supabase Dashboard → Authentication → Providers  
2. **Google** / **Apple** を有効化（Client ID / Secret を設定）  
3. Redirect URLs にサイトの `/auth/callback` を許可  
   - 例: `https://www.infomii.com/auth/callback`  
   - ローカル: `http://localhost:3000/auth/callback`  
4. Apple は Services ID と Return URL も Dashboard 側と一致させる  

未設定の環境ではボタンは出ますが OAuth 開始時にエラーになります。施設オーナーの Google/Apple ログインが動いていれば、スタンプ復元も同じ設定で動きます。

編集画面の Live プレビューは演出確認用。実機のカメラ読取・1日1回制限・確認ダイアログとは別です。

## マイグレーション

```bash
# Supabase に適用
supabase db push
# または SQL Editor で stamp_* マイグレーションを順に適用
# … 20260727120000_stamp_daily_and_auth.sql まで
```

## 手動確認手順

1. Business施設でログイン → ページ一覧 →「スタンプカード」作成  
2. `/editor/stamp/{id}` で特典・「1日1回」・タイムゾーンを保存 →「公開する」  
3. 入口QR（または `/s/p/{slug}`）を別端末で開く →「カードをはじめる」  
4. マイカードでスキャン → 押印QRを読む  
5. 同日再スキャンで「本日分は済み」になること  
6. Google/Appleで保存 → 別ブラウザで入口から「復元」できること  
7. 5個以上で確認ダイアログ3回 → 余りが残ること  

## Phase 2（未実装 / TODO）

- 押印QR短命化
- 付与・交換の分析ダッシュボード
- 案内ページからの導線ブロック
