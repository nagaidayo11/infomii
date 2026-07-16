/** Soft desk-card tints — color without sticker sidebars. */

export type DeskTone = "amber" | "sky" | "emerald" | "rose" | "slate";

type DeskToneTokens = {
  /** Inline surface (overrides Card default). */
  surface: string;
  /** Use border (not ring) — parent shells use overflow:hidden and clip rings. */
  frame: string;
  title: string;
  rule: string;
  label: string;
  divide: string;
};

export const DESK_TONE: Record<DeskTone, DeskToneTokens> = {
  amber: {
    surface: "color-mix(in srgb, #fffbeb 92%, white)",
    frame: "border border-amber-200/90",
    title: "text-amber-950",
    rule: "border-amber-400",
    label: "text-amber-800/80",
    divide: "divide-amber-200/70 border-amber-200/70",
  },
  sky: {
    surface: "color-mix(in srgb, #f0f9ff 92%, white)",
    frame: "border border-sky-200/90",
    title: "text-sky-950",
    rule: "border-sky-400",
    label: "text-sky-800/80",
    divide: "divide-sky-200/70 border-sky-200/70",
  },
  emerald: {
    surface: "color-mix(in srgb, #ecfdf5 92%, white)",
    frame: "border border-emerald-200/90",
    title: "text-emerald-950",
    rule: "border-emerald-400",
    label: "text-emerald-800/80",
    divide: "divide-emerald-200/70 border-emerald-200/70",
  },
  rose: {
    surface: "color-mix(in srgb, #fff1f2 92%, white)",
    frame: "border border-rose-200/90",
    title: "text-rose-950",
    rule: "border-rose-400",
    label: "text-rose-800/80",
    divide: "divide-rose-200/70 border-rose-200/70",
  },
  slate: {
    surface: "color-mix(in srgb, #f8fafc 92%, white)",
    frame: "border border-slate-200/90",
    title: "text-slate-900",
    rule: "border-slate-300",
    label: "text-slate-500",
    divide: "divide-slate-200/90 border-slate-200/90",
  },
};
