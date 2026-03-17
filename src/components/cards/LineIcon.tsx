import type { CSSProperties } from "react";

export type LineIconName =
  | "wifi"
  | "breakfast"
  | "checkout"
  | "restaurant"
  | "spa"
  | "parking"
  | "map"
  | "nearby"
  | "notice"
  | "emergency"
  | "laundry"
  | "taxi"
  | "info"
  | "link"
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
  morning: "breakfast",
  checkout: "checkout",
  "check-out": "checkout",
  restaurant: "restaurant",
  dining: "restaurant",
  spa: "spa",
  onsen: "spa",
  parking: "parking",
  map: "map",
  nearby: "nearby",
  location: "nearby",
  notice: "notice",
  alert: "notice",
  emergency: "emergency",
  laundry: "laundry",
  taxi: "taxi",
  info: "info",
  link: "link",
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
      return (
        <svg {...base}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M10 16V8h4a3 3 0 1 1 0 6h-4" />
        </svg>
      );
    case "map":
    case "nearby":
      return (
        <svg {...base}>
          <path d="M12 21s6-5.4 6-10a6 6 0 1 0-12 0c0 4.6 6 10 6 10Z" />
          <circle cx="12" cy="11" r="2.5" />
        </svg>
      );
    case "notice":
      return (
        <svg {...base}>
          <path d="M12 9v4" />
          <circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />
          <path d="M12 3 22 20H2L12 3Z" />
        </svg>
      );
    case "emergency":
      return (
        <svg {...base}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v5" />
          <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );
    case "laundry":
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
    case "link":
      return (
        <svg {...base}>
          <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1.5 1.5" />
          <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7L13.5 18" />
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
