# Infomii Instagram カルーセル Brand Kit

ホテル向け PR アカウント用。**5枚固定・パーツ使い回し** で量産するルールです。

## サイズ

| 用途 | 比率 | ピクセル |
| --- | --- | --- |
| フィード推奨 | 4:5 | **1080 × 1350** |

書き出し: `npm run instagram:export -- <slug>`（デフォルト **2倍スーパーサンプリング** → 1080×1350 に Lanczos ダウンスケール）

| オプション | 説明 |
| --- | --- |
| `--scale 2` | 高画質（デフォルト） |
| `--scale 1` | 速いプレビュー用 |

## 5枚の型（全投稿共通）

| # | 種類 | 共通 / 差し替え | 内容 |
| ---: | --- | --- | --- |
| 1 | **Cover** | フレーム・白カードは共通 | **見出し2行のみ** + ヒーロー画像 |
| 2 | **Content** | フレーム・白カードは共通 | **上：イラスト / 下：テキスト（縦積み）** |
| 3 | **Content** | 同上 | 同上 |
| 4 | **Content** | 同上 | 同上 |
| 5 | **CTA** | **全投稿完全共通** | ブランド締め・プロフィール誘導（2〜4と別構成） |

### スライド5（CTA）— 2〜4とは別デザイン

**役割:** 教育ではなく「プロフィールのリンクへ誘導」だけ。情報量は最小。

| 入れる | 入れない |
| --- | --- |
| ロゴ + 見出し + CTAボタン | kicker / 箇条書き |
| 上部イラスト（`cta-friendly-desk.png`） | TIP / 比較表 |
| 補足1行 + infomii.com | 左アクセント text-panel |

- 中央寄せ・ミントグラデの **ブランドカード**（`.cta-card`）
- 編集は `_cta-slide.html` のみ

### Cover（1枚目）のルール

- **入れるもの**: ブランドヘッダー + 見出し2行 + ヒーロー画像 + ページ番号
- **入れないもの**: eyebrow（カテゴリ）、lead（サブコピー）
- 詳細はキャプション側で補う（プロフィールグリッドで見出しだけ伝わる設計）

### 2〜4枚目：コンテンツ型（テーマごとに選ぶ）

**毎回箇条書きである必要はありません。** 外枠（ヘッダー・白カード・画像上/テキスト下）は共通のまま、中身の型だけ差し替えます。

| 型 | class | 向いているテーマ | 中身 |
| --- | --- | --- | --- |
| **箇条書き** | `.bullets` | サービス紹介、悩み整理 | 見出し + 3点 + TIP |
| **文章** | `.prose` | 背景説明、ストーリー | 見出し + 2〜4文 + TIP |
| **比較表** | `.compare-table` | 紙/PDF/Web比較、ツール比較 | 見出し + 表 + TIP |
| **ステップ** | `.steps` | 5ステップガイド、手順 | 見出し + 番号リスト + TIP |
| **図解メイン** | `.body--diagram` | フロー図、配置例 | 大イラスト + 見出し + 1行 |

#### 情報量を増やすとき

- スライドに `body--compact-art` を付ける → イラスト高さ 280px に縮小、テキスト領域を拡大
- テキストパネルに `text-panel--dense` → 表や文章向けに padding / 字号を調整

#### 10本テーマの型割り当て（案）

| # | テーマ | 2枚目 | 3枚目 | 4枚目 |
| ---: | --- | --- | --- | --- |
| 1 | Infomiiとは？ | bullets | bullets | bullets |
| 2 | QR化5ステップ | bullets | steps | steps |
| 3 | 問い合わせが減らない理由 | prose | bullets | prose |
| 4 | **紙・PDF・Web比較** | **compare-table** | **compare-table** | bullets |
| 5 | Wi-Fi説明 | diagram | bullets | prose |
| 6 | 館内案内の作り方 | steps | bullets | bullets |
| 7 | チェックアウト案内 | bullets | prose | diagram |
| 8 | 多言語案内 | bullets | compare-table | prose |
| 9 | QRの置き場所 | diagram | bullets | bullets |
| 10 | 料金プラン比較 | **compare-table** | bullets | bullets |

HTML の参考例: `carousels/_content-variants.html`（書き出し対象外）

### 2〜4枚目（箇条書き型のとき）

- **見出し** 2行以内（62px）
- **bullets** 3点（32px・太字）
- **note** 1行（任意・30px）

2〜4枚目は **イラスト上 / テキスト下**（イラストが余白を埋める）

## Infomii ブランド感（他社との差別化）

参考にするのは「カード型フレーム + 教育コンテンツ」の**構成**まで。見た目は Infomii 独自に保つ。

| 要素 | Infomii | 避ける（他社寄り） |
| --- | --- | --- |
| カラー | エメラルド `#059669` | コーポレートブルー |
| 背景 | ミント + **ドット** + ソフトな円・角装飾 | 斜線ストライプ |
| フォント | **M PLUS Rounded 1c**（やわらかい） | 硬いゴシックのみ |
| ブランドタグ | `\| ホテル向け 案内ツール \|` パイプ型 | カテゴリ pill ボタン |
| ロゴ表記 | Infom + 緑 **ii** | 英字大文字ロゴのみ |
| テキスト枠 | **左アクセントボーダー** + kicker スタンプ | 中央寄せ白カードのみ |
| Cover | 見出し2行 + 角丸ヒーロー | カテゴリタグ + 長文 lead |

### レイアウト構造

```
[brand-header]
[ミント背景 + ドット + 角装飾]
  └─ 白カード（角丸 28px）
       Cover: 見出し → ヒーロー
       Content: イラスト → テキストパネル
[page-dot 1 / 5]
```

## ファイル構成

```
docs/instagram/
  brand-kit.md
  carousels/
    shared.css           … 共通スタイル（編集は慎重に）
    _cta-slide.html      … 5枚目（全投稿共通・ここだけ編集）
    _template.html       … 新規投稿の雛形
    what-is-infomii.html … 1〜4枚目だけ（投稿ごと）
  assets/                … イラスト（テキストなし）
  exports/<slug>/        … 書き出し PNG
  captions/<slug>.md     … 投稿文
```

## 新しい投稿の作り方

1. `_template.html` をコピー → `carousels/<slug>.html`
2. `<style>` 内の `--hero-image` / `--art-image` を差し替え
3. 1枚目: **title 2行のみ**（eyebrow / lead は書かない）
4. 2〜4枚目: kicker / title / lead / bullets / note
5. 必要なら `assets/` にイラスト追加
6. `npm run instagram:export -- <slug>`
7. `captions/<slug>.md` に投稿文

**5枚目は触らない** — 文言変更は `_cta-slide.html` のみ。全投稿に反映されます。

## カラー

| 役割 | HEX |
| --- | --- |
| Accent | `#059669` |
| Accent strong | `#047857` |
| Ink | `#0F172A` |
| Mint wash | `#F2FBF7` |

## フォント

- 見出し: **M PLUS Rounded 1c**
- 本文: **Noto Sans JP**
