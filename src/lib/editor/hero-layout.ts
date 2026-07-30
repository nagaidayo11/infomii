/** Visual layout for the `hero` (トップ写真＋タイトル) block. */
export type HeroLayout = "overlay" | "stack" | "split";

export function readHeroLayout(raw: unknown): HeroLayout {
  if (raw === "stack" || raw === "split") return raw;
  return "overlay";
}

export const HERO_LAYOUT_OPTIONS = [
  { value: "overlay", label: "重ね", hint: "写真の上に文字" },
  { value: "stack", label: "下配置", hint: "写真の下に文字" },
  { value: "split", label: "帯付き", hint: "下に色帯" },
] as const;
