/**
 * エディタの「フォント」選択肢（ブロックスタイル・一括フォントで共通利用）
 * layout で Google Fonts を読み込むファミリーは、ここに追加したら併せて読み込みを足すこと。
 */
export type EditorFontOption = { label: string; value: string };

export const EDITOR_FONT_OPTIONS: readonly EditorFontOption[] = [
  { label: "標準（システム）", value: "" },
  { label: "ゴシック体：Noto Sans JP（読みやすい標準）", value: "'Noto Sans JP', sans-serif" },
  { label: "丸ゴシック体：M PLUS Rounded 1c", value: "'M PLUS Rounded 1c', sans-serif" },
  { label: "明朝体：Noto Serif JP", value: "'Noto Serif JP', serif" },
  { label: "明朝体：しっぽり明朝（Shippori Mincho）", value: "'Shippori Mincho', serif" },
] as const;
