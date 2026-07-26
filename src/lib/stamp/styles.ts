/** Stamp visual presets for guest card + editor preview. */

export const STAMP_CAPACITY = 10 as const;
export const STAMP_REWARD_TIERS = [5, 10] as const;
export type StampRewardTier = (typeof STAMP_REWARD_TIERS)[number];

export const STAMP_STYLE_IDS = [
  "seal",
  "star",
  "heart",
  "coffee",
  "leaf",
  "flower",
  "check",
  "sun",
] as const;

export type StampStyleId = (typeof STAMP_STYLE_IDS)[number];

export type StampStyleOption = {
  id: StampStyleId;
  label: string;
  hint: string;
};

export const STAMP_STYLE_OPTIONS: StampStyleOption[] = [
  { id: "seal", label: "印鑑", hint: "和の捺印" },
  { id: "star", label: "スター", hint: "明るい印象" },
  { id: "heart", label: "ハート", hint: "おもてなし" },
  { id: "coffee", label: "コーヒー", hint: "カフェ向け" },
  { id: "leaf", label: "リーフ", hint: "自然・スパ" },
  { id: "flower", label: "フラワー", hint: "季節感" },
  { id: "check", label: "チェック", hint: "シンプル" },
  { id: "sun", label: "サン", hint: "リゾート" },
];

export const STAMP_ACCENT_PRESETS = [
  "#0f766e",
  "#b45309",
  "#be123c",
  "#1d4ed8",
  "#4338ca",
  "#0f172a",
] as const;

export function normalizeStampCapacity(_value?: unknown): typeof STAMP_CAPACITY {
  return STAMP_CAPACITY;
}

export function normalizeStampRewardTier(value: unknown): StampRewardTier | null {
  const n = typeof value === "number" ? value : Number(value);
  if (n === 5 || n === 10) return n;
  return null;
}

export function normalizeStampStyle(value: unknown): StampStyleId {
  if (typeof value === "string" && (STAMP_STYLE_IDS as readonly string[]).includes(value)) {
    return value as StampStyleId;
  }
  return "seal";
}

export function canRedeemTier(stampCount: number, tier: StampRewardTier): boolean {
  return stampCount >= tier;
}
