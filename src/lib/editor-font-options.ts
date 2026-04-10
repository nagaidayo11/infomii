/**
 * エディタの「フォント」選択肢（ブロックスタイル・一括フォントで共通利用）
 * layout で Google Fonts を読み込むファミリーは、ここに追加したら併せて読み込みを足すこと。
 */
export type EditorFontOption = { label: string; value: string };

export const EDITOR_FONT_OPTIONS: readonly EditorFontOption[] = [
  { label: "標準（システム）", value: "" },
  { label: "ノト サンズ（Noto Sans JP）", value: "'Noto Sans JP', sans-serif" },
  { label: "全角ゴシック New（Zen Kaku Gothic New）", value: "'Zen Kaku Gothic New', sans-serif" },
  { label: "M PLUS Rounded 1c（丸ゴ）", value: "'M PLUS Rounded 1c', sans-serif" },
  { label: "小杉丸ゴシック（Kosugi Maru）", value: "'Kosugi Maru', sans-serif" },
  { label: "ヒラギノ角ゴ", value: "'Hiragino Kaku Gothic ProN', sans-serif" },
  { label: "游ゴシック（Yu Gothic）", value: "'Yu Gothic', 'YuGothic', sans-serif" },
  { label: "メイリオ（Windows）", value: "'Meiryo', 'Meiryo UI', sans-serif" },
  { label: "ノト セリフ（Noto Serif JP）", value: "'Noto Serif JP', serif" },
  { label: "しっぽり明朝（Shippori Mincho）", value: "'Shippori Mincho', serif" },
  { label: "セリフ（汎用）", value: "serif" },
  { label: "サンセリフ（汎用）", value: "sans-serif" },
] as const;
