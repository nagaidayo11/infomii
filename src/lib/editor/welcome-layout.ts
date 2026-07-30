/** Visual layout for the `welcome` (あいさつ文) block. */
export type WelcomeLayout = "boxed" | "plain" | "quote";

export function readWelcomeLayout(raw: unknown): WelcomeLayout {
  if (raw === "plain" || raw === "quote") return raw;
  return "boxed";
}

export const WELCOME_LAYOUT_OPTIONS = [
  { value: "boxed", label: "ボックス", hint: "薄い面あり" },
  { value: "plain", label: "シンプル", hint: "枠なし" },
  { value: "quote", label: "引用", hint: "左にアクセント" },
] as const;
