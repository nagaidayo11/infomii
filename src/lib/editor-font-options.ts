/**
 * エディタの「フォント」選択肢（ブロックスタイル・一括フォントで共通利用）
 * layout で Google Fonts を読み込むファミリーは、ここに追加したら併せて読み込みを足すこと。
 */
export type EditorFontOption = { label: string; value: string };

export const EDITOR_FONT_OPTIONS: readonly EditorFontOption[] = [
  { label: "標準（システム）", value: "" },
  { label: "ゴシック体：Noto Sans JP（読みやすい標準）", value: "'Noto Sans JP', sans-serif" },
  { label: "ゴシック体：Zen Kaku Gothic New（やわらかめ）", value: "'Zen Kaku Gothic New', sans-serif" },
  { label: "丸ゴシック体：M PLUS Rounded 1c", value: "'M PLUS Rounded 1c', sans-serif" },
  { label: "丸ゴシック体：小杉丸ゴシック（Kosugi Maru）", value: "'Kosugi Maru', sans-serif" },
  { label: "ゴシック体：ヒラギノ角ゴ", value: "'Hiragino Kaku Gothic ProN', sans-serif" },
  { label: "ゴシック体：游ゴシック（Yu Gothic）", value: "'Yu Gothic', 'YuGothic', sans-serif" },
  { label: "ゴシック体：メイリオ（Windows向け）", value: "'Meiryo', 'Meiryo UI', sans-serif" },
  { label: "明朝体：Noto Serif JP", value: "'Noto Serif JP', serif" },
  { label: "明朝体：しっぽり明朝（Shippori Mincho）", value: "'Shippori Mincho', serif" },
  { label: "汎用：セリフ（端末依存）", value: "serif" },
  { label: "汎用：サンセリフ（端末依存）", value: "sans-serif" },
] as const;
