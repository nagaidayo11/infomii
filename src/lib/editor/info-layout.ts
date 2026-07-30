/** Visual layout for the `info` (項目リスト) block. Same data, different presentation. */
export type InfoLayout = "cards" | "table" | "inline";

export function readInfoLayout(raw: unknown): InfoLayout {
  if (raw === "table" || raw === "inline") return raw;
  return "cards";
}

export const INFO_LAYOUT_OPTIONS: readonly { value: InfoLayout; label: string; description: string }[] = [
  { value: "cards", label: "カード", description: "行ごとに柔らかい面" },
  { value: "table", label: "表形式", description: "1枚の中に区切り線" },
  { value: "inline", label: "シンプル", description: "枠なし・余白で区切る" },
] as const;
