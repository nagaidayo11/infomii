# Infomii Instagram カルーセル — デザイン改善プロンプト集

「CSSで組んだ感」「白箱＋枠線＋角丸」の質素さを脱却し、**編集デザイナーが作ったBtoB SaaSのInstagramカルーセル**に見えるためのプロンプトです。

**用途**
- Cursor / Claude に `shared.css` 改修を依頼するとき
- Figma / Canva で装飾素材を作るとき
- 背景・フレーム用イラストを GenerateImage するとき

**固定仕様（変えない）**
- サイズ: 1080×1350（4:5）
- ブランドカラー: `#059669` / `#047857` / `#0F172A` / `#F2FBF7`
- フォント: M PLUS Rounded 1c（見出し）+ Noto Sans JP（本文）
- 構成: 1 Cover → 2–4 Content（縦積み）→ 5 CTA（共通）

---

## 1. マスタープロンプト（全体方向性）

```
Infomii（ホテル向け館内案内SaaS）のInstagramカルーセル1080×1350pxを、
「HTML/CSSのテンプレ感」から「プロの編集デザイナーが作った完成稿」に引き上げてください。

ブランド: 静かで信頼感のあるBtoB。Stripe / Linear / Notion の落ち着いたSaaS美学。
宿泊・ホスピタリティ文脈。派手なグラデーション、ネオン、3Dグロス、過剰な影は禁止。

デザイン原則:
- 情報の「箱」は単なる border + border-radius ではなく、
  レイヤー（背景テクスチャ / 薄いパターン / 非対称な余白 / 装飾ライン）で奥行きを作る
- バッジ・ラベルは「UIコンポーネント」ではなく「印刷物の章立て」として設計
- タイポグラフィにリズム: サイズ差・字間・行間・ウェイトのメリハリ
- 1スライド1主張。装飾は主張を邪魔しない
- イラストとタイポの世界観を統一（同じ丸み・同じ色数・同じ線の太さ）

避けること:
- 均一な白カードの積み重ね
- すべて同じ太さのグレー枠線
- 機械的な pill ボタン列
- 見出し下の短い棒グラデーションだけのアクセント
- Bootstrap / Material UI っぽいコンポーネント感
```

---

## 2. スライド別プロンプト

### スライド1（Cover）— 共通背景・タイトル差し替え

```
Instagramカルーセル1枚目（Cover）1080×1350。
Infomiiブランド。エメラルド#059669 + ミント#F2FBF7 + スレート#0F172A。

レイアウト:
- 上部: ブランドヘッダー（ロゴ + Infomii + 小さなカテゴリタグ）
- 中上: 大見出し2行 + サブコピー1〜2行（左寄せ、十分な余白）
- 下半: ヒーローイラスト（ホテルフロント・スマホ・QRのフラットイラスト）

「デザイナー感」を出すポイント:
- 背景は単色グラデではなく、大きな有機的シェイプ（薄いミントの blob）と
  極細のドットパターン or 斜めのライングラデを組み合わせる
- カテゴリタグ（例: サービス紹介）は、左に細い縦線 + 小さな数字 + テキストの
  「雑誌の欄外」スタイル。pill型1個だけにしない
- 見出しは太字丸ゴシック。1行目と2行目でサイズ or 色（ink / accent）に差をつける
- ヒーローとテキストの境界は直線カットではなく、ソフトなマスク or 曲線分割
- 右下 or 左下に控えめなページ番号「1 / 5」

テキストは日本語。イラスト内に文字は入れない。
参考トーン: 日本のBtoB SaaS LP + 北欧系エディトリアル。安っぽいテンプレ感禁止。
```

---

### スライド2–4（Content）— 縦積み・テキスト上 / イラスト下

```
Instagramカルーセル中間ページ（2/5〜4/5）1080×1350。
Infomii。上: テキストエリア / 下: フル幅イラスト。横2カラム禁止。

テキストブロック（上部 45〜50%）:
- ステップバッジ「01 よくある悩み」: 
  番号は小さな正方形スタンプ（やや回転1〜2deg）+ ラベルは横長のラベルテープ風。
  一体の pill バーにしない
- 見出し: 54px前後、2行。下に装飾は「短い棒」ではなく、
  左端の縦アクセントバー + 見出し左padding のエディトリアル手法
- 本文: 薄い生成色背景（#F8FAFB）の「原稿用紙」風。枠線は1辺だけ accent
- 箇条書き3点: 横並び pill ではなく、左に小さな emerald アイコン（チェック / 点 / 線）
  各行はリスト項目として整列。行間はゆったり
- TIP: 左に TIP スタンプ、右に1行。角丸カードではなく「付箋 + 影1px」の印象

イラストブロック（下部 50〜55%）:
- 角丸32pxのフレーム。枠は単線ではなく、内側に1px highlight + 外側に soft shadow
- フレーム上部に極細の emerald ライン（スライド番号帯）
- イラストはテキストと同じフラットベクター系

全体背景:
- 白一色禁止。ごく薄いミント + 右上に大きな fade のシェイプ
- 下部余白を埋める: イラストを flex-grow で最大まで使う

避ける: 白箱の入れ子、すべて同じ 2px #E6E8EB ボーダー、Bootstrap card 感
```

---

### スライド5（CTA）— 全投稿共通・販促

```
Instagramカルーセル最終页（5/5）1080×1350。Infomii共通CTA。

構成:
- 中央配置: 大ロゴ → Infomii →「ホテル向け 案内運用ツール」
- 見出し「まずは無料で試せます」
- サブ2行
- benefit 3つ（クレジットカード不要 / QRですぐ公開 / 公開後も更新可能）
- 主CTA「プロフィールのリンクから →」
- フッター: infomii.com + 一言

「デザイナー感」:
- 背景: 放射状のごく薄い emerald glow + 上部に抽象の弧（ホテルの「受付カウンター」連想）
- benefit は等幅 pill 3つ並び禁止。
  代わりに「3つの小さなカード」— 各カードに極小アイコン + 1行テキスト、
  高さ揃え・幅は内容に応じて非対称
- CTAボタン: 完全な pill ではなく、やや角のある rounded rect（radius 20px）。
  ボタン内に subtle な上方向ハイライト。横に小さな矢印アイコン
- ロゴ周りに「信頼のリング」— 細い円弧 2重（stroke only、emerald 15% opacity）

トーン: 押し売り感より「試してみませんか」の上品さ。ホテル向けBtoB。
```

---

## 3. UIパーツ別プロンプト（CSS/HTML改修用）

### バッジ・ラベル

```
Infomii Instagram用のステップバッジ（01 / よくある悩み）を、
CSSコンポーネント感のない「エディトリアルラベル」に redesign。

要件:
- 番号: 28×28px の emerald スクエア、角丸6px、白文字。box-shadow 1層のみ
- ラベル: 番号の右に 8px gap。背景 transparent。下線 2px accent 40% opacity
- 全体を囲む border / pill 背景は使わない
- hover アニメーション不要（静止画書き出し）

参考: 雑誌の章番号、空港サイン、日本の行政パンフの見出し帯（モダン版）
```

### テキストを囲うエリア（text-panel）

```
Infomiiカルーセル2–4枚目のテキストパネルを redesign。
現状: 白背景 + 2px gray border + 角丸28px → テンプレ感が強い。

目指す姿:
- 背景: #FFFFFF 92% + backdrop 風。左上から右下へ #F2FBF7 が5%だけ乗る
- 枠: 四辺均等 border 禁止。左 border 4px solid #059669 + 他3辺 border なし
- 内側: padding-top 32px, padding-left 36px（非対称で編集余白感）
- 外側: shadow は 0 24px 48px rgba(15,23,42,0.06) 1層のみ
- パネル上部右: 直径120px の accent 円、opacity 4%（装飾 blob）

HTML構造は維持可。CSSのみ変更。
```

### 箇条書きリスト

```
Infomiiカルーセル用チェックリスト3項目。

避ける: 各行が独立した pill カード、左に ■ チェックボックス

採用:
- 1つのリストブロック内に3行。行間 14px
- 各行: 左 24px に emerald の細線チェック SVG（stroke 2px）
- 行の背景なし。代わりに奇数行だけ rgba(236,253,245,0.5)
- フォント 24px / weight 600 / color #0F172A
- 3行目の下に 1px dotted line #E6E8EB（リスト終端の区切り）
```

### ブランドヘッダー（全スライド）

```
Infomii Instagram全スライド共通ヘッダー。

現状: ロゴ + 文字 + 右 pill「ホテル向け 案内ツール」→ SaaS UI 感

改善:
- ヘッダー全体を 1px bottom border #E6E8EB ではなく、
  ロゴ下にだけ 24px 幅の accent アンダーライン
- 右タグ: pill ではなく「角括弧」スタイル — 
  テキスト「ホテル向け 案内ツール」font-size 20px letter-spacing 0.08em
  左右に細い vertical bar（|）で挟む。背景なし
- ロゴ 52px、横に Infomii wordmark。wordmark の ii を accent 色に

top brand-bar 8px gradient は残すが、その下 12px は #F2FBF7 の細い帯
```

### ページ番号

```
Instagramカルーセル左下「2 / 5」インジケーター。

- font: M PLUS Rounded 1c, 20px, weight 800
- 「2」だけ accent #059669、「/ 5」は muted #94A3B8
- 背景: なし。代わりに左に 3px × 20px の accent 縦線
```

---

## 4. 装飾素材生成プロンプト（GenerateImage / Figma用）

### 背景テクスチャ（全スライド共通・テキストなし）

```
Seamless subtle background texture for Instagram post, 1080x1350 portrait.
Very light mint #F2FBF7 base. Scattered tiny dots 2% opacity emerald.
Large soft organic blob top-right, opacity 6%. No text, no logos, no UI elements.
Editorial print quality, calm Japanese SaaS brand. Flat, minimal, professional.
```

### イラストフレーム（スライド2–4用・透明 or 白背景）

```
Decorative picture frame for Instagram carousel, 980x620 landscape.
Rounded corners 32px. Thin emerald #059669 accent line on top edge only.
Soft inner shadow suggesting depth. Rest is clean white / transparent center for photo insert.
No text, no icons. Editorial magazine layout element. Flat vector style.
```

### CTA背景装飾（スライド5用）

```
Abstract decorative background for CTA slide, 1080x1350 portrait.
Center area kept clean white for text overlay.
Top third: soft radial emerald glow #059669 at 12% opacity.
Bottom: two thin concentric arc lines, stroke only, emerald 8% opacity.
Minimal, premium B2B SaaS. No text, no logos, no 3D effects.
```

---

## 5. Cursor への一括実装依頼プロンプト（コピペ用）

```
docs/instagram/carousels/shared.css と _cta-slide.html を、
docs/instagram/design-prompts.md の方針に沿って redesign してください。

目的:
- 1〜5枚すべて「CSSテンプレ感」を脱却し、編集デザイナー品質に
- 2〜4枚目は縦積み（テキスト上・イラスト下）を維持
- 5枚目 _cta-slide.html は全投稿共通のまま

重点:
1. text-panel: 左 accent border + 非対称 padding + 薄い blob 装飾
2. kicker/badge: pill 一体型 → 章番号スタンプ + ラベルテープ
3. bullets: 独立 pill 行 → リストブロック + 奇数行 tint
4. brand-header: pill タグ → 括弧スタイル typographic tag
5. cover: 背景 blob + テキスト/ヒーロー境界をソフトに
6. CTA: benefit 3カード化 + CTAボタンを pill から refined rect へ

制約:
- 1080×1350、既存 HTML クラス名は極力維持（what-is-infomii.html の互換）
- 色は #059669 / #047857 / #0F172A / #F2FBF7 から逸脱しない
- グラデーション・影は各要素1〜2層まで。やりすぎ禁止
- 変更後 npm run instagram:export -- what-is-infomii で PNG 再書き出し

完了後、before/after で何を変えたか3行で報告。
```

---

## 8. イラスト生成プロンプト（GenerateImage / API 共通）

### マスター参照（全生成で必須）

```
reference_image_paths:
  1. docs/instagram/assets/inquiry-not-decreasing-cover.png  （色・トーン・ロビーの正）
  2. docs/instagram/assets/character-tone-reference.jpg     （人物画風）
PCシーン追加: laptop-angle-reference.png
```

### ブランドキャノン（毎回先頭に付ける）

```
Infomii illustration canon — match reference images EXACTLY, same illustration family.

COLORS (no variation between images):
- Staff: emerald blazer #059669, white shirt, gold name tag. NEVER samue/kimono/wrap uniform.
- Guest man: muted teal-green sweater, khaki #C9B896 pants, cream suitcase with green accent.
- Skin: peach #F5C4A8. Dot eyes. Flat editorial, soft grain texture.
- Wall upper: off-white #F5F3EF. Wall lower: #059669 vertical wainscoting slats.
- Desk: warm honey wood #DDB88A, emerald paneled base. Floor: light cream tile.
- 3 emerald #059669 dome pendant lights. Mint #F2FBF7 only in sky/distant accents.
- QR: white stand, emerald QR pattern. Silver service bell.

LOBBY SET (all character scenes):
Curved front desk + bell + QR stand. Left: wooden key rack. Right: gold luggage cart + arch doorway. White-pot plant.

Avoid: different green shades (forest/sage/mint walls), samue uniform, lobby armchairs, circular wall logo, POV hands-only cover, 3D render, readable text.
```

### 人物トーン（必ず付ける）

```
Match character style from reference: friendly flat editorial hotel illustration.
Expressive simple dot eyes, soft peach skin, gentle smile or concerned expression.
Hotel staff wear emerald #059669 blazers ONLY. Guests in muted travel clothes per canon above.
Same illustration family as inquiry-not-decreasing-cover — NOT 3D, NOT faceless hands only, NOT different uniform styles.
```

### SaaS・PC管理（テーマに応じて）

```
Hotel or minpaku staff managing guest guide on laptop or desktop monitor at front desk.
Screen shows simple emerald green content blocks, icons, drag blocks — NO readable text, NO letters.
Optional: staff also holds smartphone showing same guide for mobile editing.
Conveys business SaaS: front desk team updates guide from PC, guests read on phone.
```

### PC・モニター描画ルール（必須 — AI不自然さ防止）

```
CRITICAL — physically correct hardware (violations = reject & regenerate):
- UI appears ONLY on the inner front glass of an open laptop, or monitor screen facing the user/camera.
- Monitor rear/back housing: plain matte black or white plastic, NO icons, NO UI, NO green blocks.
- Laptop outer lid/back cover: plain solid gray or silver, completely blank — NO UI bleed-through.
- NEVER put interface on the back of a monitor, laptop lid, or wrong surface.
- DEFAULT: laptop only (no desktop monitor). Desktop monitors cause back-panel UI artifacts too often.
- MANDATORY reference for any PC scene: laptop-angle-reference.png + character-tone-reference.jpg
- Winning composition (copy this):
  One seated staff, 3/4 view from guest side, open laptop on desk, inner screen angled ~45° toward camera,
  plain lid back not visible or blank, QR stand + bell on desk, emerald SaaS blocks on inner screen only.
- Avoid: two staff behind desk with monitor/laptop backs toward camera; over-shoulder from behind hardware.
```

生成後チェック（必須）: モニター背面・ノートPCのふたにUIがないか目視確認。1枚でもあれば即再生成。

### 接続中断時の代替（GenerateImage がタイムアウトする場合）

画像生成は1枚7〜10分かかり、接続が切れると中断アラートが出ます。その場合は **再生成せず既存アセットを差し替え**:

| 必要シーン | 流用元 |
| --- | --- |
| PC編集（座り・ノートPC） | `inquiry-not-decreasing-slide04.png` |
| 紙混乱 vs スマホ解決（分割） | `inquiry-not-decreasing-slide03.png` |
| 廊下 QR 設置 | `hotel-qr-guide-slide04.png` + HTML `art--fit` |

QR・廊下イラストは CSS `.art--fit`（`background-size: contain`）で切れを防ぐ。

### サイズ・共通ネガティブ

- 比率: **3:4** portrait（カルーセル art / cover 用）
- reference: `character-tone-reference.jpg` + `laptop-angle-reference.png`（PCシーン必須）
- §6 ネガティブプロンプトも必ず付ける

### テーマ別シーン例

| テーマ | Cover | 2 | 3 | 4 |
| --- | --- | --- | --- | --- |
| 1 Infomiiとは | スタッフPC編集＋ゲストスマホ | 紙混乱（人物） | QR解決（人物） | PC更新＋QR |
| 2 QR化5ステップ | 既存維持可 | 既存 | **PCでページ作成** | 既存 |
| 3 問い合わせ | 既存（基準） | 既存 | 既存 | **PCで見直し** |
| 4 紙PDF Web | 既存 compare | 紙の負担 | PDF vs スマホ | **PC運用** |
| 5 Wi-Fi | ゲストWi-Fi質問 | スタッフ誘導 | **PCでWi-Fiブロック編集** | QR設置 |

---

## 6. ネガティブプロンプト（共通・必ず付ける）

```
Avoid: generic UI kit, Bootstrap card, Material Design chip, 
uniform 2px gray borders on all sides, nested white boxes,
over-rounded pill buttons, drop shadows on everything,
rainbow gradients, glossy 3D app icon style, stock photo collage,
busy patterns, readable text inside illustrations, 
English UI labels, watermark, low contrast body text,
center-aligned long paragraphs, cramped horizontal two-column text layout,
faceless product render without characters, hyper-realistic 3D desk scene,
anime style, chibi, photorealistic faces
```

---

## 7. チェックリスト（出力後のセルフレビュー）

- [ ] 3秒で「Infomiiの投稿」とわかるか
- [ ] 白箱＋グレー枠の繰り返しが3箇所以上ないか
- [ ] バッジが「ボタン」に見えていないか
- [ ] 2〜4枚目の下部に不自然な余白がないか
- [ ] スマホ実寸で本文が読めるか（最小 24px 相当）
- [ ] 5枚目だけ見ても「無料で試せる」とわかるか
- [ ] PC・モニター: UIが画面正面のみか（背面・ふたにUIがないか）
- [ ] 色・トーン: ブレザー #059669 / 壁腰板 / ウッド / ペンダントが他スライドと同系か
