import type { ReactNode, SVGProps } from "react";

/** SNS platform keys for SocialLinksCard (icons are original glyphs, not official brand assets). */
export type SocialPlatform =
  | "instagram"
  | "x"
  | "line"
  | "youtube"
  | "facebook"
  | "tiktok"
  | "other";

export const SOCIAL_PLATFORM_OPTIONS: Array<{ value: SocialPlatform; label: string }> = [
  { value: "instagram", label: "Instagram" },
  { value: "x", label: "X" },
  { value: "line", label: "LINE" },
  { value: "youtube", label: "YouTube" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "other", label: "その他" },
];

const PLATFORM_SET = new Set<string>(SOCIAL_PLATFORM_OPTIONS.map((o) => o.value));

export function isSocialPlatform(value: unknown): value is SocialPlatform {
  return typeof value === "string" && PLATFORM_SET.has(value);
}

export function defaultLabelForPlatform(platform: SocialPlatform): string {
  return SOCIAL_PLATFORM_OPTIONS.find((o) => o.value === platform)?.label ?? "SNS";
}

/** Infer platform from free text when `platform` is missing (legacy items). */
export function resolveSocialPlatform(input: {
  platform?: unknown;
  label?: unknown;
  href?: unknown;
  handle?: unknown;
}): SocialPlatform {
  if (isSocialPlatform(input.platform)) return input.platform;
  const blob = [input.label, input.href, input.handle]
    .map((v) => (typeof v === "string" ? v : ""))
    .join(" ")
    .toLowerCase();
  if (/instagram|instagr\.am|\big\b/.test(blob)) return "instagram";
  if (/youtube|youtu\.be/.test(blob)) return "youtube";
  if (/facebook|fb\.com|fb\.me/.test(blob)) return "facebook";
  if (/tiktok|douyin/.test(blob)) return "tiktok";
  if (/line\.me|line\.naver|\bline\b/.test(blob)) return "line";
  if (/(^|[^a-z])x([^a-z]|$)|twitter|t\.co\b/.test(blob)) return "x";
  return "other";
}

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function BaseIcon({ size = 22, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Brand-like but original glyphs (not official trademarked logo files). */
export function SocialPlatformIcon({
  platform,
  size = 22,
  className,
}: {
  platform: SocialPlatform;
  size?: number;
  className?: string;
}) {
  switch (platform) {
    case "instagram":
      return (
        <BaseIcon size={size} className={className}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.75" />
          <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.75" />
          <circle cx="17.2" cy="6.9" r="1.15" fill="currentColor" />
        </BaseIcon>
      );
    case "x":
      return (
        <BaseIcon size={size} className={className}>
          <path
            d="M5 5l6.2 7.3L5.4 19H7.7l4.6-5.4L16.8 19H19l-6.4-7.5L18.5 5h-2.3l-4.3 5L7.2 5H5z"
            fill="currentColor"
          />
        </BaseIcon>
      );
    case "line":
      return (
        <BaseIcon size={size} className={className}>
          <path
            d="M12 3.8c-4.7 0-8.5 3.1-8.5 6.9 0 3.1 2.5 5.7 6 6.6.2 0 .4.1.4.3l-.1 1.7c0 .3.3.5.5.4 1.5-.7 2.6-1.2 3.7-2 .3-.2.5-.2.8-.2 4.5 0 8.2-3 8.2-6.8S16.7 3.8 12 3.8z"
            fill="currentColor"
          />
        </BaseIcon>
      );
    case "youtube":
      return (
        <BaseIcon size={size} className={className}>
          <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" stroke="currentColor" strokeWidth="1.75" />
          <path d="M10.2 9.2v5.6L15.4 12l-5.2-2.8z" fill="currentColor" />
        </BaseIcon>
      );
    case "facebook":
      return (
        <BaseIcon size={size} className={className}>
          <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M13.2 18.2v-5.3h1.8l.3-2.1h-2.1V9.6c0-.6.2-1.1 1.1-1.1h1.1V6.6c-.2 0-.9-.1-1.8-.1-1.8 0-3 1.1-3 3.1v1.2H8.7v2.1h2v5.3h2.5z"
            fill="currentColor"
          />
        </BaseIcon>
      );
    case "tiktok":
      return (
        <BaseIcon size={size} className={className}>
          <path
            d="M14.2 4.2v8.1c0 2.3-1.8 4.2-4.1 4.2S6 14.6 6 12.3c0-2.2 1.7-4 3.9-4.2v2.2c-1 .1-1.8 1-1.8 2 0 1.1.9 2 2 2s2-.9 2-2V4.2h2.1z"
            fill="currentColor"
          />
          <path
            d="M14.2 4.2c.5 2.1 2.1 3.7 4.2 4.1V10c-1.6-.2-3-.9-4.2-2v-3.8z"
            fill="currentColor"
            opacity="0.85"
          />
        </BaseIcon>
      );
    default:
      return (
        <BaseIcon size={size} className={className}>
          <path
            d="M10.2 13.8a3.6 3.6 0 010-5.1l1.6-1.6a3.6 3.6 0 015.1 5.1l-.8.8"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M13.8 10.2a3.6 3.6 0 010 5.1l-1.6 1.6a3.6 3.6 0 01-5.1-5.1l.8-.8"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </BaseIcon>
      );
  }
}

export function socialPlatformTintClass(platform: SocialPlatform): string {
  switch (platform) {
    case "instagram":
      return "text-[#E1306C]";
    case "x":
      return "text-slate-900";
    case "line":
      return "text-[#06C755]";
    case "youtube":
      return "text-[#FF0000]";
    case "facebook":
      return "text-[#1877F2]";
    case "tiktok":
      return "text-slate-900";
    default:
      return "text-slate-600";
  }
}
