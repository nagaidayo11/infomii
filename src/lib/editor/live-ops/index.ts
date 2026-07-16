/**
 * Page-level live ops framework.
 * Source of truth: pages.ops. Cards keep chrome; guest overlay + Quick Ops read/write here.
 *
 * To add a new key (e.g. dinnerCrowd):
 * 1. Extend LiveOpsKey in types.ts
 * 2. Add LIVE_OPS_DEFINITIONS[key] in registry.ts
 * 3. Register the card type(s) in that definition
 * 4. Add a dashboard route that renders <LiveOpsQuickOps opsKey="..." />
 * Autosave, guest overlay, and editor sync pick up registered keys automatically.
 */

export type {
  LiveOpsKey,
  LiveOpsLevel,
  LiveOpsStatus,
  LiveOpsDefinition,
  LiveOpsLevelTones,
  LiveOpsStatusLabels,
  PageOpsDocument,
} from "./types";
export { LIVE_OPS_LEVELS } from "./types";

export {
  LIVE_OPS_DEFINITIONS,
  LIVE_OPS_KEYS,
  getLiveOpsDefinition,
  liveOpsKeyForCardType,
  isLiveOpsCardType,
  allLiveOpsCardTypes,
  buildLiveOpsHref,
} from "./registry";

export {
  coerceLiveOpsLevel,
  nowLiveOpsUpdatedAt,
  liveOpsUpdatedAtMs,
  formatLiveOpsUpdatedAt,
  readLiveOpsNoteJa,
  writeLiveOpsNoteJa,
  parseLiveOpsStatus,
  parsePageOpsDocument,
  liveOpsStatusFromCardContent,
  overlayLiveOpsStatusOnContent,
  mergeLiveOpsFields,
  applyLiveOpsStatusToCards,
  applyLiveOpsByKeyToCards,
  applyNewerLiveOpsFromRows,
} from "./status";

export {
  PAGE_OPS_MIGRATION_SQL,
  isPageOpsColumnMissingError,
  pickLiveOpsSeedFromCards,
  readPageOpsDocument,
  getPageLiveOps,
  setPageLiveOps,
  resolvePageLiveOps,
  resolvePageLiveOpsWithClient,
  resolveAllPageLiveOpsWithClient,
} from "./page-store";

export type { LiveOpsTarget } from "./targets";
export {
  readLastLiveOpsPageId,
  rememberLiveOpsPageId,
  canEditLiveOps,
  listLiveOpsKeysByPageIds,
  listHotelLiveOpsTargets,
  loadLiveOpsTargetsForPage,
  saveLiveOpsStatus,
  syncLiveOpsKeyIntoEditorStore,
  syncLiveOpsIntoEditorStore,
} from "./targets";
