/** Soft page atmosphere motifs — calm travel / diary tone, low visual weight. */

export const PAGE_ATMOSPHERE_IDS = ["none", "diary", "ocean", "travel", "outing"] as const;

export type PageAtmosphereId = (typeof PAGE_ATMOSPHERE_IDS)[number];

export type PageAtmosphereOption = {
  id: PageAtmosphereId;
  label: string;
  hint: string;
};

export const PAGE_ATMOSPHERE_OPTIONS: readonly PageAtmosphereOption[] = [
  { id: "none", label: "なし", hint: "シンプルな背景" },
  { id: "diary", label: "日記", hint: "ノートの淡い罫線" },
  { id: "ocean", label: "海", hint: "やわらかい波" },
  { id: "travel", label: "旅", hint: "地図の薄い曲線" },
  { id: "outing", label: "お出かけ", hint: "小道と光" },
] as const;

export function normalizePageAtmosphere(value: unknown): PageAtmosphereId {
  if (typeof value !== "string") return "none";
  return (PAGE_ATMOSPHERE_IDS as readonly string[]).includes(value)
    ? (value as PageAtmosphereId)
    : "none";
}

/** Soft wash tints layered under the page (never overpower content). */
export function atmosphereWashCss(id: PageAtmosphereId): string | undefined {
  switch (id) {
    case "diary":
      return "linear-gradient(180deg, #fbf7f0 0%, #f7f4ef 48%, #f3f0ea 100%)";
    case "ocean":
      return "linear-gradient(180deg, #eef6f8 0%, #f3f8f9 45%, #f6fafb 100%)";
    case "travel":
      return "linear-gradient(180deg, #f3f6f2 0%, #f6f7f4 50%, #f8f7f3 100%)";
    case "outing":
      return "linear-gradient(180deg, #f8f5ee 0%, #f7f6f1 48%, #f4f6f3 100%)";
    default:
      return undefined;
  }
}
