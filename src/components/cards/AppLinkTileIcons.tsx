"use client";

import type { ComponentType } from "react";
import type { LineIconName } from "./LineIcon";
import {
  NativeCheckIcon,
  NativeClockIcon,
  NativeDiningIcon,
  NativeEmergencyIcon,
  NativeLinkIcon,
  NativeMapIcon,
  NativeNoticeIcon,
  NativeParkingIcon,
  NativePhoneIcon,
  NativePinIcon,
  NativeQuoteIcon,
  NativeStepsIcon,
  NativeWifiIcon,
  type NativeIconProps,
} from "./native-guest-icons";

export type AppLinkTileTheme = "default" | "travel" | "food" | "map" | "stay" | "alert" | "utility";

type TileIconEntry = {
  Icon: ComponentType<NativeIconProps>;
  theme: AppLinkTileTheme;
};

function TileIconBed(props: NativeIconProps) {
  return (
    <svg viewBox="0 0 32 32" width={props.size ?? 18} height={props.size ?? 18} className="app-native-guest-icon shrink-0" aria-hidden>
      <rect x="6" y="16" width="20" height="8" rx="2" fill="#bae6fd" />
      <rect x="8" y="12" width="16" height="6" rx="2" fill="#7dd3c7" />
    </svg>
  );
}

function TileIconTicket(props: NativeIconProps) {
  return (
    <svg viewBox="0 0 32 32" width={props.size ?? 18} height={props.size ?? 18} className="app-native-guest-icon shrink-0" aria-hidden>
      <rect x="8" y="10" width="16" height="12" rx="2" fill="#fde68a" />
      <path d="M14 10v12M18 10v12" stroke="#fbbf24" strokeWidth="1.4" strokeDasharray="2 2" />
    </svg>
  );
}

function TileIconTrain(props: NativeIconProps) {
  return (
    <svg viewBox="0 0 32 32" width={props.size ?? 18} height={props.size ?? 18} className="app-native-guest-icon shrink-0" aria-hidden>
      <rect x="9" y="10" width="14" height="14" rx="3" fill="#bae6fd" />
      <rect x="12" y="14" width="8" height="4" rx="1" fill="#fff" opacity="0.8" />
      <circle cx="12" cy="24" r="1.8" fill="#475569" />
      <circle cx="20" cy="24" r="1.8" fill="#475569" />
    </svg>
  );
}

function TileIconBus(props: NativeIconProps) {
  return (
    <svg viewBox="0 0 32 32" width={props.size ?? 18} height={props.size ?? 18} className="app-native-guest-icon shrink-0" aria-hidden>
      <rect x="8" y="11" width="16" height="12" rx="2.5" fill="#7dd3c7" />
      <rect x="11" y="14" width="10" height="4" rx="1" fill="#fff" opacity="0.85" />
    </svg>
  );
}

function TileIconTaxi(props: NativeIconProps) {
  return (
    <svg viewBox="0 0 32 32" width={props.size ?? 18} height={props.size ?? 18} className="app-native-guest-icon shrink-0" aria-hidden>
      <rect x="7" y="13" width="18" height="8" rx="2" fill="#fbbf24" />
      <rect x="10" y="10" width="12" height="4" rx="1.5" fill="#fde68a" />
    </svg>
  );
}

function TileIconCar(props: NativeIconProps) {
  return (
    <svg viewBox="0 0 32 32" width={props.size ?? 18} height={props.size ?? 18} className="app-native-guest-icon shrink-0" aria-hidden>
      <rect x="7" y="14" width="18" height="7" rx="2" fill="#bae6fd" />
      <circle cx="11" cy="21" r="2" fill="#475569" />
      <circle cx="21" cy="21" r="2" fill="#475569" />
    </svg>
  );
}

function TileIconCoffee(props: NativeIconProps) {
  return (
    <svg viewBox="0 0 32 32" width={props.size ?? 18} height={props.size ?? 18} className="app-native-guest-icon shrink-0" aria-hidden>
      <rect x="10" y="12" width="10" height="9" rx="2" fill="#ffedd5" />
      <path d="M20 14h2v4a2 2 0 0 1-2 2h-1" fill="none" stroke="#fdba74" strokeWidth="1.6" />
    </svg>
  );
}

function TileIconGift(props: NativeIconProps) {
  return (
    <svg viewBox="0 0 32 32" width={props.size ?? 18} height={props.size ?? 18} className="app-native-guest-icon shrink-0" aria-hidden>
      <rect x="8" y="14" width="16" height="10" rx="2" fill="#f472b6" opacity="0.45" />
      <rect x="8" y="11" width="16" height="4" rx="1" fill="#fde68a" />
      <path d="M16 11v13M12 11c0-2 1.5-3 4-3s4 1 4 3" fill="none" stroke="#f472b6" strokeWidth="1.6" />
    </svg>
  );
}

function TileIconCamera(props: NativeIconProps) {
  return (
    <svg viewBox="0 0 32 32" width={props.size ?? 18} height={props.size ?? 18} className="app-native-guest-icon shrink-0" aria-hidden>
      <rect x="9" y="12" width="14" height="10" rx="2" fill="#ddd6fe" />
      <circle cx="16" cy="17" r="3" fill="#8b5cf6" opacity="0.45" />
    </svg>
  );
}

function TileIconKey(props: NativeIconProps) {
  return (
    <svg viewBox="0 0 32 32" width={props.size ?? 18} height={props.size ?? 18} className="app-native-guest-icon shrink-0" aria-hidden>
      <circle cx="13" cy="13" r="4" fill="#fde68a" />
      <path d="M16 16h8v2h-2v2h-2v-2h-2" fill="#fbbf24" />
    </svg>
  );
}

function TileIconInfo(props: NativeIconProps) {
  return (
    <svg viewBox="0 0 32 32" width={props.size ?? 18} height={props.size ?? 18} className="app-native-guest-icon shrink-0" aria-hidden>
      <circle cx="16" cy="16" r="8" fill="#e0f2fe" />
      <circle cx="16" cy="12" r="1.2" fill="#0284c7" />
      <rect x="14.8" y="15" width="2.4" height="6" rx="1.2" fill="#0284c7" />
    </svg>
  );
}

const TILE_ICON_MAP: Record<LineIconName, TileIconEntry> = {
  wifi: { Icon: NativeWifiIcon, theme: "utility" },
  breakfast: { Icon: NativeDiningIcon, theme: "food" },
  utensils: { Icon: NativeDiningIcon, theme: "food" },
  checkout: { Icon: NativeClockIcon, theme: "stay" },
  clock: { Icon: NativeClockIcon, theme: "stay" },
  restaurant: { Icon: NativeDiningIcon, theme: "food" },
  spa: { Icon: NativeDiningIcon, theme: "utility" },
  bath: { Icon: NativeDiningIcon, theme: "utility" },
  parking: { Icon: NativeParkingIcon, theme: "utility" },
  car: { Icon: TileIconCar, theme: "travel" },
  map: { Icon: NativeMapIcon, theme: "map" },
  "map-pin": { Icon: NativePinIcon, theme: "map" },
  nearby: { Icon: NativePinIcon, theme: "map" },
  notice: { Icon: NativeNoticeIcon, theme: "alert" },
  bell: { Icon: NativeNoticeIcon, theme: "alert" },
  emergency: { Icon: NativeEmergencyIcon, theme: "alert" },
  phone: { Icon: NativePhoneIcon, theme: "utility" },
  laundry: { Icon: NativeClockIcon, theme: "utility" },
  "washing-machine": { Icon: NativeClockIcon, theme: "utility" },
  taxi: { Icon: TileIconTaxi, theme: "travel" },
  train: { Icon: TileIconTrain, theme: "travel" },
  bus: { Icon: TileIconBus, theme: "travel" },
  "credit-card": { Icon: TileIconTicket, theme: "utility" },
  key: { Icon: TileIconKey, theme: "stay" },
  toothbrush: { Icon: NativeCheckIcon, theme: "utility" },
  hanger: { Icon: NativeCheckIcon, theme: "utility" },
  broom: { Icon: NativeCheckIcon, theme: "utility" },
  microwave: { Icon: NativeDiningIcon, theme: "food" },
  package: { Icon: TileIconGift, theme: "default" },
  bed: { Icon: TileIconBed, theme: "stay" },
  ticket: { Icon: TileIconTicket, theme: "travel" },
  info: { Icon: TileIconInfo, theme: "default" },
  link: { Icon: NativeLinkIcon, theme: "default" },
  language: { Icon: TileIconInfo, theme: "utility" },
  coffee: { Icon: TileIconCoffee, theme: "food" },
  "shopping-bag": { Icon: TileIconGift, theme: "default" },
  camera: { Icon: TileIconCamera, theme: "default" },
  gift: { Icon: TileIconGift, theme: "default" },
  baby: { Icon: TileIconInfo, theme: "utility" },
  shield: { Icon: NativeEmergencyIcon, theme: "alert" },
  check: { Icon: NativeCheckIcon, theme: "default" },
  quote: { Icon: NativeQuoteIcon, theme: "default" },
  checklist: { Icon: NativeCheckIcon, theme: "default" },
  steps: { Icon: NativeStepsIcon, theme: "default" },
  compare: { Icon: NativeStepsIcon, theme: "default" },
  kpi: { Icon: TileIconInfo, theme: "default" },
};

/** Themed deformed icon badge for AppLinkTile rows (Phase 9). */
export function AppLinkTileIcon({
  name,
  size = 18,
  className = "",
}: {
  name: LineIconName;
  size?: number;
  className?: string;
}) {
  const entry = TILE_ICON_MAP[name] ?? { Icon: NativeLinkIcon, theme: "default" as const };
  const { Icon, theme } = entry;
  return (
    <span className={"app-link-tile-icon app-link-tile-icon--" + theme + " " + className}>
      <Icon size={size} />
    </span>
  );
}
