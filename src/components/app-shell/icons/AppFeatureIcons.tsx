"use client";

import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Frame({ size = 24, className = "", children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={"app-feature-icon shrink-0 " + className}
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export function AppFeatureIconAnalytics(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="5" y="18" width="5" height="8" rx="1.5" fill="#bae6fd" />
      <rect x="13.5" y="12" width="5" height="14" rx="1.5" fill="#7dd3c7" />
      <rect x="22" y="8" width="5" height="18" rx="1.5" fill="#fde68a" />
      <path d="M7 10h18" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
    </Frame>
  );
}

export function AppFeatureIconViewsTotal(props: IconProps) {
  return (
    <Frame {...props}>
      <circle cx="16" cy="16" r="10" fill="#bae6fd" />
      <path d="M11 16h10M16 11v10" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      <circle cx="16" cy="16" r="4" fill="#fff" />
      <path d="M14 16h4" stroke="#0d9488" strokeWidth="1.6" strokeLinecap="round" />
    </Frame>
  );
}

export function AppFeatureIconViewsToday(props: IconProps) {
  return (
    <Frame {...props}>
      <circle cx="16" cy="16" r="9" fill="#fde68a" />
      <circle cx="16" cy="16" r="5" fill="#fbbf24" />
      <path d="M16 12v4l2.5 2.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </Frame>
  );
}

export function AppFeatureIconViewsWeek(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="7" y="8" width="18" height="17" rx="3" fill="#fff" stroke="#cbd5e1" strokeWidth="1.2" />
      <rect x="7" y="8" width="18" height="5" rx="3" fill="#7dd3c7" />
      <rect x="11" y="16" width="3" height="3" rx="0.8" fill="#bae6fd" />
      <rect x="16" y="16" width="3" height="3" rx="0.8" fill="#fde68a" />
      <rect x="21" y="16" width="3" height="3" rx="0.8" fill="#bae6fd" />
    </Frame>
  );
}

export function AppFeatureIconQr(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="7" y="7" width="8" height="8" rx="1.5" fill="#0f766e" />
      <rect x="17" y="7" width="8" height="8" rx="1.5" fill="#7dd3c7" />
      <rect x="7" y="17" width="8" height="8" rx="1.5" fill="#7dd3c7" />
      <rect x="18" y="18" width="3" height="3" rx="0.6" fill="#0f766e" />
      <rect x="22" y="18" width="3" height="3" rx="0.6" fill="#0f766e" />
      <rect x="18" y="22" width="3" height="3" rx="0.6" fill="#0f766e" />
    </Frame>
  );
}

export function AppFeatureIconDailyChart(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="6" y="6" width="20" height="20" rx="4" fill="#ecfdf5" stroke="#7dd3c7" strokeWidth="1.2" />
      <path d="M10 21 14 15l4 3 4-7" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

export function AppFeatureIconCountry(props: IconProps) {
  return (
    <Frame {...props}>
      <circle cx="16" cy="16" r="10" fill="#bae6fd" />
      <ellipse cx="16" cy="16" rx="10" ry="4" fill="none" stroke="#0d9488" strokeWidth="1.2" opacity="0.45" />
      <path d="M16 6v20M6 16h20" stroke="#0d9488" strokeWidth="1.2" opacity="0.35" />
    </Frame>
  );
}

export function AppFeatureIconLanguage(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="6" y="9" width="20" height="14" rx="3" fill="#fff" stroke="#cbd5e1" strokeWidth="1.2" />
      <text x="16" y="19" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0d9488">
        Aa
      </text>
    </Frame>
  );
}

export function AppFeatureIconTopPages(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="8" y="6" width="14" height="18" rx="2.5" fill="#fff" stroke="#cbd5e1" strokeWidth="1.2" />
      <rect x="11" y="10" width="8" height="1.4" rx="0.7" fill="#7dd3c7" />
      <rect x="11" y="14" width="6" height="1.4" rx="0.7" fill="#cbd5e1" />
      <circle cx="22" cy="22" r="5" fill="#fde68a" />
      <text x="22" y="24" textAnchor="middle" fontSize="8" fontWeight="800" fill="#b45309">
        1
      </text>
    </Frame>
  );
}

export function AppFeatureIconTeam(props: IconProps) {
  return (
    <Frame {...props}>
      <circle cx="11" cy="13" r="4" fill="#bae6fd" />
      <circle cx="21" cy="13" r="4" fill="#7dd3c7" />
      <path d="M5 24c1-3 3.5-5 6-5s5 2 6 5M15 24c1-3 3.5-5 6-5s5 2 6 5" fill="#cbd5e1" />
    </Frame>
  );
}

export function AppFeatureIconMembers(props: IconProps) {
  return (
    <Frame {...props}>
      <circle cx="16" cy="11" r="5" fill="#fde68a" />
      <path d="M8 25c1.5-5 4.5-7.5 8-7.5s6.5 2.5 8 7.5" fill="#7dd3c7" />
    </Frame>
  );
}

export function AppFeatureIconApproval(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="7" y="8" width="18" height="18" rx="4" fill="#ecfdf5" stroke="#7dd3c7" strokeWidth="1.2" />
      <path d="M12 16.5 15 19.5 21 13" fill="none" stroke="#0d9488" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {props.size && props.size >= 28 ? (
        <circle cx="23" cy="10" r="4" fill="#f87171" />
      ) : null}
    </Frame>
  );
}

export function AppFeatureIconInvite(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="8" y="10" width="16" height="12" rx="2.5" fill="#bae6fd" />
      <path d="M8 13h16" stroke="#0d9488" strokeWidth="1.4" opacity="0.35" />
      <rect x="12" y="16" width="8" height="2" rx="1" fill="#fff" opacity="0.85" />
      <circle cx="22" cy="11" r="4" fill="#7dd3c7" />
      <path d="M22 9v4M20 11h4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
    </Frame>
  );
}

export function AppFeatureIconJoin(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M12 8h8v16H12V8z" fill="#cbd5e1" />
      <path d="M20 16h8M24 13l3 3-3 3" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

export function AppFeatureIconAudit(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="8" y="6" width="16" height="20" rx="2.5" fill="#fff" stroke="#cbd5e1" strokeWidth="1.2" />
      <rect x="11" y="11" width="10" height="1.4" rx="0.7" fill="#7dd3c7" />
      <rect x="11" y="15.5" width="7" height="1.4" rx="0.7" fill="#cbd5e1" />
      <rect x="11" y="20" width="9" height="1.4" rx="0.7" fill="#cbd5e1" />
      <circle cx="22" cy="22" r="5" fill="#fde68a" />
    </Frame>
  );
}

export function AppFeatureIconBusinessLock(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="9" y="14" width="14" height="11" rx="2.5" fill="#fde68a" />
      <path d="M12 14v-3a4 4 0 0 1 8 0v3" fill="none" stroke="#b45309" strokeWidth="2" />
      <circle cx="16" cy="19.5" r="2" fill="#fff" />
    </Frame>
  );
}
