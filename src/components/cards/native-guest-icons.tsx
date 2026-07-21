"use client";

import type { ReactNode, SVGProps } from "react";

/** Shared filled deformed pictograms for native guest section headers (Phase 9). */

type NativeIconProps = SVGProps<SVGSVGElement> & { size?: number };

export type { NativeIconProps };

function NativeIconFrame({ size = 18, className = "", children, ...rest }: NativeIconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={"app-native-guest-icon shrink-0 " + className}
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export function NativeLinkIcon(props: NativeIconProps) {
  return (
    <NativeIconFrame {...props}>
      <rect x="7" y="11" width="14" height="10" rx="3" fill="#7dd3c7" />
      <path d="M18 9.5 22.5 14 18 18.5" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16" r="2.5" fill="#0d9488" />
    </NativeIconFrame>
  );
}

export function NativeUsersIcon(props: NativeIconProps) {
  return (
    <NativeIconFrame {...props}>
      <circle cx="12" cy="13" r="4" fill="#bae6fd" />
      <circle cx="21" cy="14" r="3.5" fill="#7dd3c7" />
      <path d="M6 24c.8-3.5 3.5-5.5 6-5.5s5.2 2 6 5.5M16 24c.7-2.8 2.8-4.5 5-4.5s4.3 1.7 5 4.5" fill="#0d9488" opacity="0.35" />
    </NativeIconFrame>
  );
}

export function NativeCalendarIcon(props: NativeIconProps) {
  return (
    <NativeIconFrame {...props}>
      <rect x="7" y="8" width="18" height="17" rx="3" fill="#fff" stroke="#94a3b8" strokeWidth="1.2" />
      <rect x="7" y="12" width="18" height="3" fill="#7dd3c7" />
      <rect x="10" y="17" width="5" height="1.4" rx="0.7" fill="#cbd5e1" />
      <rect x="17" y="17" width="5" height="1.4" rx="0.7" fill="#cbd5e1" />
    </NativeIconFrame>
  );
}

export function NativeCheckIcon(props: NativeIconProps) {
  return (
    <NativeIconFrame {...props}>
      <circle cx="16" cy="16" r="9" fill="#ecfdf5" />
      <path d="M11 16.5 14.5 20 22 12" fill="none" stroke="#0d9488" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </NativeIconFrame>
  );
}

export function NativePhoneIcon(props: NativeIconProps) {
  return (
    <NativeIconFrame {...props}>
      <rect x="10" y="6" width="12" height="20" rx="3" fill="#7dd3c7" />
      <rect x="13" y="9" width="6" height="10" rx="1.2" fill="#fff" opacity="0.85" />
      <circle cx="16" cy="22" r="1.2" fill="#0d9488" />
    </NativeIconFrame>
  );
}

export function NativeFaqIcon(props: NativeIconProps) {
  return (
    <NativeIconFrame {...props}>
      <circle cx="16" cy="16" r="9" fill="#e0f2fe" />
      <path d="M13.5 12.5a2.5 2.5 0 0 1 4.5 1.5c0 2-3 2-3 4" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="21" r="1.2" fill="#0284c7" />
    </NativeIconFrame>
  );
}

export function NativeStepsIcon(props: NativeIconProps) {
  return (
    <NativeIconFrame {...props}>
      <rect x="8" y="8" width="16" height="16" rx="3" fill="#fff" stroke="#94a3b8" strokeWidth="1.2" />
      <rect x="11" y="12" width="8" height="1.6" rx="0.8" fill="#7dd3c7" />
      <rect x="11" y="16" width="6" height="1.6" rx="0.8" fill="#cbd5e1" />
      <circle cx="22" cy="12" r="3" fill="#0d9488" />
      <path d="M21 12h2M22 11v2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
    </NativeIconFrame>
  );
}

export function NativeMapIcon(props: NativeIconProps) {
  return (
    <NativeIconFrame {...props}>
      <path d="M8 10 16 6l8 4v14l-8-4-8 4V10z" fill="#bae6fd" />
      <path d="M16 6v18M16 6l8 4M16 24l8-4" fill="none" stroke="#0ea5e9" strokeWidth="1.4" />
    </NativeIconFrame>
  );
}

export function NativeSocialIcon(props: NativeIconProps) {
  return (
    <NativeIconFrame {...props}>
      <circle cx="11" cy="14" r="4" fill="#bae6fd" />
      <circle cx="21" cy="14" r="4" fill="#7dd3c7" />
      <circle cx="16" cy="20" r="4" fill="#fde68a" />
    </NativeIconFrame>
  );
}

export function NativeTilesIcon(props: NativeIconProps) {
  return (
    <NativeIconFrame {...props}>
      <rect x="6" y="7" width="9" height="9" rx="2.2" fill="#7dd3c7" />
      <rect x="17" y="7" width="9" height="9" rx="2.2" fill="#bae6fd" />
      <rect x="6" y="18" width="9" height="9" rx="2.2" fill="#fde68a" />
      <rect x="17" y="18" width="9" height="9" rx="2.2" fill="#f472b6" opacity="0.55" />
    </NativeIconFrame>
  );
}

export function NativeWifiIcon(props: NativeIconProps) {
  return (
    <NativeIconFrame {...props}>
      <path d="M8 18c4-3.5 12-3.5 16 0" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 21c2.5-2 7.5-2 10 0" fill="none" stroke="#7dd3c7" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="24" r="1.8" fill="#0d9488" />
    </NativeIconFrame>
  );
}

export function NativeClockIcon(props: NativeIconProps) {
  return (
    <NativeIconFrame {...props}>
      <circle cx="16" cy="16" r="9" fill="#ecfdf5" stroke="#7dd3c7" strokeWidth="1.4" />
      <path d="M16 11v5l3.5 2" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" />
    </NativeIconFrame>
  );
}

export function NativeParkingIcon(props: NativeIconProps) {
  return (
    <NativeIconFrame {...props}>
      <rect x="8" y="8" width="16" height="16" rx="3" fill="#e2e8f0" />
      <text x="16" y="20" textAnchor="middle" fontSize="11" fontWeight="800" fill="#475569">
        P
      </text>
    </NativeIconFrame>
  );
}

export function NativePinIcon(props: NativeIconProps) {
  return (
    <NativeIconFrame {...props}>
      <path d="M16 6c-3.5 0-6 2.5-6 5.5 0 5 6 10.5 6 10.5s6-5.5 6-10.5C22 8.5 19.5 6 16 6z" fill="#f472b6" opacity="0.35" />
      <circle cx="16" cy="11.5" r="3.5" fill="#0d9488" />
      <circle cx="16" cy="11.5" r="1.4" fill="#fff" />
    </NativeIconFrame>
  );
}

export function NativeNoticeIcon(props: NativeIconProps) {
  return (
    <NativeIconFrame {...props}>
      <rect x="7" y="9" width="18" height="14" rx="3" fill="#fef3c7" />
      <circle cx="16" cy="14" r="2.5" fill="#fbbf24" />
      <rect x="12" y="18.5" width="8" height="1.6" rx="0.8" fill="#fcd34d" />
    </NativeIconFrame>
  );
}

export function NativeDiningIcon(props: NativeIconProps) {
  return (
    <NativeIconFrame {...props}>
      <rect x="7" y="8" width="18" height="16" rx="3" fill="#ffedd5" />
      <rect x="10" y="12" width="8" height="1.6" rx="0.8" fill="#fdba74" />
      <rect x="10" y="16" width="12" height="1.6" rx="0.8" fill="#fdba74" opacity="0.7" />
      <circle cx="22" cy="13" r="2.5" fill="#fb923c" />
    </NativeIconFrame>
  );
}

export function NativeStatusIcon(props: NativeIconProps) {
  return (
    <NativeIconFrame {...props}>
      <circle cx="16" cy="16" r="9" fill="#dcfce7" />
      <path d="M11 16.5 14.5 20 22 12" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </NativeIconFrame>
  );
}

export function NativeEmergencyIcon(props: NativeIconProps) {
  return (
    <NativeIconFrame {...props}>
      <path d="M16 7 8 23h16L16 7z" fill="#fecaca" />
      <rect x="14.2" y="13" width="3.6" height="5.5" rx="0.8" fill="#ef4444" />
      <circle cx="16" cy="21" r="1.2" fill="#ef4444" />
    </NativeIconFrame>
  );
}

export function NativeQuoteIcon(props: NativeIconProps) {
  return (
    <NativeIconFrame {...props}>
      <path d="M10 12c0-2.2 1.8-4 4-4v3c-1.1 0-2 .9-2 2h3v7h-5v-8zM20 12c0-2.2 1.8-4 4-4v3c-1.1 0-2 .9-2 2h3v7h-5v-8z" fill="#7dd3c7" />
    </NativeIconFrame>
  );
}

/* --- Schedule timeline dots (Phase 9) --- */

export type ScheduleGlyphKey = "sun" | "dining" | "pin" | "car" | "moon" | "plane" | "home" | "camera" | "coffee" | "party";

const SCHEDULE_GLYPHS = ["☀", "🍽", "📍", "🚗", "🌙", "✈", "🏠", "📷", "☕", "🎉"] as const;

const SCHEDULE_GLYPH_KEYS: readonly ScheduleGlyphKey[] = [
  "sun",
  "dining",
  "pin",
  "car",
  "moon",
  "plane",
  "home",
  "camera",
  "coffee",
  "party",
];

const SCHEDULE_EMOJI_TO_KEY: Record<string, ScheduleGlyphKey> = {
  "☀": "sun",
  "🍽": "dining",
  "📍": "pin",
  "🚗": "car",
  "🌙": "moon",
  "✈": "plane",
  "🏠": "home",
  "📷": "camera",
  "☕": "coffee",
  "🎉": "party",
};

export function scheduleGlyphForIndex(index: number): string {
  return SCHEDULE_GLYPHS[index % SCHEDULE_GLYPHS.length] ?? "•";
}

/** Prefer per-item icon when set; otherwise cycle default glyphs. */
export function scheduleGlyphForItem(icon: unknown, index: number): string {
  if (typeof icon === "string" && icon.trim()) return icon.trim();
  return scheduleGlyphForIndex(index);
}

export const SCHEDULE_ICON_CHOICES: readonly string[] = SCHEDULE_GLYPHS;

export function resolveScheduleGlyphKey(icon: unknown, index: number): ScheduleGlyphKey {
  const raw = scheduleGlyphForItem(icon, index);
  return SCHEDULE_EMOJI_TO_KEY[raw] ?? SCHEDULE_GLYPH_KEYS[index % SCHEDULE_GLYPH_KEYS.length];
}

function ScheduleGlyphIcon({ glyph, size = 14 }: { glyph: ScheduleGlyphKey; size?: number }) {
  switch (glyph) {
    case "sun":
      return (
        <NativeIconFrame size={size}>
          <circle cx="16" cy="16" r="6" fill="#fde68a" />
          <circle cx="16" cy="16" r="3" fill="#fbbf24" />
        </NativeIconFrame>
      );
    case "dining":
      return (
        <NativeIconFrame size={size}>
          <rect x="10" y="12" width="12" height="8" rx="2" fill="#ffedd5" />
          <rect x="12" y="14" width="8" height="1.2" rx="0.6" fill="#fdba74" />
        </NativeIconFrame>
      );
    case "pin":
      return (
        <NativeIconFrame size={size}>
          <circle cx="16" cy="13" r="4" fill="#0d9488" />
          <path d="M16 17v5" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" />
        </NativeIconFrame>
      );
    case "car":
      return (
        <NativeIconFrame size={size}>
          <rect x="8" y="14" width="16" height="7" rx="2" fill="#bae6fd" />
          <circle cx="12" cy="21" r="2" fill="#475569" />
          <circle cx="20" cy="21" r="2" fill="#475569" />
        </NativeIconFrame>
      );
    case "moon":
      return (
        <NativeIconFrame size={size}>
          <path d="M18 10a6 6 0 1 1-8 8 7 7 0 0 0 8-8z" fill="#cbd5e1" />
        </NativeIconFrame>
      );
    case "plane":
      return (
        <NativeIconFrame size={size}>
          <path d="M8 18 20 12 8 6v4l8 2-8 2v4z" fill="#7dd3c7" />
        </NativeIconFrame>
      );
    case "home":
      return (
        <NativeIconFrame size={size}>
          <path d="M16 8 10 14v8h4v-5h4v5h4v-8L16 8z" fill="#7dd3c7" />
        </NativeIconFrame>
      );
    case "camera":
      return (
        <NativeIconFrame size={size}>
          <rect x="9" y="12" width="14" height="10" rx="2" fill="#ddd6fe" />
          <circle cx="16" cy="17" r="3" fill="#8b5cf6" opacity="0.45" />
        </NativeIconFrame>
      );
    case "coffee":
      return (
        <NativeIconFrame size={size}>
          <rect x="10" y="12" width="10" height="9" rx="2" fill="#ffedd5" />
          <path d="M20 14h2v4a2 2 0 0 1-2 2h-1" fill="none" stroke="#fdba74" strokeWidth="1.6" />
        </NativeIconFrame>
      );
    case "party":
      return (
        <NativeIconFrame size={size}>
          <path d="M10 20 16 8l6 12H10z" fill="#f472b6" opacity="0.55" />
          <circle cx="22" cy="10" r="2" fill="#fde68a" />
        </NativeIconFrame>
      );
    default:
      return (
        <NativeIconFrame size={size}>
          <circle cx="16" cy="16" r="4" fill="#7dd3c7" />
        </NativeIconFrame>
      );
  }
}

/** Deformed schedule dot for native timeline (maps legacy emoji + defaults). */
export function NativeScheduleDot({ icon, index, size = 14 }: { icon?: unknown; index: number; size?: number }) {
  return <ScheduleGlyphIcon glyph={resolveScheduleGlyphKey(icon, index)} size={size} />;
}
