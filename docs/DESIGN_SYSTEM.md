# Infomii デザインシステム

ミニマルなモダンSaaS UI。ホテル向けダッシュボード・エディタで統一利用。

## カラー

| 用途 | 値 | Tailwind / CSS |
|------|-----|----------------|
| **Primary** | `#2563EB` | `bg-ds-primary` `text-ds-primary` `--ds-primary` |
| **Background** | `#F9FAFB` | `bg-ds-bg` `--ds-bg` |
| **Card** | `#FFFFFF` | `bg-ds-card` `--ds-card` |
| **Border** | `#E5E7EB` | `border-ds-border` `--ds-border` |

## タイポグラフィ

- **Font**: **Inter**（`next/font`）
- 日本語: Noto Sans JP をフォールバックで併記

## 形状・シャドウ

| トークン | 内容 |
|----------|------|
| **rounded-xl** | 角丸の基準 `--radius-ds` = `0.75rem`（12px） |
| **Soft shadows** | `--shadow-ds-xs` → 極薄 / `sm` → 標準カード / `md` `lg` → 浮き |

## UI スタイル

- **rounded-xl** — カード・ボタン・入力まわりに統一
- **ソフトシャドウ** — 強いドロップシャドウは使わない
- **ミニマルSaaS** — 背景はフラット、`body` にグラデを載せない（`.lux-main` 内のみ可）

## CSS クラス

| クラス | 用途 |
|--------|------|
| `.ds-app` | アプリシェル背景 `#F9FAFB` |
| `.ds-card` | 白面 + ボーダー + 薄いシャドウ（`shadow-ds-sm`） |
| `.ds-card-elevated` | やや強いシャドウ（`shadow-ds-md`） |
| `.ds-card-hover` | ホバーでシャドウ強化（`.ds-card` と併用） |
| `.ds-btn-primary` | プライマリボタン（青・角丸xl） |

## Tailwind での例

```html
<div class="rounded-xl border border-ds-border bg-ds-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
  …
</div>
<button class="rounded-xl bg-ds-primary px-4 py-2 text-white">保存</button>
```

## レガシー

`.lux-main` 配下のみ従来のグラデ装飾を維持。新規画面は `bg-ds-bg` + `border-ds-border` + `rounded-xl` を推奨。
