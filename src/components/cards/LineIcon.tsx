import type { CSSProperties } from "react";

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

const ICON_ALIASES: Record<string, LineIconName> = {
  wifi: "wifi",
  "wi-fi": "wifi",
  internet: "wifi",
  breakfast: "breakfast",
  utensils: "utensils",
  "svg:utensils": "utensils",
  morning: "breakfast",
  checkout: "checkout",
  clock: "clock",
  "svg:clock": "clock",
  "check-out": "checkout",
  restaurant: "restaurant",
  dining: "restaurant",
  spa: "spa",
  bath: "bath",
  "svg:bath": "bath",
  onsen: "spa",
  parking: "parking",
  car: "car",
  "svg:car": "car",
  map: "map",
  "map-pin": "map-pin",
  "svg:map-pin": "map-pin",
  nearby: "nearby",
  location: "nearby",
  notice: "notice",
  bell: "bell",
  "svg:bell": "bell",
  alert: "notice",
  emergency: "emergency",
  phone: "phone",
  "svg:phone": "phone",
  laundry: "laundry",
  "washing-machine": "washing-machine",
  "svg:washing-machine": "washing-machine",
  taxi: "taxi",
  train: "train",
  "svg:train": "train",
  bus: "bus",
  "svg:bus": "bus",
  "credit-card": "credit-card",
  "svg:credit-card": "credit-card",
  key: "key",
  "svg:key": "key",
  toothbrush: "toothbrush",
  "svg:toothbrush": "toothbrush",
  hanger: "hanger",
  "svg:hanger": "hanger",
  broom: "broom",
  "svg:broom": "broom",
  microwave: "microwave",
  "svg:microwave": "microwave",
  package: "package",
  "svg:package": "package",
  bed: "bed",
  "svg:bed": "bed",
  ticket: "ticket",
  "svg:ticket": "ticket",
  info: "info",
  "svg:info": "info",
  link: "link",
  language: "language",
  "svg:language": "language",
  coffee: "coffee",
  "svg:coffee": "coffee",
  "shopping-bag": "shopping-bag",
  shopping: "shopping-bag",
  "svg:shopping-bag": "shopping-bag",
  camera: "camera",
  "svg:camera": "camera",
  gift: "gift",
  "svg:gift": "gift",
  baby: "baby",
  "svg:baby": "baby",
  shield: "shield",
  "svg:shield": "shield",
  check: "check",
  "svg:check": "check",
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

export function normalizeIconToken(raw: unknown, fallback: LineIconName = "info"): LineIconName {
  if (typeof raw !== "string") return fallback;
  const token = raw.trim().toLowerCase();
  if (!token) return fallback;
  if (ICON_ALIASES[token]) return ICON_ALIASES[token];
  if (EMOJI_RE.test(token)) return fallback;
  return fallback;
}

type LineIconProps = {
  name: LineIconName;
  className?: string;
  style?: CSSProperties;
};

export function LineIcon({ name, className = "h-5 w-5", style }: LineIconProps) {
  const base = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
    style,
  };

  switch (name) {
    case "wifi":
      return (
        <svg {...base}>
          <path d="M4.5 9.5a11 11 0 0 1 15 0" />
          <path d="M7.5 12.5a7 7 0 0 1 9 0" />
          <path d="M10.5 15.5a3 3 0 0 1 3 0" />
          <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "breakfast":
    case "utensils":
      return (
        <svg {...base}>
          <path d="M7 4v8" />
          <path d="M5 4v4" />
          <path d="M9 4v4" />
          <path d="M7 12v8" />
          <path d="M16 4c1.5 2.5 1.5 5.5 0 8v8" />
        </svg>
      );
    case "checkout":
    case "clock":
      return (
        <svg {...base}>
          <path d="M12 8v4l3 2" />
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
    case "restaurant":
      return (
        <svg {...base}>
          <path d="M5 5v14" />
          <path d="M8 5v7" />
          <path d="M11 5v7" />
          <path d="M8 12v7" />
          <path d="M17 5v14" />
          <path d="M17 5c2.5 0 2.5 3.5 0 3.5" />
        </svg>
      );
    case "spa":
    case "bath":
      return (
        <svg {...base}>
          <path d="M7 19h10" />
          <path d="M6 15h12" />
          <path d="M8 11h8" />
          <path d="M9 5c0 2 2 2 2 4" />
          <path d="M15 5c0 2-2 2-2 4" />
        </svg>
      );
    case "parking":
    case "car":
      return (
        <svg {...base}>
          <path d="M4 13h16l-1.5-4h-13L4 13Z" />
          <path d="M5 13v4h2" />
          <path d="M17 17h2v-4" />
          <circle cx="8" cy="17" r="1.6" />
          <circle cx="16" cy="17" r="1.6" />
        </svg>
      );
    case "map":
    case "map-pin":
    case "nearby":
      return (
        <svg {...base}>
          <path d="M12 21s6-5.4 6-10a6 6 0 1 0-12 0c0 4.6 6 10 6 10Z" />
          <circle cx="12" cy="11" r="2.5" />
        </svg>
      );
    case "notice":
    case "bell":
      return (
        <svg {...base}>
          <path d="M8 17h8l-1-2v-4a3 3 0 1 0-6 0v4l-1 2Z" />
          <path d="M10.5 19a1.5 1.5 0 0 0 3 0" />
        </svg>
      );
    case "emergency":
    case "phone":
      return (
        <svg {...base}>
          <path d="M6 3h4l1 4-2 1.5a14 14 0 0 0 6 6L16.5 12l4 1v4l-2 2a3 3 0 0 1-3 .7A18 18 0 0 1 4.3 8.5 3 3 0 0 1 5 5.5L6 3Z" />
        </svg>
      );
    case "laundry":
    case "washing-machine":
      return (
        <svg {...base}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <circle cx="12" cy="13" r="4" />
          <path d="M8 8h.01" />
          <path d="M11 8h.01" />
        </svg>
      );
    case "taxi":
      return (
        <svg {...base}>
          <path d="M4 13h16l-1.5-4h-13L4 13Z" />
          <path d="M5 13v4h2" />
          <path d="M17 17h2v-4" />
          <circle cx="8" cy="17" r="1.6" />
          <circle cx="16" cy="17" r="1.6" />
        </svg>
      );
    case "train":
      return (
        <svg {...base}>
          <rect x="6" y="3.5" width="12" height="14" rx="2" />
          <path d="M9 7h2M13 7h2M8 12h8M10 17l-2 3M14 17l2 3" />
        </svg>
      );
    case "bus":
      return (
        <svg {...base}>
          <rect x="5" y="4" width="14" height="13" rx="2" />
          <path d="M5 10h14M8 17v3M16 17v3" />
          <circle cx="9" cy="18" r="1.2" />
          <circle cx="15" cy="18" r="1.2" />
        </svg>
      );
    case "credit-card":
      return (
        <svg {...base}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18M7 14h4" />
        </svg>
      );
    case "key":
      return (
        <svg {...base}>
          <circle cx="8.5" cy="12" r="3.2" />
          <path d="M11.7 12H20" />
          <path d="M16 12v2" />
          <path d="M18 12v1.5" />
        </svg>
      );
    case "toothbrush":
      return (
        <svg {...base}>
          <path d="M4 18.5h6.5a2.5 2.5 0 0 0 2.3-1.5L20 4.5" />
          <path d="M17.8 3.8 20.2 6.2" />
          <path d="M5.5 16.5h3.5" />
        </svg>
      );
    case "hanger":
      return (
        <svg {...base}>
          <path d="M12 7a2 2 0 1 0-2-2" />
          <path d="M10 7.2 4.5 14a2 2 0 0 0 1.6 3.3h11.8a2 2 0 0 0 1.6-3.3L14 7.2" />
        </svg>
      );
    case "broom":
      return (
        <svg {...base}>
          <path d="M4 19h9" />
          <path d="M14 5 9 10" />
          <path d="m8 11 4.5 4.5a2 2 0 0 1 0 2.8L11.8 19H6.5" />
        </svg>
      );
    case "microwave":
      return (
        <svg {...base}>
          <rect x="3.5" y="5" width="17" height="14" rx="2" />
          <rect x="6.5" y="8" width="9" height="8" rx="1" />
          <path d="M18 8v8M19 9v.01M19 12v.01M19 15v.01" />
        </svg>
      );
    case "package":
      return (
        <svg {...base}>
          <path d="M4.5 8.5 12 4l7.5 4.5v7L12 20l-7.5-4.5v-7Z" />
          <path d="M12 20v-7.5M4.5 8.5 12 13l7.5-4.5" />
        </svg>
      );
    case "bed":
      return (
        <svg {...base}>
          <path d="M3.5 18.5h17" />
          <path d="M5 18.5V9.5h14v9" />
          <rect x="6.5" y="11" width="4.5" height="3" rx="1" />
        </svg>
      );
    case "ticket":
      return (
        <svg {...base}>
          <path d="M4 8a2 2 0 0 0 2-2h12v4a2 2 0 1 1 0 4v4H6a2 2 0 0 0-2-2V8Z" />
          <path d="M12 7v10" />
        </svg>
      );
    case "link":
      return (
        <svg {...base}>
          <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1.5 1.5" />
          <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7L13.5 18" />
        </svg>
      );
    case "language":
      return (
        <svg {...base}>
          <circle cx="12" cy="12" r="8" />
          <path d="M4.5 12h15" />
          <path d="M12 4a12 12 0 0 1 0 16" />
          <path d="M12 4a12 12 0 0 0 0 16" />
        </svg>
      );
    case "coffee":
      return (
        <svg {...base}>
          <path d="M5 10h10v5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-5Z" />
          <path d="M15 11h1.5a2 2 0 1 1 0 4H15" />
          <path d="M7 6c0 1 1 1 1 2M10 6c0 1 1 1 1 2M13 6c0 1 1 1 1 2" />
        </svg>
      );
    case "shopping-bag":
      return (
        <svg {...base}>
          <path d="M6 9h12l-1 10H7L6 9Z" />
          <path d="M9 9V7a3 3 0 0 1 6 0v2" />
        </svg>
      );
    case "camera":
      return (
        <svg {...base}>
          <rect x="4" y="7" width="16" height="12" rx="2" />
          <circle cx="12" cy="13" r="3.2" />
          <path d="M8 7l1.2-2h5.6L16 7" />
        </svg>
      );
    case "gift":
      return (
        <svg {...base}>
          <path d="M4 10h16v9H4z" />
          <path d="M12 10v9M4 13h16" />
          <path d="M12 10s-2.8-.8-3.8-2a1.8 1.8 0 1 1 2.8-2.2c.5.6 1 1.6 1 1.6s.5-1 1-1.6A1.8 1.8 0 1 1 15.8 8c-1 1.2-3.8 2-3.8 2Z" />
        </svg>
      );
    case "baby":
      return (
        <svg {...base}>
          <circle cx="12" cy="9" r="2.2" />
          <path d="M8 19v-2.5a4 4 0 0 1 8 0V19" />
          <path d="M9 13h6" />
        </svg>
      );
    case "shield":
      return (
        <svg {...base}>
          <path d="M12 3 5.5 6v5.5c0 4.1 2.7 6.8 6.5 9.5 3.8-2.7 6.5-5.4 6.5-9.5V6L12 3Z" />
          <path d="m9.5 12 1.8 1.8 3.2-3.2" />
        </svg>
      );
    case "check":
      return (
        <svg {...base}>
          <circle cx="12" cy="12" r="8" />
          <path d="m8.5 12 2.2 2.2 4.8-4.8" />
        </svg>
      );
    case "quote":
      return (
        <svg {...base}>
          <path d="M9 8H6v4h3v4H5v-4C5 9.8 6.8 8 9 8Z" />
          <path d="M19 8h-3v4h3v4h-4v-4c0-2.2 1.8-4 4-4Z" />
        </svg>
      );
    case "checklist":
      return (
        <svg {...base}>
          <path d="M4 7h11" />
          <path d="M4 12h11" />
          <path d="M4 17h11" />
          <path d="m18 7 1.5 1.5L22 6" />
          <path d="m18 12 1.5 1.5L22 11" />
          <path d="m18 17 1.5 1.5L22 16" />
        </svg>
      );
    case "steps":
      return (
        <svg {...base}>
          <circle cx="6" cy="6" r="2" />
          <circle cx="18" cy="12" r="2" />
          <circle cx="6" cy="18" r="2" />
          <path d="M8 7.2 16 10.8" />
          <path d="M16 13.2 8 16.8" />
        </svg>
      );
    case "compare":
      return (
        <svg {...base}>
          <rect x="3" y="5" width="8" height="14" rx="1.5" />
          <rect x="13" y="5" width="8" height="14" rx="1.5" />
          <path d="M7 9h.01" />
          <path d="M17 9h.01" />
        </svg>
      );
    case "kpi":
      return (
        <svg {...base}>
          <path d="M4 18h16" />
          <rect x="6" y="11" width="3" height="5" rx="0.6" />
          <rect x="11" y="8" width="3" height="8" rx="0.6" />
          <rect x="16" y="5" width="3" height="11" rx="0.6" />
        </svg>
      );
    case "info":
    default:
      return (
        <svg {...base}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 10v5" />
          <circle cx="12" cy="7.5" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}
