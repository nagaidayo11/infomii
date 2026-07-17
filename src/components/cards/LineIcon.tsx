import type { CSSProperties, ReactNode, SVGProps } from "react";

export type LineIconName =
  | "wifi"
  | "breakfast"
  | "utensils"
  | "checkout"
  | "clock"
  | "restaurant"
  | "spa"
  | "bath"
  | "parking"
  | "car"
  | "map"
  | "map-pin"
  | "nearby"
  | "notice"
  | "bell"
  | "emergency"
  | "phone"
  | "laundry"
  | "washing-machine"
  | "taxi"
  | "train"
  | "bus"
  | "credit-card"
  | "key"
  | "toothbrush"
  | "hanger"
  | "broom"
  | "microwave"
  | "package"
  | "bed"
  | "ticket"
  | "info"
  | "link"
  | "language"
  | "coffee"
  | "shopping-bag"
  | "camera"
  | "gift"
  | "baby"
  | "shield"
  | "check"
  | "quote"
  | "checklist"
  | "steps"
  | "compare"
  | "kpi";

const EMOJI_RE = /[\p{Extended_Pictographic}\p{Emoji_Presentation}]/u;

/** 旧データの絵文字のみ（読み取り専用。新規は LineIcon トークンのみ） */
const LEGACY_EMOJI_TO_TOKEN: Record<string, LineIconName> = {
  "📶": "wifi",
  "🍳": "breakfast",
  "🕐": "checkout",
  "🍽️": "restaurant",
  "♨️": "spa",
  "🅿️": "parking",
  "📍": "map",
  "🗺️": "nearby",
  "📢": "notice",
  "🚨": "emergency",
  "🧺": "laundry",
  "🚕": "taxi",
  "ℹ️": "info",
  "📌": "link",
};

const ICON_ALIASES: Record<string, LineIconName> = {
  wifi: "wifi",
  "wi-fi": "wifi",
  internet: "wifi",
  breakfast: "breakfast",
  utensils: "utensils",
  morning: "breakfast",
  checkout: "checkout",
  clock: "clock",
  "check-out": "checkout",
  restaurant: "restaurant",
  dining: "restaurant",
  spa: "spa",
  bath: "bath",
  onsen: "spa",
  parking: "parking",
  car: "car",
  map: "map",
  "map-pin": "map-pin",
  nearby: "nearby",
  location: "nearby",
  notice: "notice",
  bell: "bell",
  alert: "notice",
  emergency: "emergency",
  phone: "phone",
  laundry: "laundry",
  "washing-machine": "washing-machine",
  taxi: "taxi",
  train: "train",
  bus: "bus",
  "credit-card": "credit-card",
  key: "key",
  toothbrush: "toothbrush",
  hanger: "hanger",
  broom: "broom",
  microwave: "microwave",
  package: "package",
  bed: "bed",
  ticket: "ticket",
  info: "info",
  link: "link",
  language: "language",
  coffee: "coffee",
  "shopping-bag": "shopping-bag",
  shopping: "shopping-bag",
  camera: "camera",
  gift: "gift",
  baby: "baby",
  shield: "shield",
  check: "check",
  quote: "quote",
  checklist: "checklist",
  steps: "steps",
  compare: "compare",
  kpi: "kpi",
  "周辺": "nearby",
  "地図": "map",
  "緊急": "emergency",
  "ランドリー": "laundry",
  "朝食": "breakfast",
  "タクシー": "taxi",
};

export function normalizeIconToken(raw: unknown, fallback: LineIconName = "info"): LineIconName {
  if (typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  const legacyEmoji = LEGACY_EMOJI_TO_TOKEN[trimmed];
  if (legacyEmoji) return legacyEmoji;
  let key = trimmed.toLowerCase();
  if (key.startsWith("svg:")) key = key.slice(4);
  const mapped = ICON_ALIASES[key];
  if (mapped) return mapped;
  if (EMOJI_RE.test(trimmed)) return fallback;
  return fallback;
}

type LineIconProps = {
  name: LineIconName;
  className?: string;
  style?: CSSProperties;
};

function IconShell({
  className,
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const props: SVGProps<SVGSVGElement> = {
    className,
    style,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    focusable: false,
  };
  return <svg {...props}>{children}</svg>;
}

/**
 * Hospitality line icons — Lucide-grade geometry, consistent 24×24 optical grid.
 * Distinct glyphs per token (no cheap shared silhouettes).
 */
export function LineIcon({ name, className = "h-5 w-5", style }: LineIconProps) {
  switch (name) {
    case "wifi":
      return (
        <IconShell className={className} style={style}>
          <path d="M12 20h.01" />
          <path d="M2 8.82a15 15 0 0 1 20 0" />
          <path d="M5 12.86a10 10 0 0 1 14 0" />
          <path d="M8.5 16.43a5 5 0 0 1 7 0" />
        </IconShell>
      );
    case "breakfast":
      return (
        <IconShell className={className} style={style}>
          <path d="M12 4.5v2" />
          <path d="m8.2 6.2 1.3 1.5" />
          <path d="m15.8 6.2-1.3 1.5" />
          <circle cx="12" cy="14.5" r="5.5" />
          <path d="M6.5 20.5h11" />
        </IconShell>
      );
    case "utensils":
    case "restaurant":
      return (
        <IconShell className={className} style={style}>
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20" />
          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </IconShell>
      );
    case "checkout":
      return (
        <IconShell className={className} style={style}>
          <path d="M9 21H5.5A2.5 2.5 0 0 1 3 18.5v-13A2.5 2.5 0 0 1 5.5 3H9" />
          <path d="M15 16.5 20.5 12 15 7.5" />
          <path d="M20.5 12H9" />
        </IconShell>
      );
    case "clock":
      return (
        <IconShell className={className} style={style}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
        </IconShell>
      );
    case "spa":
      return (
        <IconShell className={className} style={style}>
          <path d="M12 5c-1.5 2.5-3 4.2-3 6.5a3 3 0 0 0 6 0c0-2.3-1.5-4-3-6.5Z" />
          <path d="M6.5 10.5c-1.2 1.8-2 3-2 4.8a3 3 0 0 0 5.2 2" />
          <path d="M17.5 10.5c1.2 1.8 2 3 2 4.8a3 3 0 0 1-5.2 2" />
        </IconShell>
      );
    case "bath":
      return (
        <IconShell className={className} style={style}>
          <path d="M9 6 6.5 3.5a1.5 1.5 0 0 1 2-2L11 4" />
          <path d="M4 14h16" />
          <path d="M4 14v2a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-2" />
          <path d="M6 14V9a2 2 0 0 1 2-2h1" />
        </IconShell>
      );
    case "parking":
      return (
        <IconShell className={className} style={style}>
          <rect x="4" y="3" width="16" height="18" rx="2.5" />
          <path d="M9 16V8h3.5a3 3 0 0 1 0 6H9" />
        </IconShell>
      );
    case "car":
      return (
        <IconShell className={className} style={style}>
          <path d="M5 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0" />
          <path d="M15 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0" />
          <path d="M5 17H3v-4l2-5h11l3 5h2v4h-2" />
          <path d="M9 17h6" />
          <path d="M5.5 8.5h9.5" />
        </IconShell>
      );
    case "taxi":
      return (
        <IconShell className={className} style={style}>
          <path d="M5 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0" />
          <path d="M15 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0" />
          <path d="M5 17H3v-4l2-5h11l3 5h2v4h-2" />
          <path d="M9 17h6" />
          <path d="M9 4h6v3H9z" />
          <path d="M5.5 9.5h9.5" />
        </IconShell>
      );
    case "map":
      return (
        <IconShell className={className} style={style}>
          <path d="M14.5 3.5 9.5 5.5 3.5 3.5v15l6 2 5-2 6 2v-15l-6-2Z" />
          <path d="M9.5 5.5v15" />
          <path d="M14.5 3.5v15" />
        </IconShell>
      );
    case "map-pin":
      return (
        <IconShell className={className} style={style}>
          <path d="M20 10c0 4.99-8 11.5-8 11.5S4 14.99 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.75" />
        </IconShell>
      );
    case "nearby":
      return (
        <IconShell className={className} style={style}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2.5" />
          <path d="M12 19.5V22" />
          <path d="m4.93 4.93 1.77 1.77" />
          <path d="m17.3 17.3 1.77 1.77" />
          <path d="M2 12h2.5" />
          <path d="M19.5 12H22" />
          <path d="m4.93 19.07 1.77-1.77" />
          <path d="m17.3 6.7 1.77-1.77" />
        </IconShell>
      );
    case "notice":
      return (
        <IconShell className={className} style={style}>
          <path d="m3 11 19-7-7 19-2.5-7.5L3 11Z" />
        </IconShell>
      );
    case "bell":
      return (
        <IconShell className={className} style={style}>
          <path d="M6.5 16.5h11l-1.2-1.6V11a4.3 4.3 0 0 0-8.6 0v3.9l-1.2 1.6Z" />
          <path d="M10.2 16.5a1.8 1.8 0 0 0 3.6 0" />
          <path d="M12 3.5v1.2" />
        </IconShell>
      );
    case "emergency":
      return (
        <IconShell className={className} style={style}>
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        </IconShell>
      );
    case "phone":
      return (
        <IconShell className={className} style={style}>
          <path d="M22 16.92v2.5a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h2.5a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l1.27-.95a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
        </IconShell>
      );
    case "laundry":
    case "washing-machine":
      return (
        <IconShell className={className} style={style}>
          <rect x="4" y="3" width="16" height="18" rx="2.5" />
          <circle cx="12" cy="13.5" r="4.25" />
          <path d="M8 6.5h.01" />
          <path d="M11 6.5h.01" />
          <path d="M10.2 12.2c.8-1.2 2.8-1.2 3.6 0" />
        </IconShell>
      );
    case "train":
      return (
        <IconShell className={className} style={style}>
          <rect x="5.5" y="3.5" width="13" height="13.5" rx="2.5" />
          <path d="M5.5 11h13" />
          <path d="M9 7h.01" />
          <path d="M15 7h.01" />
          <path d="m8.5 20.5-1.5 2" />
          <path d="m15.5 20.5 1.5 2" />
          <path d="M8.5 17h7" />
        </IconShell>
      );
    case "bus":
      return (
        <IconShell className={className} style={style}>
          <path d="M6 18.5V8a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v10.5" />
          <path d="M6 12h12" />
          <path d="M6 18.5h12" />
          <path d="M8 21.5v-3" />
          <path d="M16 21.5v-3" />
          <path d="M9 8.5h.01" />
          <path d="M15 8.5h.01" />
        </IconShell>
      );
    case "credit-card":
      return (
        <IconShell className={className} style={style}>
          <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
          <path d="M2.5 10h19" />
          <path d="M7 15h3.5" />
        </IconShell>
      );
    case "key":
      return (
        <IconShell className={className} style={style}>
          <circle cx="7.5" cy="15.5" r="3.5" />
          <path d="M10.5 13.5 20.5 3.5" />
          <path d="m16.5 7.5 2 2" />
          <path d="m14.5 9.5 2 2" />
        </IconShell>
      );
    case "toothbrush":
      return (
        <IconShell className={className} style={style}>
          <path d="M5.5 20.5h5a2.5 2.5 0 0 0 2.3-1.5L20 4" />
          <path d="m17.2 3.2 3.2 3.2" />
          <path d="M6.5 17.5h4" />
          <path d="M7 15h3" />
        </IconShell>
      );
    case "hanger":
      return (
        <IconShell className={className} style={style}>
          <path d="M12 5.5a1.8 1.8 0 1 0-1.8-1.8" />
          <path d="M10.2 5.7 4.2 13a2.2 2.2 0 0 0 1.8 3.6h12a2.2 2.2 0 0 0 1.8-3.6l-6-7.3" />
        </IconShell>
      );
    case "broom":
      return (
        <IconShell className={className} style={style}>
          <path d="m13.5 5.5-8 8" />
          <path d="m4.5 14.5 4.2 4.2a2.2 2.2 0 0 0 3.1 0l.7-.7" />
          <path d="M15 4 20 9" />
          <path d="M9 21.5H4.5" />
        </IconShell>
      );
    case "microwave":
      return (
        <IconShell className={className} style={style}>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <rect x="6" y="8" width="9.5" height="8" rx="1.25" />
          <path d="M18.5 8.5v.01" />
          <path d="M18.5 12v.01" />
          <path d="M18.5 15.5v.01" />
        </IconShell>
      );
    case "package":
      return (
        <IconShell className={className} style={style}>
          <path d="M11 21.5 3.5 17V7.5L11 3l7.5 4.5V17L11 21.5Z" />
          <path d="M11 21.5v-9" />
          <path d="m3.5 7.5 7.5 4.5 7.5-4.5" />
          <path d="M7.5 5.2 14.5 9.3" />
        </IconShell>
      );
    case "bed":
      return (
        <IconShell className={className} style={style}>
          <path d="M2.5 18.5v-6.5A2.5 2.5 0 0 1 5 9.5h14a2.5 2.5 0 0 1 2.5 2.5v6.5" />
          <path d="M2.5 18.5h19" />
          <path d="M4.5 9.5V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2.5" />
        </IconShell>
      );
    case "ticket":
      return (
        <IconShell className={className} style={style}>
          <path d="M3.5 9a2 2 0 0 0 0 4v4.5A1.5 1.5 0 0 0 5 19h14a1.5 1.5 0 0 0 1.5-1.5V13a2 2 0 0 0 0-4V5.5A1.5 1.5 0 0 0 19 4H5A1.5 1.5 0 0 0 3.5 5.5V9Z" />
          <path d="M12 4v15" strokeDasharray="2.2 2.4" />
        </IconShell>
      );
    case "link":
      return (
        <IconShell className={className} style={style}>
          <path d="M10 13a5 5 0 0 0 7.54.54l2-2a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-2 2a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </IconShell>
      );
    case "language":
      return (
        <IconShell className={className} style={style}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3.5 12h17" />
          <path d="M12 3a14.5 14.5 0 0 1 0 18" />
          <path d="M12 3a14.5 14.5 0 0 0 0 18" />
        </IconShell>
      );
    case "coffee":
      return (
        <IconShell className={className} style={style}>
          <path d="M5 9h11v5.5A3.5 3.5 0 0 1 12.5 18h-4A3.5 3.5 0 0 1 5 14.5V9Z" />
          <path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16" />
          <path d="M7.5 4.5c0 .9.7 1.3.7 2.2" />
          <path d="M10.5 4.5c0 .9.7 1.3.7 2.2" />
          <path d="M13.5 4.5c0 .9.7 1.3.7 2.2" />
          <path d="M6 20.5h9" />
        </IconShell>
      );
    case "shopping-bag":
      return (
        <IconShell className={className} style={style}>
          <path d="M6 8.5h12l-1.1 11a2 2 0 0 1-2 1.8H9.1a2 2 0 0 1-2-1.8L6 8.5Z" />
          <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
        </IconShell>
      );
    case "camera":
      return (
        <IconShell className={className} style={style}>
          <path d="M14.5 5.5 16 7.5h3.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5V9A1.5 1.5 0 0 1 4.5 7.5H8L9.5 5.5h5Z" />
          <circle cx="12" cy="13.5" r="3.25" />
        </IconShell>
      );
    case "gift":
      return (
        <IconShell className={className} style={style}>
          <rect x="3.5" y="9.5" width="17" height="11" rx="1.5" />
          <path d="M12 9.5v11" />
          <path d="M3.5 13.5h17" />
          <path d="M12 9.5S9.4 8.7 8.4 7.5a2 2 0 1 1 3.1-2.5S12 6.5 12 7.5" />
          <path d="M12 9.5s2.6-.8 3.6-2a2 2 0 1 0-3.1-2.5S12 6.5 12 7.5" />
        </IconShell>
      );
    case "baby":
      return (
        <IconShell className={className} style={style}>
          <circle cx="12" cy="8.5" r="2.75" />
          <path d="M7.5 20.5v-2.2a4.5 4.5 0 0 1 9 0v2.2" />
          <path d="M9 13.5h6" />
          <path d="M8.5 6.2c-.8-.8-.8-2.2.3-2.7" />
        </IconShell>
      );
    case "shield":
      return (
        <IconShell className={className} style={style}>
          <path d="M12 3 4.5 6.2v5.3c0 4.7 3.2 8.1 7.5 10.5 4.3-2.4 7.5-5.8 7.5-10.5V6.2L12 3Z" />
          <path d="m9.2 12.2 1.9 1.9 3.7-3.7" />
        </IconShell>
      );
    case "check":
      return (
        <IconShell className={className} style={style}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8.5 12.2 2.3 2.3 4.7-4.8" />
        </IconShell>
      );
    case "quote":
      return (
        <IconShell className={className} style={style}>
          <path d="M9.5 8.5H6.2A2.2 2.2 0 0 0 4 10.7v2.1A2.2 2.2 0 0 0 6.2 15H8v3.5" />
          <path d="M19.5 8.5h-3.3A2.2 2.2 0 0 0 14 10.7v2.1A2.2 2.2 0 0 0 16.2 15H18v3.5" />
        </IconShell>
      );
    case "checklist":
      return (
        <IconShell className={className} style={style}>
          <path d="M9 6.5h11" />
          <path d="M9 12h11" />
          <path d="M9 17.5h11" />
          <path d="m3.5 6.5 1.4 1.4L7.5 5" />
          <path d="m3.5 12 1.4 1.4L7.5 10.5" />
          <path d="m3.5 17.5 1.4 1.4L7.5 16" />
        </IconShell>
      );
    case "steps":
      return (
        <IconShell className={className} style={style}>
          <circle cx="6" cy="6" r="2.25" />
          <circle cx="18" cy="12" r="2.25" />
          <circle cx="6" cy="18" r="2.25" />
          <path d="M8.2 7.2 15.8 10.8" />
          <path d="M15.8 13.2 8.2 16.8" />
        </IconShell>
      );
    case "compare":
      return (
        <IconShell className={className} style={style}>
          <rect x="3" y="4.5" width="7.5" height="15" rx="1.75" />
          <rect x="13.5" y="4.5" width="7.5" height="15" rx="1.75" />
          <path d="M6.75 9h.01" />
          <path d="M17.25 9h.01" />
          <path d="M5.5 12.5h2.5" />
          <path d="M16 12.5h2.5" />
        </IconShell>
      );
    case "kpi":
      return (
        <IconShell className={className} style={style}>
          <path d="M3.5 19.5h17" />
          <path d="M6.5 19.5v-5.5" />
          <path d="M12 19.5V8.5" />
          <path d="M17.5 19.5V4.5" />
        </IconShell>
      );
    case "info":
    default:
      return (
        <IconShell className={className} style={style}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11.2V16.5" />
          <path d="M12 8h.01" />
        </IconShell>
      );
  }
}
