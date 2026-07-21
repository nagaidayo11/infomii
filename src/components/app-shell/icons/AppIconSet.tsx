"use client";

import type { ReactNode, SVGProps } from "react";

/** Shared deformed filled pictograms for the native app shell (Phase 6). */

export type AppIconName =
  | "home"
  | "templates"
  | "pages"
  | "plan"
  | "settings"
  | "compose"
  | "logo"
  | "empty-pages"
  | "empty-templates"
  | "onboarding-welcome"
  | "onboarding-template"
  | "onboarding-share"
  | "stickers"
  | "edit-canvas"
  | "empty-editor";

type AppIconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

function AppIconFrame({ size = 24, className = "", children, ...rest }: AppIconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={"app-icon shrink-0 " + className}
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export function AppIconHome(props: AppIconProps) {
  return (
    <AppIconFrame {...props}>
      <path
        d="M16 5.5 6 14v12.5a2 2 0 0 0 2 2h6v-7.5h4V28.5h6a2 2 0 0 0 2-2V14L16 5.5z"
        fill="#7dd3c7"
      />
      <path d="M16 8.5 9 15v9.5h4v-6h6v6h4V15l-7-6.5z" fill="#0f766e" opacity="0.18" />
      <rect x="13.5" y="18.5" width="5" height="5.5" rx="1.2" fill="#fff" opacity="0.85" />
    </AppIconFrame>
  );
}

export function AppIconTemplates(props: AppIconProps) {
  return (
    <AppIconFrame {...props}>
      <rect x="6" y="8" width="14" height="18" rx="3" fill="#bae6fd" />
      <rect x="12" y="6" width="14" height="18" rx="3" fill="#7dd3c7" />
      <rect x="9.5" y="12" width="9" height="1.8" rx="0.9" fill="#0f766e" opacity="0.35" />
      <rect x="9.5" y="16" width="7" height="1.8" rx="0.9" fill="#0f766e" opacity="0.28" />
      <rect x="15.5" y="12" width="7.5" height="1.8" rx="0.9" fill="#fff" opacity="0.7" />
      <rect x="15.5" y="16" width="5.5" height="1.8" rx="0.9" fill="#fff" opacity="0.55" />
    </AppIconFrame>
  );
}

export function AppIconPages(props: AppIconProps) {
  return (
    <AppIconFrame {...props}>
      <rect x="8" y="5" width="16" height="22" rx="3.5" fill="#fff" stroke="#94a3b8" strokeWidth="1.2" />
      <rect x="11" y="10" width="10" height="1.6" rx="0.8" fill="#cbd5e1" />
      <rect x="11" y="14" width="8" height="1.6" rx="0.8" fill="#cbd5e1" />
      <rect x="11" y="18" width="9" height="1.6" rx="0.8" fill="#cbd5e1" />
      <circle cx="22" cy="22" r="6" fill="#0d9488" />
      <path d="M20 22h4M22 20v4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </AppIconFrame>
  );
}

export function AppIconPlan(props: AppIconProps) {
  return (
    <AppIconFrame {...props}>
      <circle cx="16" cy="16" r="10" fill="#fde68a" />
      <circle cx="16" cy="16" r="7" fill="#fbbf24" />
      <path
        d="M16 10.5c-2.2 0-4 1.4-4 3.2 0 2.4 4 5.8 4 5.8s4-3.4 4-5.8c0-1.8-1.8-3.2-4-3.2z"
        fill="#fff"
        opacity="0.9"
      />
      <circle cx="16" cy="13.6" r="1.3" fill="#d97706" />
    </AppIconFrame>
  );
}

export function AppIconSettings(props: AppIconProps) {
  return (
    <AppIconFrame {...props}>
      <circle cx="16" cy="16" r="4.2" fill="#94a3b8" />
      <path
        d="M16 6.5a1.8 1.8 0 0 0 1.7 1.2l1.1.2a1.8 1.8 0 0 1 1 3l-.9.6a1.8 1.8 0 0 0 0 2l.9.6a1.8 1.8 0 0 1-1 3l-1.1.2A1.8 1.8 0 0 0 16 18.5a1.8 1.8 0 0 0-1.7-1.2l-1.1-.2a1.8 1.8 0 0 1-1-3l.9-.6a1.8 1.8 0 0 0 0-2l-.9-.6a1.8 1.8 0 0 1 1-3l1.1-.2A1.8 1.8 0 0 0 16 6.5z"
        fill="#cbd5e1"
      />
    </AppIconFrame>
  );
}

export function AppIconCompose(props: AppIconProps) {
  return (
    <AppIconFrame {...props}>
      <rect x="7" y="9" width="18" height="16" rx="3.5" fill="#fff" opacity="0.95" />
      <rect x="10" y="13" width="10" height="1.6" rx="0.8" fill="#99f6e4" />
      <rect x="10" y="17" width="7" height="1.6" rx="0.8" fill="#99f6e4" />
      <path
        d="M21 8.5l2.5 2.5-8.5 8.5-3.2.7.7-3.2 8.5-8.5z"
        fill="#0d9488"
      />
      <path d="M19.5 10 22 12.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
    </AppIconFrame>
  );
}

export function AppIconLogo(props: AppIconProps) {
  return (
    <AppIconFrame {...props}>
      <rect x="5" y="5" width="22" height="22" rx="7" fill="#0d9488" />
      <path
        d="M11 21V11.5c0-1.2 1-2.2 2.2-2.2h7.6c1.2 0 2.2 1 2.2 2.2V21"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M11 16h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
      <circle cx="16" cy="12.2" r="1.4" fill="#fff" />
    </AppIconFrame>
  );
}

export function AppIconEmptyPages(props: AppIconProps) {
  return (
    <AppIconFrame size={56} {...props}>
      <rect x="8" y="6" width="16" height="20" rx="3" fill="#fff" stroke="#cbd5e1" strokeWidth="1.4" />
      <rect x="11" y="11" width="10" height="1.8" rx="0.9" fill="#e2e8f0" />
      <rect x="11" y="15.5" width="7.5" height="1.8" rx="0.9" fill="#e2e8f0" />
      <rect x="11" y="20" width="9" height="1.8" rx="0.9" fill="#e2e8f0" />
      <circle cx="23" cy="21" r="7" fill="#ecfdf5" stroke="#7dd3c7" strokeWidth="1.4" />
      <path d="M21 21h4M23 19v4" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" />
    </AppIconFrame>
  );
}

export function AppIconEmptyTemplates(props: AppIconProps) {
  return (
    <AppIconFrame size={56} {...props}>
      <rect x="5" y="9" width="13" height="17" rx="2.8" fill="#e0f2fe" />
      <rect x="11" y="6" width="13" height="17" rx="2.8" fill="#ccfbf1" />
      <rect x="17" y="9" width="10" height="14" rx="2.8" fill="#fff" stroke="#94a3b8" strokeWidth="1.2" />
      <rect x="19.5" y="13" width="5.5" height="1.4" rx="0.7" fill="#cbd5e1" />
      <rect x="19.5" y="16.5" width="4" height="1.4" rx="0.7" fill="#cbd5e1" />
    </AppIconFrame>
  );
}

export function AppIconOnboardingWelcome(props: AppIconProps) {
  return (
    <AppIconFrame size={64} {...props}>
      <circle cx="16" cy="24" r="9" fill="#fde68a" />
      <path d="M16 14c-3.5 0-6 2.4-6 5.5 0 4.5 6 9 6 9s6-4.5 6-9c0-3.1-2.5-5.5-6-5.5z" fill="#f472b6" opacity="0.35" />
      <rect x="20" y="8" width="12" height="16" rx="3" fill="#fff" stroke="#7dd3c7" strokeWidth="1.4" />
      <rect x="23" y="12" width="6" height="1.4" rx="0.7" fill="#99f6e4" />
      <rect x="23" y="15.5" width="4.5" height="1.4" rx="0.7" fill="#99f6e4" />
      <path
        d="M12 10c.8 1.6 2.4 2.6 4.2 2.6"
        fill="none"
        stroke="#0d9488"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </AppIconFrame>
  );
}

export function AppIconOnboardingTemplate(props: AppIconProps) {
  return (
    <AppIconFrame size={64} {...props}>
      <rect x="6" y="10" width="14" height="18" rx="3" fill="#bae6fd" />
      <rect x="12" y="7" width="14" height="18" rx="3" fill="#7dd3c7" />
      <circle cx="24" cy="9" r="4.5" fill="#fbbf24" />
      <path d="M22.5 9h3M24 7.5v3" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="15" y="13" width="8" height="1.6" rx="0.8" fill="#fff" opacity="0.75" />
      <rect x="15" y="17" width="6" height="1.6" rx="0.8" fill="#fff" opacity="0.55" />
    </AppIconFrame>
  );
}

export function AppIconStickers(props: AppIconProps) {
  return (
    <AppIconFrame {...props}>
      <rect x="6" y="7" width="9" height="9" rx="2.2" fill="#7dd3c7" />
      <rect x="17" y="7" width="9" height="9" rx="2.2" fill="#bae6fd" />
      <rect x="6" y="18" width="9" height="9" rx="2.2" fill="#fde68a" />
      <rect x="17" y="18" width="9" height="9" rx="2.2" fill="#f472b6" opacity="0.55" />
      <path d="M21 18 26 23" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
    </AppIconFrame>
  );
}

export function AppIconEditCanvas(props: AppIconProps) {
  return (
    <AppIconFrame {...props}>
      <rect x="9" y="5" width="14" height="22" rx="3.5" fill="#fff" stroke="#94a3b8" strokeWidth="1.2" />
      <rect x="12" y="10" width="8" height="1.6" rx="0.8" fill="#99f6e4" />
      <rect x="12" y="14" width="6" height="1.6" rx="0.8" fill="#cbd5e1" />
      <path d="M20 8.5 23 11.5 18 16.5 15 17l1-3 4-5.5z" fill="#0d9488" />
    </AppIconFrame>
  );
}

export function AppIconEmptyEditor(props: AppIconProps) {
  return (
    <AppIconFrame size={56} {...props}>
      <rect x="10" y="6" width="12" height="20" rx="3" fill="#fff" stroke="#cbd5e1" strokeWidth="1.4" />
      <rect x="13" y="11" width="6" height="1.6" rx="0.8" fill="#e2e8f0" />
      <rect x="13" y="15" width="4.5" height="1.6" rx="0.8" fill="#e2e8f0" />
      <rect x="18" y="14" width="8" height="8" rx="2" fill="#7dd3c7" />
      <path d="M20.5 18h3M22 16.5v3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </AppIconFrame>
  );
}

export function AppIconOnboardingShare(props: AppIconProps) {
  return (
    <AppIconFrame size={64} {...props}>
      <path
        d="M8 22c3-4 7-6 12-4.5 1.8.6 3.4 2 4.5 3.8"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="22" cy="10" r="5.5" fill="#0d9488" />
      <path d="M20 10h4M22 8v4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="6" y="20" width="11" height="8" rx="2" fill="#fff" stroke="#7dd3c7" strokeWidth="1.4" />
      <rect x="8.5" y="23" width="6" height="1.2" rx="0.6" fill="#99f6e4" />
    </AppIconFrame>
  );
}

const ICON_MAP = {
  home: AppIconHome,
  templates: AppIconTemplates,
  pages: AppIconPages,
  plan: AppIconPlan,
  settings: AppIconSettings,
  compose: AppIconCompose,
  logo: AppIconLogo,
  "empty-pages": AppIconEmptyPages,
  "empty-templates": AppIconEmptyTemplates,
  "onboarding-welcome": AppIconOnboardingWelcome,
  "onboarding-template": AppIconOnboardingTemplate,
  "onboarding-share": AppIconOnboardingShare,
  stickers: AppIconStickers,
  "edit-canvas": AppIconEditCanvas,
  "empty-editor": AppIconEmptyEditor,
} as const;

export function AppIcon({ name, size = 24, className = "" }: { name: AppIconName; size?: number; className?: string }) {
  const Component = ICON_MAP[name];
  return <Component size={size} className={className} />;
}

/** Tab bar icons (24px). */
export const APP_TAB_ICON_COMPONENTS: Record<
  "home" | "templates" | "works" | "plan" | "settings",
  (props: AppIconProps) => ReactNode
> = {
  home: AppIconHome,
  templates: AppIconTemplates,
  works: AppIconPages,
  plan: AppIconPlan,
  settings: AppIconSettings,
};
