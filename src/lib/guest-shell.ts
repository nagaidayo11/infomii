/**
 * Facility-wide / page-level guest shell (bottom tabs).
 * Stored on hotels.guest_shell or pages.guest_shell jsonb.
 */

import {
  getLocalizedContent,
  type LocalizedContent,
  type LocalizedString,
  type SupportedLocale,
} from "@/lib/localized-content";

export type GuestShellTabType = "home" | "phone" | "page" | "locale";

export type GuestShellTab = {
  id: string;
  type: GuestShellTabType;
  /** Plain string (legacy) or { ja, en, zh, ko } for Business multilingual. */
  label: LocalizedString;
  enabled: boolean;
  /** Target page slug for home / page tabs */
  pageSlug?: string | null;
  /** Phone number for phone tabs (digits / + / - / spaces) */
  phone?: string | null;
};

export type GuestShellConfig = {
  /** When false, bottom tabs are hidden (default for existing hotels). */
  enabled: boolean;
  tabs: GuestShellTab[];
};

const DEFAULT_LABELS: Record<GuestShellTabType, LocalizedContent> = {
  home: { ja: "ホーム", en: "Home", zh: "首页", ko: "홈" },
  phone: { ja: "フロント", en: "Front desk", zh: "前台", ko: "프론트" },
  page: { ja: "FAQ", en: "FAQ", zh: "FAQ", ko: "FAQ" },
  locale: { ja: "言語", en: "Language", zh: "语言", ko: "언어" },
};

export const DEFAULT_GUEST_SHELL_TABS: GuestShellTab[] = [
  { id: "home", type: "home", label: { ...DEFAULT_LABELS.home }, enabled: true, pageSlug: null },
  { id: "front", type: "phone", label: { ...DEFAULT_LABELS.phone }, enabled: true, phone: null },
  { id: "faq", type: "page", label: { ...DEFAULT_LABELS.page }, enabled: true, pageSlug: null },
  { id: "lang", type: "locale", label: { ...DEFAULT_LABELS.locale }, enabled: true },
];

/** Run once in Supabase SQL Editor if guest_shell column is missing. */
export const GUEST_SHELL_MIGRATION_SQL = `alter table public.hotels
add column if not exists guest_shell jsonb not null default '{}'::jsonb;`;

export function createDefaultGuestShellConfig(): GuestShellConfig {
  return {
    enabled: false,
    tabs: DEFAULT_GUEST_SHELL_TABS.map((tab) => ({
      ...tab,
      label:
        typeof tab.label === "object" && tab.label
          ? { ...tab.label }
          : tab.label,
    })),
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function normalizeTabType(value: unknown): GuestShellTabType | null {
  if (value === "home" || value === "phone" || value === "page" || value === "locale") return value;
  return null;
}

function defaultLabelForType(type: GuestShellTabType): LocalizedContent {
  return { ...DEFAULT_LABELS[type] };
}

/** Parse label: string (legacy) or localized object. */
export function normalizeGuestShellLabel(
  raw: unknown,
  type: GuestShellTabType,
): LocalizedString {
  if (typeof raw === "string" && raw.trim()) {
    const ja = raw.trim().slice(0, 20);
    const defaults = DEFAULT_LABELS[type];
    // If it matches the default Japanese label, upgrade to full i18n defaults.
    if (ja === defaults.ja) return { ...defaults };
    return ja;
  }
  const obj = asRecord(raw);
  if (!obj) return defaultLabelForType(type);

  const pick = (key: keyof LocalizedContent): string | undefined => {
    const v = obj[key];
    return typeof v === "string" && v.trim() ? v.trim().slice(0, 20) : undefined;
  };
  const ja = pick("ja");
  const en = pick("en");
  const zh = pick("zh");
  const ko = pick("ko");
  if (!ja && !en && !zh && !ko) return defaultLabelForType(type);

  const localized: LocalizedContent = {};
  if (ja) localized.ja = ja;
  if (en) localized.en = en;
  if (zh) localized.zh = zh;
  if (ko) localized.ko = ko;

  // Upgrade bare default JA-only to full defaults when other langs missing.
  if (ja && ja === DEFAULT_LABELS[type].ja && !en && !zh && !ko) {
    return { ...DEFAULT_LABELS[type] };
  }
  return localized;
}

export function getGuestShellTabLabel(
  tab: Pick<GuestShellTab, "label" | "type">,
  locale: SupportedLocale | string,
): string {
  const text = getLocalizedContent(tab.label, locale);
  if (text) return text;
  return getLocalizedContent(DEFAULT_LABELS[tab.type], locale) || DEFAULT_LABELS[tab.type].ja || "";
}

/** Japanese display value for editor inputs. */
export function getGuestShellLabelJa(label: LocalizedString): string {
  return getLocalizedContent(label, "ja");
}

/** Write Japanese label while preserving other locales when possible. */
export function writeGuestShellLabelJa(
  prev: LocalizedString | undefined,
  ja: string,
): LocalizedString {
  const trimmed = ja.trim().slice(0, 20);
  if (typeof prev === "object" && prev) {
    return { ...prev, ja: trimmed };
  }
  return trimmed;
}

/** True when Business should fill missing en/zh/ko via translate API. */
export function guestShellLabelNeedsTranslation(label: LocalizedString): boolean {
  const ja = getLocalizedContent(label, "ja").trim();
  if (ja.length < 1) return false;
  if (typeof label === "string") return true;
  const en = typeof label.en === "string" ? label.en.trim() : "";
  const zh = typeof label.zh === "string" ? label.zh.trim() : "";
  const ko = typeof label.ko === "string" ? label.ko.trim() : "";
  return !en || !zh || !ko;
}

function normalizeTab(raw: unknown, index: number): GuestShellTab | null {
  const obj = asRecord(raw);
  if (!obj) return null;
  const type = normalizeTabType(obj.type);
  if (!type) return null;
  const id =
    typeof obj.id === "string" && obj.id.trim()
      ? obj.id.trim()
      : `${type}-${index}`;
  const label = normalizeGuestShellLabel(obj.label, type);
  const enabled = obj.enabled !== false;
  const pageSlug =
    typeof obj.pageSlug === "string" && obj.pageSlug.trim()
      ? obj.pageSlug.trim()
      : null;
  const phone =
    typeof obj.phone === "string" && obj.phone.trim()
      ? obj.phone.trim().slice(0, 40)
      : null;
  return { id, type, label, enabled, pageSlug, phone };
}

/** Parse DB jsonb into a safe config. Missing/invalid → defaults (disabled). */
export function parseGuestShellConfig(raw: unknown): GuestShellConfig {
  const defaults = createDefaultGuestShellConfig();
  const obj = asRecord(raw);
  if (!obj) return defaults;

  const enabled = obj.enabled === true;
  const rawTabs = Array.isArray(obj.tabs) ? obj.tabs : null;
  if (!rawTabs || rawTabs.length === 0) {
    return { enabled, tabs: defaults.tabs };
  }

  const tabs = rawTabs
    .map((tab, index) => normalizeTab(tab, index))
    .filter((tab): tab is GuestShellTab => Boolean(tab))
    .slice(0, 5);

  if (tabs.length === 0) {
    return { enabled, tabs: defaults.tabs };
  }

  return { enabled, tabs };
}

/** Tabs visible on guest UI (enabled + plan rules). */
export function resolveVisibleGuestShellTabs(
  config: GuestShellConfig,
  opts: { businessFeaturesEnabled: boolean },
): GuestShellTab[] {
  if (!config.enabled) return [];
  return config.tabs.filter((tab) => {
    if (!tab.enabled) return false;
    if (tab.type === "locale" && !opts.businessFeaturesEnabled) return false;
    return true;
  });
}

export function toTelHref(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/[^\d+]/g, "");
  if (digits.replace(/\D/g, "").length < 3) return null;
  return `tel:${digits}`;
}

export function buildGuestPagePath(
  slug: string,
  opts?: { preview?: boolean; clientApp?: boolean; lang?: string | null },
): string {
  const params = new URLSearchParams();
  if (opts?.preview) params.set("preview", "1");
  if (opts?.clientApp) params.set("client", "app");
  if (opts?.lang) params.set("lang", opts.lang);
  const qs = params.toString();
  return qs ? `/v/${encodeURIComponent(slug)}?${qs}` : `/v/${encodeURIComponent(slug)}`;
}
