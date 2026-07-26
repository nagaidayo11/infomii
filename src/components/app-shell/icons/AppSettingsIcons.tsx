"use client";

import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Frame({ size = 24, className = "", children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={"app-settings-icon shrink-0 " + className}
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export function AppSettingsIconFacility(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="7" y="12" width="18" height="14" rx="2.5" fill="#bae6fd" />
      <path d="M16 6 6 13v13h20V13L16 6z" fill="#7dd3c7" />
      <rect x="13" y="18" width="6" height="8" rx="1.2" fill="#fff" opacity="0.9" />
      <rect x="10" y="15" width="3" height="3" rx="0.8" fill="#fff" opacity="0.75" />
      <rect x="19" y="15" width="3" height="3" rx="0.8" fill="#fff" opacity="0.75" />
    </Frame>
  );
}

export function AppSettingsIconProfile(props: IconProps) {
  return (
    <Frame {...props}>
      <circle cx="16" cy="12" r="5.5" fill="#fde68a" />
      <path d="M8 26c1.2-4.8 5-7.5 8-7.5s6.8 2.7 8 7.5" fill="#7dd3c7" />
      <circle cx="16" cy="12" r="3" fill="#fff" opacity="0.55" />
    </Frame>
  );
}

export function AppSettingsIconAccount(props: IconProps) {
  return (
    <Frame {...props}>
      <circle cx="11" cy="16" r="6" fill="#cbd5e1" />
      <circle cx="21" cy="16" r="6" fill="#7dd3c7" />
      <path
        d="M14.5 16h3M16 14.5v3"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="21" cy="16" r="2.2" fill="#fff" />
    </Frame>
  );
}

export function AppSettingsIconEmail(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="5.5" y="9" width="21" height="14" rx="2.5" fill="#fff" stroke="#64748b" strokeWidth="1.5" />
      <path
        d="M7 11.25 16 17.5 25 11.25"
        fill="none"
        stroke="#64748b"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Frame>
  );
}

export function AppSettingsIconGoogle(props: IconProps) {
  return (
    <Frame {...props}>
      <g transform="translate(7 7)">
        <path
          fill="#4285F4"
          d="M17.64 9.2045c0-.6382-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2582h2.9086c1.7018-1.5668 2.6837-3.8741 2.6837-6.6155z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.4673-.8068 5.9564-2.1791l-2.9086-2.2582c-.8068.5409-1.8409.8591-3.0478.8591-2.3441 0-4.3282-1.5832-5.0364-3.7105H.9573v2.3318C2.4382 15.9845 5.4818 18 9 18z"
        />
        <path
          fill="#FBBC05"
          d="M3.9636 10.7113c-.18-.5409-.2836-1.1186-.2836-1.7113s.1036-1.1705.2836-1.7113V4.9568H.9573C.3477 6.1718 0 7.5445 0 9s.3477 2.8282.9573 4.0432l3.0063-2.3319z"
        />
        <path
          fill="#EA4335"
          d="M9 3.5782c1.3214 0 2.5077.4541 3.4405 1.3459l2.5813-2.5813C13.4632.8918 11.4268 0 9 0 5.4818 0 2.4382 2.0155.9573 4.9568l3.0063 2.3319C4.6718 5.1614 6.6559 3.5782 9 3.5782z"
        />
      </g>
    </Frame>
  );
}

export function AppSettingsIconNotifications(props: IconProps) {
  return (
    <Frame {...props}>
      <path
        d="M16 6.5c-3.2 0-5.5 2.4-5.5 5.8v4.2l-2 2.5h15l-2-2.5v-4.2c0-3.4-2.3-5.8-5.5-5.8z"
        fill="#fde68a"
      />
      <rect x="13" y="22.5" width="6" height="2.5" rx="1.2" fill="#fbbf24" />
      <circle cx="22" cy="9" r="3" fill="#f87171" />
    </Frame>
  );
}

export function AppSettingsIconRestore(props: IconProps) {
  return (
    <Frame {...props}>
      <circle cx="16" cy="16" r="9" fill="#bae6fd" />
      <path
        d="M11 16a5 5 0 0 1 8.2-3.8"
        fill="none"
        stroke="#0d9488"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M19 9.5v4h-4" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

export function AppSettingsIconSupport(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="6" y="9" width="20" height="14" rx="3" fill="#ecfdf5" stroke="#7dd3c7" strokeWidth="1.2" />
      <path d="M10 14h12M10 18h8" stroke="#0d9488" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="23" cy="11" r="4" fill="#7dd3c7" />
      <path d="M23 10v2M23 14h.01" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
    </Frame>
  );
}

export function AppSettingsIconLegal(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="9" y="6" width="14" height="20" rx="2.5" fill="#fff" stroke="#cbd5e1" strokeWidth="1.2" />
      <rect x="12" y="11" width="8" height="1.4" rx="0.7" fill="#94a3b8" />
      <rect x="12" y="15" width="6" height="1.4" rx="0.7" fill="#cbd5e1" />
      <rect x="12" y="19" width="7" height="1.4" rx="0.7" fill="#cbd5e1" />
      <circle cx="22" cy="22" r="5" fill="#7dd3c7" />
      <path d="M20.5 22h3M22 20.5v3" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
    </Frame>
  );
}

export function AppSettingsIconSignOut(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="7" y="8" width="12" height="16" rx="2.5" fill="#fecdd3" />
      <path d="M17 16h8M21 13l3 3-3 3" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="10" y="14" width="4" height="4" rx="1" fill="#fff" opacity="0.85" />
    </Frame>
  );
}

export function AppSettingsIconDelete(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="10" y="12" width="12" height="14" rx="2" fill="#fecdd3" />
      <path d="M12 12V10a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" fill="none" stroke="#e11d48" strokeWidth="1.6" />
      <rect x="8" y="12" width="16" height="2" rx="1" fill="#f87171" />
      <rect x="14" y="16" width="1.6" height="6" rx="0.8" fill="#fff" opacity="0.8" />
      <rect x="18" y="16" width="1.6" height="6" rx="0.8" fill="#fff" opacity="0.8" />
    </Frame>
  );
}

export function AppSettingsIconPlanFree(props: IconProps) {
  return (
    <Frame {...props}>
      <circle cx="16" cy="16" r="10" fill="#e2e8f0" />
      <path d="M16 10v12M10 16h12" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <circle cx="16" cy="16" r="4" fill="#fff" />
    </Frame>
  );
}

export function AppSettingsIconPlanPro(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M16 5.5 19.5 13H28l-7 5.5 2.5 8.5L16 22l-7.5 5 2.5-8.5L3 13h8.5L16 5.5z" fill="#fde68a" />
      <path d="M16 9l2 5.5h5.5l-4.5 3.5 1.5 5.5L16 19l-4.5 4.5 1.5-5.5L8.5 14.5H14L16 9z" fill="#fbbf24" opacity="0.55" />
    </Frame>
  );
}

export function AppSettingsIconPlanBusiness(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="8" y="14" width="16" height="11" rx="2" fill="#7dd3c7" />
      <path d="M12 14V11a4 4 0 0 1 8 0v3" fill="none" stroke="#0f766e" strokeWidth="2" />
      <circle cx="16" cy="19.5" r="2.2" fill="#fff" />
      <rect x="14.5" y="8" width="3" height="4" rx="1" fill="#fde68a" />
    </Frame>
  );
}

export function AppSettingsIconBillingCycle(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="7" y="8" width="18" height="17" rx="3" fill="#fff" stroke="#cbd5e1" strokeWidth="1.2" />
      <rect x="7" y="8" width="18" height="5" rx="3" fill="#bae6fd" />
      <rect x="11" y="16" width="4" height="3.5" rx="1" fill="#7dd3c7" />
      <rect x="17" y="16" width="4" height="3.5" rx="1" fill="#e2e8f0" />
      <rect x="11" y="21" width="4" height="3.5" rx="1" fill="#e2e8f0" />
    </Frame>
  );
}

export function AppSettingsIconCompare(props: IconProps) {
  return (
    <Frame {...props}>
      <rect x="6" y="8" width="9" height="16" rx="2.5" fill="#bae6fd" />
      <rect x="17" y="8" width="9" height="16" rx="2.5" fill="#7dd3c7" />
      <rect x="8.5" y="12" width="5" height="1.4" rx="0.7" fill="#fff" opacity="0.7" />
      <rect x="19.5" y="12" width="5" height="1.4" rx="0.7" fill="#fff" opacity="0.7" />
    </Frame>
  );
}

export function AppSettingsIconSubscribe(props: IconProps) {
  return (
    <Frame {...props}>
      <circle cx="16" cy="16" r="10" fill="#fde68a" />
      <path d="M11 16.5l3.5 3.5 7-7" fill="none" stroke="#0d9488" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

export type AppPlanTierId = "free" | "pro" | "business";

const PLAN_TIER_ICONS: Record<AppPlanTierId, (props: IconProps) => ReactNode> = {
  free: AppSettingsIconPlanFree,
  pro: AppSettingsIconPlanPro,
  business: AppSettingsIconPlanBusiness,
};

export function AppSettingsPlanTierIcon({ tier, ...props }: IconProps & { tier: AppPlanTierId }) {
  const Icon = PLAN_TIER_ICONS[tier];
  return <Icon {...props} />;
}
