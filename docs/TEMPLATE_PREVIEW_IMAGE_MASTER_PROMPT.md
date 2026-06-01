# Infomii テンプレート画像 マスタープロンプト（BtoC + App表示修正）

テンプレート一覧サムネイル（`public/templates/previews/<category>/<slug>.jpg`）と、シード内ヒーローカードの `image` フィールドに同じパスを使います。**1枚の生成画像を両方に流用**してください。

---

## 1. 目的

| 対象 | 要件 |
|------|------|
| **新規16テンプレ**（food / lightbiz / 既存カテゴリ追加分） | テーマに合った写真風キービジュアルを生成し配置 |
| **既存9 BtoCテンプレ** | 必要に応じて差し替え（現在はプレースホルダーまたは旧プール画像） |
| **App版表示** | Expo WebView でもサムネ・ヒーローが表示されること（コード側は `unoptimized` 対応済み） |

---

## 2. 技術仕様（必須）

| 項目 | 値 |
|------|-----|
| ファイル形式 | JPEG（`.jpg`） |
| 推奨解像度 | **1920 × 1152**（5:3 横） |
| 保存パス | `public/templates/previews/{category}/{slug}.jpg` |
| DB | `preview_image` と hero の `content.image` は `/templates/previews/...`（先頭スラッシュ） |
| 同期 | 画像配置後 `GET /api/seed-templates?sync=1&v=12`（`MARKETPLACE_SEED_VERSION` を確認） |

### グローバル NG（全テンプレ共通）

- 読める文字・ロゴ・透かし・UI モック・スクリーンショット
- ぼやけ・極端な暗さ・不自然な AI 顔
- **宿泊施設テンプレ向けの「外観だけのホテル正面」**を BtoC に流用しない

### BtoC 共通 OK

- フォトリアル or 高品質イラスト（テンプレのトーンに合わせる）
- **体験・シーン・人物のシルエット**（顔は識別不可でも可）
- スマホで見たとき一覧カード（5:3）の主題が一目で分かる構図

---

## 3. カテゴリ別スタイル指針

| category | トーン | 色・雰囲気 |
|----------|--------|------------|
| `travel` | 友達旅行・しおり | 明るい自然光、駅・街・荷物・地図感 |
| `oshi` | 推し活・ライブ | 会場・グッズ・ネオン寄り、エネルギー高め（文字なし） |
| `personal` | おでかけ・イベント・リンク | カフェ・街・パーティ、親しみやすい |
| `food` | キッチンカー・飲食 | 屋台・トラック・食事の手元・屋外マルシェ、食欲系 |
| `lightbiz` | 小規模店舗・教室・軽B2B | サロン・スタジオ・オフィス受付、清潔・プロだが堅すぎない |

---

## 4. 作業フロー

```bash
# 1) BtoC プロンプト定義 → manifest 生成（英語プロンプト、25件）
npm run templates:previews:btoc:manifest
#    → public/templates/previews/manifest-btoc.json

# 2) OpenAI で一括生成（.env.local に OPENAI_API_KEY）
npm run templates:previews:btoc:openai
#    1件だけ: npm run templates:previews:btoc:openai -- --slug=food-kitchen-car-today
#    先頭3件: npm run templates:previews:btoc:openai -- --limit=3

# 3) 不足分のプレースホルダー一括（開発用・任意）
node scripts/sync-btoc-preview-images.mjs

# 4) ホテル向け（別 manifest）
npm run templates:previews:openai

# 5) DB 反映（ブラウザで /templates を開くか API）
# GET /api/seed-templates?sync=1&v=12
```

**ソース:** 英語プロンプトの正本は `scripts/btoc-preview-prompt-data.mjs`。`manifest-btoc.json` は上記 manifest コマンドで再生成します。

### App 表示修正（実装済み）

- `src/lib/static-image.ts` … `/templates/`・`/preset-` は Next/Image `unoptimized`
- `HeroCard` / `TemplateCard` / `GalleryCard` / `ImageCard` で使用
- サムネ読み込み失敗時はカテゴリフォールバックへ

---

## 5. テンプレート別プロンプト一覧

**英語プロンプト（推奨）:** `public/templates/previews/manifest-btoc.json`（`npm run templates:previews:btoc:manifest` で `scripts/btoc-preview-prompt-data.mjs` から再生成）。OpenAI 一括は `npm run templates:previews:btoc:openai`。

**使い方（下記日本語版）:** 各ブロックをそのまま画像モデルに渡す。末尾の `保存:` 行は作業者用（モデルには不要）。

---

### travel（旅行しおり）

#### `travel-itinerary` — 旅行しおり・基本セット
```
BtoCテンプレ一覧用キービジュアル。京都の友達旅行、新幹線と宿と街歩きの期待感。
フォトリアル、5:3横、1920x1152。和装の街並みとリュックサックの旅行者シルエット、明るい午前光。
読める文字・駅名・看板文字は禁止。テンションは楽しげでカジュアル。
保存: public/templates/previews/travel/travel-itinerary.jpg
```

#### `travel-weekend` — 週末旅行・おでかけセット
```
箱根日帰り旅行のキービジュアル。ロマンスカーと温泉街、軽い霧、友人2人の後ろ姿。
フォトリアル、5:3、明るく爽やか。料理のクローズアップは主役にしない。
保存: public/templates/previews/travel/travel-weekend.jpg
```

#### `travel-group` — グループ旅行・役割分担セット
```
沖縄3泊のグループ旅行。青い海、レンタカー、ビーチと宿のイメージ、5人グループのシルエット。
フォトリアル、5:3、夏のハイサチュレーション。文字・ロゴなし。
保存: public/templates/previews/travel/travel-group.jpg
```

#### `travel-camp-outdoor` — キャンプ・アウトドアしおり
```
富士山麓キャンプ。テント、タープ、夕方の焚き火、星空がわずかに見える。
フォトリアル、5:3、仲間のシルエットと自然。ホテル外観は入れない。
保存: public/templates/previews/travel/travel-camp-outdoor.jpg
```

---

### oshi（推し活）

#### `oshi-live-set` — 推し活・ライブまとめセット
```
ライブ会場前の推し活シーン。ペンライトの光の海、会場外観の抽象、若者のシルエット。
5:3、夜景、エネルギッシュ。アーティストの顔・固有名・文字は不可。
保存: public/templates/previews/oshi/oshi-live-set.jpg
```

#### `oshi-fan-meet` — 推し活・ファンイベントセット
```
ファンミーティング会場のイメージ。整列する列、ステージ方向の光、控えめなイラスト風グッズ袋。
5:3、室内イベント、文字なし。
保存: public/templates/previews/oshi/oshi-fan-meet.jpg
```

#### `oshi-link-hub` — 推し活・リンクハブセット
```
スマホでリンクを集める推し活イメージ。グラデーション背景にアイコン風シェイプ（文字は不可読）。
5:3、ポップで現代的、紫とピンクのアクセント。
保存: public/templates/previews/oshi/oshi-link-hub.jpg
```

#### `oshi-offline-meetup` — オフ会・ファン交流会
```
カフェ貸切のオフ会。少人数がテーブルで談笑、推し色のアクセント照明。
フォトリアル、5:3、温かい室内、顔は識別不可の距離感。
保存: public/templates/previews/oshi/oshi-offline-meetup.jpg
```

---

### personal（おでかけ・リンク）

#### `personal-date-plan` — おでかけ・デートプランセット
```
渋谷のデート午後。カフェテラス、街路樹、カップ2つ、柔らかい逆光。
フォトリアル、5:3、親しみやすい。文字なし。
保存: public/templates/previews/personal/personal-date-plan.jpg
```

#### `personal-link-collection` — リンク集・プロフィールセット
```
クリエイター向けリンク集のイメージ。ミニマルなデスク、ノートPC、観葉植物、パステル壁。
5:3、清潔でフレンドリー、SNS感は抽象シェイプのみ。
保存: public/templates/previews/personal/personal-link-collection.jpg
```

#### `personal-event-guide` — イベント・勉強会案内セット
```
小規模勉強会。コワーキングの明るい空間、ノートPC、ホワイトボード（文字なし）、参加者の後ろ姿。
5:3、フォトリアル、学びの雰囲気。
保存: public/templates/previews/personal/personal-event-guide.jpg
```

#### `personal-wedding-party` — 結婚式・二次会向け案内
```
結婚式パーティの祝福シーン。テーブル装花、シャンパングラス、柔らかい室内照明。
5:3、フォトリアル、上品で華やか、顔は識別不可。
保存: public/templates/previews/personal/personal-wedding-party.jpg
```

#### `personal-housewarming` — 新居・ハウスwarming
```
新居パーティ。リビング、段ボールと観葉植物、友人がソファで談笑。
5:3、明るい自然光、ホームパーティ感。
保存: public/templates/previews/personal/personal-housewarming.jpg
```

---

### food（キッチンカー・飲食）

#### `food-kitchen-car-today` — キッチンカー・今日の出店
```
キッチンカーでのたこ焼き提供。カラフルな屋台、鉄板の湯気、公園のイベント空間。
5:3、昼間、食欲をそそるが油汚れのクローズアップ主役は避ける。文字・屋台名なし。
保存: public/templates/previews/food/food-kitchen-car-today.jpg
```

#### `food-truck-weekly` — フードトラック・週間スケジュール
```
フードトラックと都市のオフィス街。トラック横に並ぶ人々のシルエット、バーガーとポテトの手元。
5:3、ランチタイムの明るい光。
保存: public/templates/previews/food/food-truck-weekly.jpg
```

#### `food-festival-stall` — マルシェ・フェス出店案内
```
マルシェのクレープ屋台。テント、列、夏の屋外、子連れのシルエット。
5:3、にぎやかだが整理された構図、文字なし。
保存: public/templates/previews/food/food-festival-stall.jpg
```

#### `food-preorder-pickup` — 取り置き・事前予約
```
お弁当の受け取り。店頭カウンター、おしゃれな弁当箱、店主の手元のみ。
5:3、清潔感、小規模デリの雰囲気。
保存: public/templates/previews/food/food-preorder-pickup.jpg
```

#### `food-cafe-popup` — カフェ・ポップアップ1日店
```
1日限りのポップアップカフェ。ギャラリー空間、ラテアート、焼き菓子のディスプレイ。
5:3、北欧風インテリア、文字なし。
保存: public/templates/previews/food/food-cafe-popup.jpg
```

---

### lightbiz（小規模店舗・軽B2B）

#### `lightbiz-salon` — 美容室・サロン案内
```
美容サロンの受付。鏡、椅子、観葉植物、温かい間接照明。清潔でおしゃれ。
5:3、フォトリアル、顧客の後ろ姿のみ。ホテルロビー感は避ける。
保存: public/templates/previews/lightbiz/lightbiz-salon.jpg
```

#### `lightbiz-fitness-studio` — ヨガ・フィットネススタジオ
```
ヨガスタジオ。マット、大きな窓、朝光、インストラクターのシルエット。
5:3、明るく健康的。
保存: public/templates/previews/lightbiz/lightbiz-fitness-studio.jpg
```

#### `lightbiz-classroom` — 教室・講座・スクール案内
```
小規模セミナールーム。プロジェクター光（画面は抽象）、ノートPC、10人規模の座席。
5:3、プロフェッショナルだが堅苦しくない。
保存: public/templates/previews/lightbiz/lightbiz-classroom.jpg
```

#### `lightbiz-popup-shop` — ポップアップショップ・期間限定店
```
期間限定アパレルポップアップ。衣装ラック、ミニマルな陳列、渋谷系街並みが背景に少し。
5:3、おしゃれでトレンド感、文字なし。
保存: public/templates/previews/lightbiz/lightbiz-popup-shop.jpg
```

#### `lightbiz-office-visit` — 小規模オフィス・来訪案内
```
スタートアップオフィスの受付。ガラス扉、観葉植物、明るい廊下、名刺交換の手元。
5:3、B2Bだが親しみやすい。巨大企業ロビーの迫力は避ける。
保存: public/templates/previews/lightbiz/lightbiz-office-visit.jpg
```

#### `lightbiz-freelance-portfolio` — フリーランス・サービス案内
```
フリーランスデザイナーのワークスペース。デュアルモニター、スケッチ、コーヒー、ミニマルデスク。
5:3、クリエイティブで信頼感、文字なし。
保存: public/templates/previews/lightbiz/lightbiz-freelance-portfolio.jpg
```

---

## 6. 一括投入用システムプロンプト（画像モデル向け）

以下を **システム** に置き、ユーザーメッセージで「`food-kitchen-car-today` を生成」と指定してもよい。

```text
あなたは Infomii のテンプレートマーケットプレイス用キービジュアルを生成するアシスタントです。

出力は写真風の横長画像1枚のみを想定（後でJPEG保存）。

ルール:
- 5:3 横構図、1920x1152 相当
- 読める文字・ロゴ・透かし・UI・QR・地図ラベル禁止
- BtoC向け: 個人の共有・友達・推し活・飲食・小規模店舗。宿泊ホテルの外観だけの写真は禁止
- 一覧サムネで主題が3秒で伝わる構図
- フォトリアル（推し・リンク系のみ軽いイラスト調も可）

入力形式:
category: <travel|oshi|personal|food|lightbiz>
slug: <slug>
name: <テンプレ日本語名>
hint: <任意の追加指示>

出力: 英語の画像生成プロンプト1段落（80〜120語）+ 推奨ファイルパス public/templates/previews/{category}/{slug}.jpg
```

---

## 7. ヒーローカードとの一致

シードでは `hero` ブロックの `content.image` に `btocTemplatePreviewPath(category, slug)` と同じ URL を設定済みです。  
**サムネ JPG を差し替えれば、テンプレ適用後のヒーローも自動的に同じ画像**になります（DB 再同期後）。

未生成の間は `node scripts/sync-btoc-preview-images.mjs` でプール画像をコピー済みの場合があります。本番前に必ずテーマ別画像へ差し替えてください。

---

## 8. チェックリスト

- [ ] 全 slug の JPG が `public/templates/previews/` に存在
- [ ] `/templates` で Web・App（`?client=app`）のサムネが表示
- [ ] テンプレ適用後エディタのヒーロー画像が表示
- [ ] `seed-templates?sync=1` 実行後も表示が維持
- [ ] 文字・ロゴが画像に入っていない
