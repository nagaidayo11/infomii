# BtoC テンプレート本文リライト用プロンプト

Infomii マーケットプレイス（`travel` / `oshi` / `personal`）の **9 本のシードテンプレ** を、ホテル宿泊案内ではなく **個人の旅行・推し活・おでかけ** 向けの高品質な初期コンテンツに差し替えるためのプロンプト集です。

反映先: `src/lib/marketplace-seed-btoc.ts`  
反映後: `GET /api/seed-templates?sync=1&v=<MARKETPLACE_SEED_VERSION>` で DB 同期

---

## 技術メモ（必読）

- 現状の BtoC シードは **カード 3〜4 枚** のため、`seed-templates` の `diversifyTemplateBlocks` が **6 枚未満** と判断し、`wifi` / `checkout` / `emergency` / `menu` など **宿泊施設向けブロックを自動追加** することがあります。
- リライト時は **各テンプレート 6〜8 枚** にし、**手書きシードとして維持** してください（`CURATED_MIN_CARD_COUNT = 6`）。
- `preview_image` は常に `""`（空文字）。
- 実在の個人名・電話番号・予約番号は使わず、**架空の例示**（「例: 新宿駅南口」「例: @your_handle」）に留める。

---

## マスタープロンプト（全テンプレ共通・システム）

以下を **システムメッセージ** として使い、各テンプレの「個別プロンプト」を **ユーザーメッセージ** で続けてください。

```text
あなたは Infomii（スマホ1ページで情報を共有するサービス）の BtoC 向けテンプレート初期文案ライターです。

## プロダクト
- 読者: 友人・家族・ファン仲間など「個人の共有相手」。ホテルの宿泊ゲストではない。
- 目的: テンプレ選択直後に「その用途のしおり／まとめ」として成立する、具体的で編集しやすい日本語。
- 出力: 後述の JSON のみ。説明文・Markdown・コードフェンスは禁止。

## 絶対禁止（ホテル・宿泊施設文脈）
次の語彙・ブロック・話題を入れない:
- ブロック type: wifi, checkout, emergency, breakfast, restaurant, laundry, spa, parking, taxi（宿泊施設手配）, kpi（チェックイン時刻表）, open_status（フロント対応）, progress_steps（到着チェックイン手順）
- 文言: チェックイン／チェックアウト／フロント／内線／客室／Wi-Fi（SSID・パスワード）／朝食ビュッフェ／館内／領収書／延泊／緊急連絡先（119/110/病院案内の定型）／宿泊／ホテル案内
- 「連絡」は **グループチャット・主催者・同行者** まで。病院・フロント・救急の導線は書かない。

## 使ってよいブロック（BtoC）
hero, welcome, heading_body, highlight, notice, schedule, steps, checklist, map, nearby, pageLinks, tabs_info, accordion_info, faq, faq_search, social_links, contact_hub（主催者・同行代表への問い合わせのみ）, quote, compare, button, action, image, video, gallery

## 品質基準（S 相当・BtoC 版）
1. 最初の 2 ブロックで「何のページか・誰向けか」が一瞬で分かる。
2. 各ブロックは **1 メッセージ**（詰め込みすぎない）。
3. 日程・場所・持ち物・リンク・ルールのうち、テーマに必要なものが **具体的な例** で入っている（プレースホルダーだけにしない）。
4. 実際の利用シーンが想像できる（例: 終電、集合遅刻、グッズ列、雨天代替）。
5. 文字数: notice/FAQ の各回答は 80〜180 字程度。hero subtitle は 24〜48 字。
6. pageLinks の label は **行動が分かる日本語**（「公式」「リンク」だけにしない）。
7. テンプレ名・description と本文のトーンを一致させる。

## 出力 JSON スキーマ
{
  "slug": "<固定>",
  "name": "<テンプレ表示名・変更可>",
  "description": "<一覧用・40〜80字>",
  "preview_image": "",
  "category": "travel" | "oshi" | "personal",
  "cards": [
    {
      "type": "<ブロックtype>",
      "order": 0,
      "content": { }
    }
  ]
}

cards は 6〜8 件。order は 0 から連番。

## content フィールド例（type ごと）
- hero: { "title", "subtitle", "image": "" }
- welcome: { "title", "message" }
- heading_body: { "title", "body", "dividerEnabled": false, "dividerStyle": "solid" }
- notice: { "title", "body", "variant": "info"|"warning" }
- schedule: { "title", "items": [{ "day", "time", "label" }] }  // 3〜6 行
- steps: { "title", "items": [{ "title", "description" }] }    // 3〜5 件、description 各 40〜100 字
- checklist: { "title", "items": ["...", ...] }  // 文字列配列 6〜10 件
- map: { "title", "address" }
- nearby: { "title", "items": [{ "name", "description", "link": "" }] }
- pageLinks: { "title", "items": [{ "label", "icon" }] }  // icon: map|link|calendar|gift|play|mail|utensils|wifi 等
- tabs_info: { "title", "tabs": [{ "label", "body" }] }
- accordion_info: { "title", "items": [{ "title", "body" }] }
- faq / faq_search: { "title", "items": [{ "q", "a" }] }  // 3〜5 組
- social_links: { "title", "items": [{ "label", "href", "handle" }] }
- contact_hub: { "title", "phone", "email", "lineUrl", "mapUrl", "note" }  // 空文字可。note に連絡ルール
- quote: { "quote", "author" }
- compare: { "layout": "pricing", "title", "pricingColumnHeaders", "pricingRows", "highlightColumnIndex" }

## ブロック順の目安
- travel: hero/welcome → schedule/steps → checklist/map → notice/tabs → pageLinks → faq
- oshi: hero/welcome → schedule/steps → notice/social → pageLinks → faq
- personal: hero/welcome → schedule/steps → map → pageLinks → faq/contact_hub
```

---

## 個別プロンプト（ユーザーメッセージ）

各ブロックに **上記マスタープロンプトを適用したうえで**、以下をそのまま投入してください。`slug` は変更しないでください。

---

### 1. `travel-itinerary` — 旅行しおり・基本セット

```text
slug: travel-itinerary
category: travel

シナリオ: 友人3人で「京都・2泊3日」。新幹線往復・宿（民泊ではなく旅行しおり文脈）・主要観光・食事予約・持ち物・雨天時の代替を1ページに。

必須の濃い内容:
- schedule: 1日目移動＋チェックイン相当の「宿到着」ではなく「宿泊先到着・鍵受け取り」、2日目観光、3日目帰路（時刻は例示で具体）
- checklist: 旅行保険・モバイルバッテリー・歩きやすい靴・ICカード・予約確認スクショ など実務的
- map + nearby: 京都駅周辺の集合、宿エリア、嵐山/河原町など「行き先の例」
- notice: 遅刻時・体調不良時は **同行グループ** でどうするか（ホテルフロントにしない）
- pageLinks: 新幹線予約、宿泊予約サイト、天気、乗換 などラベル具体化
- faq: 割り勘、荷物預け（コインロッカー/駅）、自由行動の連絡方法

cards 7〜8。checkout/emergency/wifi は使わない。
```

---

### 2. `travel-weekend` — 週末旅行・おでかけセット

```text
slug: travel-weekend
category: travel

シナリオ: 東京在住カップル／友人の「箱根・日帰り」。ロマンスカー→温泉街→カフェ→帰路の終電意識。

必須の濃い内容:
- welcome: 日帰りであること・今日のゴール（例: 18:30 新宿発の帰り）
- steps: 出発→温泉街散策→ランチ→カフェ→駅（各 step に所要・待ち合わせのヒント）
- schedule または steps のどちらかで **時系列をはっきり**
- notice: 天候（強風でロープウェイ中止時の代替ルート）、荷物（手ぶら推奨）
- faq: 集合場所の変更、チケット未所持、バス遅延時の連絡
- pageLinks: ロマンスカー予約、温泉街マップ、カフェ予約

cards 6〜7。コンパクトだがプレースホルダー感を消す。
```

---

### 3. `travel-group` — グループ旅行・役割分担セット

```text
slug: travel-group
category: travel

シナリオ: 大学友人5人「沖縄・3泊」。飛行機・レンタカー・宿・食事・海アクティビティで役割分担。

必須の濃い内容:
- tabs_info: 交通担当／宿・鍵／食事・予約／アクティビティ／会計 メモ（各 tab 80〜120 字の具体例）
- contact_hub: phone/email は空でよい。note に「LINEグループ名例」「遅刻は30分前まで連絡」など **旅行仲間向けルール**
- checklist または notice: 共通費・個人費・レシート保管ルール
- schedule: 到着日・フル day・帰国日の3ブロック
- pageLinks: フライト、レンタカー、宿、海アクティビティ予約、割り勘アプリ など
- faq: 役割の変更、欠席者、車の運転交替

cards 7〜8。ホテル「チェックイン担当」ではなく「宿泊予約・鍵受け取り担当」の表現にする。
```

---

### 4. `oshi-live-set` — 推し活・ライブまとめセット

```text
slug: oshi-live-set
category: oshi

シナリオ: 都内アリーナの夜公演。チケット種別・入場待ち・グッズ・終演後の待ち合わせ・最終電車。

必須の濃い内容:
- hero: 公演名は架空でよいが「○○ LIVE 2026 - Tokyo」のようにリアル
- schedule: 開場/開演/アンコール想定/終演後集合（時刻例示）
- notice: 公式ルール（撮影・再入場・荷物）を **ファン目線** で要約。フロント・緊急は書かない
- pageLinks: 公式チケット、会場MAP、グッズ事前通販、セットリスト予想ではなく「公式X」
- checklist: チケット（紙/アプリ）、公式ペンライト、モバイルバッテリー、現金、身分証
- faq: グッズ列の待ち方、同行者と離れたとき、終演後の解散

cards 7〜8。
```

---

### 5. `oshi-fan-meet` — 推し活・ファンイベントセット

```text
slug: oshi-fan-meet
category: oshi

シナリオ: 商業施設でのファンミーティング（サイン・撮影あり）。整理番号・待機列・持ち物制限。

必須の濃い内容:
- welcome: 整理番号の確認方法・遅刻不可の注意（主催/イベント運営向け）
- steps: 集合→列整理→入場→サイン/撮影→退場→解散（運営フローではなく **参加者フロー**）
- social_links: ハッシュタグ例、公式X/Instagram（handle は @example）
- faq: 撮影可否、サイン料、再入場、同伴者、グッズ持込
- notice: 禁止事項（座り込み、無断撮影など）をイベント向けに

cards 6〜7。
```

---

### 6. `oshi-link-hub` — 推し活・リンクハブセット

```text
slug: oshi-link-hub
category: oshi

シナリオ: 推しの公式・配信・グッズ・ファンコミュニティを1ページに集約する「リンクまとめ」。

必須の濃い内容:
- hero: 推し名（架空可）と「最新情報は公式SNS優先」の一文
- pageLinks: 6〜8 リンク（公式サイト、チケット、配信アーカイブ、グッズショップ、ファンクラブ、歌詞/セットリストwiki 風は避け公式系）
- tabs_info または accordion_info: 「今日やること」「遠征時」「グッズ更新時」の3タブで中身を分ける
- notice: 非公式情報・転売注意の短い注意
- quote（任意）: ファン目線の一言（架空）

cards 6 枚。リンクハブだが中身は薄くしない。
```

---

### 7. `personal-date-plan` — おでかけ・デートプランセット

```text
slug: personal-date-plan
category: personal

シナリオ: 渋谷で午後デート（ランチ→散歩→カフェ→夕食）。相手に共有する「今日のしおり」。

必須の濃い内容:
- hero: カジュアルで温かいトーン（「今日のしおり」だけにしない）
- schedule: 4〜5 枠（移動含む）。店名は架空で具体（例: ○○カフェ 渋谷店）
- map: 集合場所（駅出口レベルで具体）
- notice: 雨天時は屋内スポットに変更、遅刻時はチャットで連絡
- pageLinks: ランチ予約、カフェ、夕食、天気、地図
- faq: 服装、プレゼント、割り勘の有無

cards 6〜7。宿泊・ホテル言及なし。
```

---

### 8. `personal-link-collection` — リンク集・プロフィールセット

```text
slug: personal-link-collection
category: personal

シナリオ: フリーランスクリエイター／小規模店の「リンク in bio」ページ。

必須の濃い content:
- welcome: 自己紹介2〜3文（仕事・拠点・返信目安）
- pageLinks: 8 項目前後（ポートフォリオ、Instagram、note/ブログ、予約カレンダー、お問い合わせ、最新作、ショップ、プレスキット）
- highlight または notice: 更新頻度・お仕事の依頼方法・返信までの目安
- faq: コラボ依頼、料金表の場所、SNS DM可否

cards 6 枚。contact_hub は「お仕事の問い合わせ」に限定しフロント口調にしない。
```

---

### 9. `personal-event-guide` — イベント・勉強会案内セット

```text
slug: personal-event-guide
category: personal

シナリオ: コワーキングスペースでの「Next.js 勉強会・定員20名・参加無料・持ち物あり」。

必須の濃い内容:
- hero: イベント名・日時・一言価値
- schedule: 受付・講義・質疑・懇親会（任意）のタイムテーブル
- faq: 参加費、持ち物、録画可否、キャンセル、初心者歓迎か
- map: 会場住所・最寄り・入館方法（例: 1F受付で名前記入）
- contact_hub: 主催者連絡（email 例: organizer@example.com）。緊急・救急は書かない
- notice: ハウスルール（飲食、写真撮影、開始5分前集合）
- pageLinks: 申込フォーム、資料共有、過去回アーカイブ

cards 7〜8。
```

---

## 一括生成用プロンプト（9本まとめて）

マスター + 以下を1回で投げる場合:

```text
上記マスタープロンプトに従い、次の9 slug それぞれについて **別々の JSON オブジェクト** を配列 `templates` で返してください。

slugs:
travel-itinerary, travel-weekend, travel-group,
oshi-live-set, oshi-fan-meet, oshi-link-hub,
personal-date-plan, personal-link-collection, personal-event-guide

各テンプレは個別プロンプト節のシナリオ・必須内容を満たすこと。
配列の順序は上記 slug 順。
```

---

## 反映チェックリスト

1. `marketplace-seed-btoc.ts` の `BTOC_MARKETPLACE_SEED_TEMPLATES` を差し替え
2. `MARKETPLACE_SEED_VERSION` をインクリメント（`src/lib/marketplace-seed-templates.ts` または定義元）
3. `npm run build` が通ること
4. `/api/seed-templates?sync=1&v=<version>` 実行後、テンプレ詳細に **wifi/checkout/emergency が増えていない** こと
5. 目視: 各カテゴリで「旅行／推し活／個人」の文脈が最初の2ブロックで伝わること

---

## 参考: 現状の薄い例（改善対象）

| slug | 改善したい点 |
|------|----------------|
| travel-itinerary | 旅程2行・持ち物4つのみ。割り勘・遅刻・雨天がない |
| travel-weekend | FAQが汎用。日帰りの終電・代替ルートがない |
| travel-group | contact_hub が一行。役割 tab の中身が骨組みのみ |
| oshi-live-set | 公演が抽象。グッズ・終演後・チェックリスト不足 |
| oshi-fan-meet | steps が3行の骨組み。撮影・整理番号ルールが薄い |
| oshi-link-hub | リンク3つのみ。タブ分け・更新方針なし |
| personal-date-plan | タイムライン2枠のみ |
| personal-link-collection | リンク3つ・メモ1行 |
| personal-event-guide | スケジュール1枠・FAQ2問のみ |
