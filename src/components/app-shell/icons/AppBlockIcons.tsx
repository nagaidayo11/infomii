"use client";

import type { ReactNode, SVGProps } from "react";
import type { CardType } from "@/components/editor/types";

/** Deformed filled pictograms for block library rows (App editor Phase 8). */

type BlockIconProps = SVGProps<SVGSVGElement> & { size?: number };

function BlockIconFrame({ size = 20, className = "", children, ...rest }: BlockIconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={"app-block-icon shrink-0 " + className}
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

function BlockIconSticker(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <path d="M8 6h12l6 6v14a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z" fill="#7dd3c7" />
      <path d="M20 6v6h6" fill="#0d9488" opacity="0.35" />
      <circle cx="13" cy="17" r="3.5" fill="#fff" opacity="0.85" />
    </BlockIconFrame>
  );
}

function BlockIconHero(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="5" y="8" width="22" height="16" rx="3" fill="#bae6fd" />
      <circle cx="12" cy="14" r="3" fill="#fff" opacity="0.9" />
      <path d="M5 22l6-5 4 3 5-4 7 6" fill="#0ea5e9" opacity="0.45" />
    </BlockIconFrame>
  );
}

function BlockIconSlider(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="5" y="9" width="22" height="14" rx="3" fill="#bae6fd" />
      <rect x="8" y="19" width="4" height="1.6" rx="0.8" fill="#0ea5e9" />
      <rect x="14" y="19" width="4" height="1.6" rx="0.8" fill="#fff" opacity="0.7" />
      <rect x="20" y="19" width="4" height="1.6" rx="0.8" fill="#fff" opacity="0.5" />
    </BlockIconFrame>
  );
}

function BlockIconText(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="7" y="8" width="18" height="16" rx="3" fill="#fff" stroke="#94a3b8" strokeWidth="1.2" />
      <rect x="10" y="12" width="12" height="2" rx="1" fill="#7dd3c7" />
      <rect x="10" y="16.5" width="9" height="1.6" rx="0.8" fill="#cbd5e1" />
      <rect x="10" y="20" width="10" height="1.6" rx="0.8" fill="#cbd5e1" />
    </BlockIconFrame>
  );
}

function BlockIconInfo(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="7" y="7" width="18" height="18" rx="4" fill="#ecfdf5" />
      <rect x="10" y="11" width="6" height="1.6" rx="0.8" fill="#99f6e4" />
      <rect x="18" y="11" width="4" height="1.6" rx="0.8" fill="#0d9488" opacity="0.5" />
      <rect x="10" y="15.5" width="6" height="1.6" rx="0.8" fill="#99f6e4" />
      <rect x="18" y="15.5" width="4" height="1.6" rx="0.8" fill="#0d9488" opacity="0.5" />
      <rect x="10" y="20" width="6" height="1.6" rx="0.8" fill="#99f6e4" />
      <rect x="18" y="20" width="4" height="1.6" rx="0.8" fill="#0d9488" opacity="0.5" />
    </BlockIconFrame>
  );
}

function BlockIconHighlight(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="6" y="10" width="20" height="12" rx="3" fill="#fde68a" />
      <path d="M16 8l1.8 4.2 4.5.4-3.4 2.9 1 4.4L16 18l-3.9 2.9 1-4.4-3.4-2.9 4.5-.4L16 8z" fill="#fbbf24" />
    </BlockIconFrame>
  );
}

function BlockIconAction(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="6" y="11" width="20" height="10" rx="5" fill="#0d9488" />
      <path d="M15 16h6M18 13v6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </BlockIconFrame>
  );
}

function BlockIconWelcome(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <path d="M16 6 7 14v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V14L16 6z" fill="#7dd3c7" />
      <rect x="13" y="17" width="6" height="5" rx="1.2" fill="#fff" opacity="0.85" />
    </BlockIconFrame>
  );
}

function BlockIconWifi(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <path d="M8 18c4-3.5 12-3.5 16 0" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 21c2.5-2 7.5-2 10 0" fill="none" stroke="#7dd3c7" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="24" r="1.8" fill="#0d9488" />
    </BlockIconFrame>
  );
}

function BlockIconClock(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <circle cx="16" cy="16" r="9" fill="#ecfdf5" stroke="#7dd3c7" strokeWidth="1.4" />
      <path d="M16 11v5l3.5 2" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" />
    </BlockIconFrame>
  );
}

function BlockIconMap(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <path d="M16 6c-3.5 0-6 2.5-6 5.5 0 5 6 10.5 6 10.5s6-5.5 6-10.5C22 8.5 19.5 6 16 6z" fill="#f472b6" opacity="0.35" />
      <circle cx="16" cy="11.5" r="3.5" fill="#0d9488" />
      <circle cx="16" cy="11.5" r="1.4" fill="#fff" />
    </BlockIconFrame>
  );
}

function BlockIconNotice(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="7" y="9" width="18" height="14" rx="3" fill="#fef3c7" />
      <circle cx="16" cy="14" r="2.5" fill="#fbbf24" />
      <rect x="12" y="18.5" width="8" height="1.6" rx="0.8" fill="#fcd34d" />
    </BlockIconFrame>
  );
}

function BlockIconEmergency(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <path d="M16 7 8 23h16L16 7z" fill="#fecaca" />
      <rect x="14.2" y="13" width="3.6" height="5.5" rx="0.8" fill="#ef4444" />
      <circle cx="16" cy="21" r="1.2" fill="#ef4444" />
    </BlockIconFrame>
  );
}

function BlockIconMenu(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="7" y="8" width="18" height="16" rx="3" fill="#ffedd5" />
      <rect x="10" y="12" width="8" height="1.6" rx="0.8" fill="#fdba74" />
      <rect x="10" y="16" width="12" height="1.6" rx="0.8" fill="#fdba74" opacity="0.7" />
      <rect x="10" y="20" width="9" height="1.6" rx="0.8" fill="#fdba74" opacity="0.5" />
    </BlockIconFrame>
  );
}

function BlockIconMedia(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="6" y="8" width="20" height="16" rx="3" fill="#ddd6fe" />
      <circle cx="12" cy="14" r="2.5" fill="#fff" opacity="0.9" />
      <path d="M6 22l5-4 4 3 5-4 6 5" fill="#8b5cf6" opacity="0.4" />
    </BlockIconFrame>
  );
}

function BlockIconVideo(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="6" y="9" width="16" height="14" rx="3" fill="#ddd6fe" />
      <path d="M22 13.5 28 10v12l-6-3.5v-5z" fill="#8b5cf6" />
    </BlockIconFrame>
  );
}

function BlockIconButton(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="5" y="12" width="22" height="8" rx="4" fill="#0d9488" />
      <path d="M13 16h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </BlockIconFrame>
  );
}

function BlockIconFaq(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <circle cx="16" cy="16" r="9" fill="#e0f2fe" />
      <path d="M13.5 12.5a2.5 2.5 0 0 1 4.5 1.5c0 2-3 2-3 4" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="21" r="1.2" fill="#0284c7" />
    </BlockIconFrame>
  );
}

function BlockIconSchedule(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="7" y="8" width="18" height="17" rx="3" fill="#fff" stroke="#94a3b8" strokeWidth="1.2" />
      <rect x="7" y="12" width="18" height="3" fill="#7dd3c7" />
      <rect x="10" y="17" width="5" height="1.4" rx="0.7" fill="#cbd5e1" />
      <rect x="17" y="17" width="5" height="1.4" rx="0.7" fill="#cbd5e1" />
      <rect x="10" y="21" width="5" height="1.4" rx="0.7" fill="#cbd5e1" />
    </BlockIconFrame>
  );
}

function BlockIconDivider(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="6" y="15" width="20" height="2" rx="1" fill="#cbd5e1" />
      <circle cx="10" cy="16" r="2" fill="#94a3b8" />
      <circle cx="22" cy="16" r="2" fill="#94a3b8" />
    </BlockIconFrame>
  );
}

function BlockIconSpace(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="8" y="13" width="16" height="6" rx="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="3 2" />
    </BlockIconFrame>
  );
}

function BlockIconCompare(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="6" y="9" width="9" height="14" rx="2" fill="#bae6fd" />
      <rect x="17" y="9" width="9" height="14" rx="2" fill="#7dd3c7" />
    </BlockIconFrame>
  );
}

function BlockIconKpi(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="7" y="10" width="18" height="12" rx="3" fill="#ecfdf5" />
      <text x="16" y="19" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0d9488">
        42
      </text>
    </BlockIconFrame>
  );
}

function BlockIconCrowd(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="6" y="10" width="20" height="12" rx="3" fill="#dcfce7" />
      <circle cx="12" cy="16" r="2.5" fill="#22c55e" />
      <circle cx="20" cy="16" r="2.5" fill="#fbbf24" />
      <circle cx="16" cy="16" r="2.5" fill="#86efac" />
    </BlockIconFrame>
  );
}

function BlockIconTimer(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="7" y="9" width="18" height="14" rx="3" fill="#fce7f3" />
      <rect x="10" y="13" width="12" height="4" rx="1.5" fill="#f472b6" opacity="0.5" />
      <rect x="10" y="19" width="8" height="1.6" rx="0.8" fill="#f472b6" />
    </BlockIconFrame>
  );
}

function BlockIconSocial(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <circle cx="11" cy="14" r="4" fill="#bae6fd" />
      <circle cx="21" cy="14" r="4" fill="#7dd3c7" />
      <circle cx="16" cy="20" r="4" fill="#fde68a" />
    </BlockIconFrame>
  );
}

function BlockIconChecklist(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="8" y="8" width="16" height="16" rx="3" fill="#fff" stroke="#94a3b8" strokeWidth="1.2" />
      <path d="M11 13l2 2 4-4" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="11" y="17.5" width="10" height="1.4" rx="0.7" fill="#cbd5e1" />
      <rect x="11" y="20.5" width="8" height="1.4" rx="0.7" fill="#cbd5e1" />
    </BlockIconFrame>
  );
}

function BlockIconTabs(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="6" y="11" width="8" height="4" rx="2" fill="#0d9488" />
      <rect x="15" y="11" width="8" height="4" rx="2" fill="#cbd5e1" />
      <rect x="6" y="16" width="20" height="9" rx="2" fill="#ecfdf5" />
    </BlockIconFrame>
  );
}

function BlockIconAccordion(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="7" y="9" width="18" height="5" rx="2" fill="#7dd3c7" />
      <rect x="7" y="15" width="18" height="8" rx="2" fill="#ecfdf5" />
      <path d="M21 11.5v2M21 12.5h2" stroke="#0d9488" strokeWidth="1.4" strokeLinecap="round" />
    </BlockIconFrame>
  );
}

function BlockIconParking(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="8" y="8" width="16" height="16" rx="3" fill="#e2e8f0" />
      <text x="16" y="20" textAnchor="middle" fontSize="11" fontWeight="800" fill="#475569">
        P
      </text>
    </BlockIconFrame>
  );
}

function BlockIconSpa(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <path d="M10 20c2-4 4-6 6-6s4 2 6 6" fill="none" stroke="#7dd3c7" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 22h16" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="12" r="3" fill="#bae6fd" />
    </BlockIconFrame>
  );
}

function BlockIconTaxi(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="7" y="13" width="18" height="8" rx="2" fill="#fbbf24" />
      <rect x="10" y="10" width="12" height="4" rx="1.5" fill="#fde68a" />
      <circle cx="11" cy="21" r="2" fill="#475569" />
      <circle cx="21" cy="21" r="2" fill="#475569" />
    </BlockIconFrame>
  );
}

function BlockIconLaundry(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <rect x="9" y="6" width="14" height="18" rx="3" fill="#e2e8f0" />
      <circle cx="16" cy="16" r="5" fill="none" stroke="#94a3b8" strokeWidth="1.8" />
      <circle cx="16" cy="16" r="2" fill="#7dd3c7" />
    </BlockIconFrame>
  );
}

function BlockIconIcon(props: BlockIconProps) {
  return (
    <BlockIconFrame {...props}>
      <circle cx="16" cy="16" r="8" fill="#fde68a" />
      <path d="M16 11v5l3 2" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
    </BlockIconFrame>
  );
}

const BLOCK_ICON_COMPONENTS: Partial<Record<CardType, (props: BlockIconProps) => ReactNode>> = {
  hero: BlockIconHero,
  hero_slider: BlockIconSlider,
  heading_body: BlockIconText,
  info: BlockIconInfo,
  highlight: BlockIconHighlight,
  action: BlockIconAction,
  welcome: BlockIconWelcome,
  wifi: BlockIconWifi,
  breakfast: BlockIconClock,
  breakfast_crowd: BlockIconCrowd,
  dinner_crowd: BlockIconCrowd,
  spa_crowd: BlockIconCrowd,
  checkout: BlockIconClock,
  nearby: BlockIconMap,
  notice: BlockIconNotice,
  map: BlockIconMap,
  restaurant: BlockIconMenu,
  taxi: BlockIconTaxi,
  emergency: BlockIconEmergency,
  laundry: BlockIconLaundry,
  spa: BlockIconSpa,
  text: BlockIconText,
  icon: BlockIconIcon,
  image: BlockIconMedia,
  video: BlockIconVideo,
  button: BlockIconButton,
  faq: BlockIconFaq,
  schedule: BlockIconSchedule,
  menu: BlockIconMenu,
  gallery: BlockIconMedia,
  divider: BlockIconDivider,
  parking: BlockIconParking,
  pageLinks: BlockIconAction,
  icon_shortcuts: BlockIconIcon,
  image_tiles: BlockIconMedia,
  quote: BlockIconText,
  checklist: BlockIconChecklist,
  steps: BlockIconChecklist,
  compare: BlockIconCompare,
  kpi: BlockIconKpi,
  space: BlockIconSpace,
  campaign_timer: BlockIconTimer,
  tabs_info: BlockIconTabs,
  faq_search: BlockIconFaq,
  notice_ticker: BlockIconNotice,
  coupon: BlockIconTimer,
  accordion_info: BlockIconAccordion,
  open_status: BlockIconClock,
  social_links: BlockIconSocial,
  contact_hub: BlockIconAction,
  progress_steps: BlockIconChecklist,
  emergency_banner: BlockIconEmergency,
  scheduled_banner: BlockIconNotice,
  menu_categories: BlockIconMenu,
  daily_special: BlockIconMenu,
  drink_menu: BlockIconMenu,
  combo_set_menu: BlockIconMenu,
  menu_grid: BlockIconMenu,
  menu_time_band: BlockIconMenu,
  salon_service_menu: BlockIconMenu,
  menu_sheet_sync: BlockIconMenu,
};

export function AppBlockIcon({ type, size = 20, className = "" }: { type: CardType; size?: number; className?: string }) {
  const Component = BLOCK_ICON_COMPONENTS[type] ?? BlockIconSticker;
  return <Component size={size} className={className} />;
}
