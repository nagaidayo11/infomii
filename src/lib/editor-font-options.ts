/**
 * エディタの「フォント」選択肢（ブロックスタイル・一括フォントで共通利用）
 * layout で Google Fonts を読み込むファミリーは、ここに追加したら併せて読み込みを足すこと。
 */
export type EditorFontOption = { label: string; value: string };

export const EDITOR_FONT_OPTIONS: readonly EditorFontOption[] = [
  { label: "標準（システム）", value: "" },
  { label: "Noto Sans JP", value: "'Noto Sans JP', sans-serif" },
  { label: "Zen Kaku Gothic New", value: "'Zen Kaku Gothic New', sans-serif" },
  { label: "M PLUS Rounded 1c（丸ゴシック）", value: "'M PLUS Rounded 1c', sans-serif" },
  { label: "Kosugi Maru", value: "'Kosugi Maru', sans-serif" },
  { label: "ヒラギノ角ゴ", value: "'Hiragino Kaku Gothic ProN', sans-serif" },
  { label: "Yu Gothic", value: "'Yu Gothic', 'YuGothic', sans-serif" },
  { label: "メイリオ（Windows）", value: "'Meiryo', 'Meiryo UI', sans-serif" },
  { label: "Noto Serif JP", value: "'Noto Serif JP', serif" },
  { label: "Shippori Mincho（明朝）", value: "'Shippori Mincho', serif" },
  { label: "Serif（汎用）", value: "serif" },
  { label: "Sans Serif（汎用）", value: "sans-serif" },
] as const;
