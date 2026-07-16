/**
 * Page-level live ops — shared types for congestion / status blocks.
 * Source of truth: pages.ops jsonb. Cards keep chrome (title, appearance).
 */

export const LIVE_OPS_LEVELS = ["open", "moderate", "busy", "closed"] as const;

export type LiveOpsLevel = (typeof LIVE_OPS_LEVELS)[number];

/** Shape stored under pages.ops[key]. */
export type LiveOpsStatus = {
  level: LiveOpsLevel;
  note: string;
  updatedAt: string;
  updatedBy?: string | null;
};

/** Registered live-ops keys. Add new keys here (A2+). */
export type LiveOpsKey = "breakfastCrowd" | "dinnerCrowd" | "spaCrowd";

export type LiveOpsLevelTones = {
  band: string;
  dot: string;
  text: string;
  surface: string;
  opsSelected: string;
  opsIdle: string;
};

export type LiveOpsStatusLabels = {
  ja: string;
  en: string;
  zh: string;
  ko: string;
};

export type LiveOpsDefinition = {
  key: LiveOpsKey;
  /** Card type(s) that display this ops status. */
  cardTypes: readonly string[];
  levels: readonly LiveOpsLevel[];
  /** Short JA labels for editor / Quick Ops buttons. */
  editorLabels: Record<LiveOpsLevel, string>;
  /** Guest-facing status copy (level enum itself stays untranslated). */
  statusLabels: Record<LiveOpsLevel, LiveOpsStatusLabels>;
  levelTones: Record<LiveOpsLevel, LiveOpsLevelTones>;
  defaultTitle: string;
  /** Dashboard path segment under /dashboard/ops/ */
  dashboardSlug: string;
  quickOpsEyebrow: string;
  quickOpsTitle: string;
  quickOpsSubtitle: string;
  emptyNoBlocksTitle: string;
  emptyNoBlocksBody: string;
  emptyPageNoBlocksTitle: string;
  emptyPageNoBlocksBody: string;
  saveSuccessMessage: string;
  localStorageLastPageKey: string;
};

/** pages.ops document — one entry per registered LiveOpsKey. */
export type PageOpsDocument = {
  [K in LiveOpsKey]?: LiveOpsStatus;
};
