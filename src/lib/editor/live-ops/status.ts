/**
 * Live ops status parse / overlay / apply helpers (card-agnostic).
 */

import { LIVE_OPS_KEYS, liveOpsKeyForCardType } from "./registry";
import type { LiveOpsKey, LiveOpsLevel, LiveOpsStatus, PageOpsDocument } from "./types";
import { LIVE_OPS_LEVELS } from "./types";

export function coerceLiveOpsLevel(value: unknown): LiveOpsLevel {
  if (typeof value === "string" && (LIVE_OPS_LEVELS as readonly string[]).includes(value)) {
    return value as LiveOpsLevel;
  }
  // Batch-translate used to wrap enum strings as { ja, en, zh, ko }.
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const entry of Object.values(value as Record<string, unknown>)) {
      if (typeof entry === "string" && (LIVE_OPS_LEVELS as readonly string[]).includes(entry)) {
        return entry as LiveOpsLevel;
      }
    }
  }
  return "open";
}

export function nowLiveOpsUpdatedAt(): string {
  return new Date().toISOString();
}

/** Parse content.updatedAt to epoch ms; missing/invalid → 0. */
export function liveOpsUpdatedAtMs(value: unknown): number {
  if (typeof value !== "string" || !value.trim()) return 0;
  const t = Date.parse(value);
  return Number.isNaN(t) ? 0 : t;
}

/** Guest trust line: 「最終更新 HH:MM」 */
export function formatLiveOpsUpdatedAt(iso: unknown, locale = "ja"): string | null {
  if (typeof iso !== "string" || !iso.trim()) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const timeLocale =
    locale === "en" ? "en-US" : locale === "zh" ? "zh-CN" : locale === "ko" ? "ko-KR" : "ja-JP";
  const time = d.toLocaleTimeString(timeLocale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  if (locale === "en") return `Updated ${time}`;
  if (locale === "zh") return `最后更新 ${time}`;
  if (locale === "ko") return `최종 갱신 ${time}`;
  return `最終更新 ${time}`;
}

function isLocalizedNoteObject(v: unknown): v is Record<string, string> {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    ("ja" in v || "en" in v || "zh" in v || "ko" in v)
  );
}

/** Read JA note from card content (plain string or localized object). */
export function readLiveOpsNoteJa(note: unknown): string {
  if (typeof note === "string") return note;
  if (isLocalizedNoteObject(note) && typeof note.ja === "string") return note.ja;
  return "";
}

/** Write JA note into existing note field shape (preserve other locales when present). */
export function writeLiveOpsNoteJa(prev: unknown, note: string): unknown {
  if (isLocalizedNoteObject(prev)) return { ...prev, ja: note };
  return note;
}

export function parseLiveOpsStatus(value: unknown): LiveOpsStatus | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const obj = value as Record<string, unknown>;
  const updatedRaw = obj.updatedAt;
  if (typeof updatedRaw !== "string" || !updatedRaw.trim()) return null;
  const updatedAt = updatedRaw.trim();
  if (Number.isNaN(Date.parse(updatedAt))) return null;
  const updatedBy =
    typeof obj.updatedBy === "string" && obj.updatedBy.trim()
      ? obj.updatedBy.trim()
      : obj.updatedBy === null
        ? null
        : undefined;
  return {
    level: coerceLiveOpsLevel(obj.level),
    note: typeof obj.note === "string" ? obj.note : readLiveOpsNoteJa(obj.note),
    updatedAt,
    ...(updatedBy !== undefined ? { updatedBy } : {}),
  };
}

export function parsePageOpsDocument(value: unknown): PageOpsDocument {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const obj = value as Record<string, unknown>;
  const doc: PageOpsDocument = {};
  // Only registered keys — ignore unknown future keys until added to the registry.
  for (const key of LIVE_OPS_KEYS) {
    const parsed = parseLiveOpsStatus(obj[key]);
    if (parsed) doc[key] = parsed;
  }
  return doc;
}

/** Seed ops status from denormalized card content (migration heal). */
export function liveOpsStatusFromCardContent(content: Record<string, unknown>): LiveOpsStatus {
  const updatedRaw = content.updatedAt;
  const updatedAt =
    typeof updatedRaw === "string" && updatedRaw.trim() && !Number.isNaN(Date.parse(updatedRaw))
      ? updatedRaw.trim()
      : nowLiveOpsUpdatedAt();
  return {
    level: coerceLiveOpsLevel(content.level),
    note: readLiveOpsNoteJa(content.note),
    updatedAt,
  };
}

/**
 * Overlay authoritative ops onto card chrome content.
 * Card keeps title / appearance; ops owns level / note / updatedAt.
 */
export function overlayLiveOpsStatusOnContent(
  content: Record<string, unknown>,
  ops: LiveOpsStatus,
): Record<string, unknown> {
  return {
    ...content,
    level: ops.level,
    note: writeLiveOpsNoteJa(content.note, ops.note),
    updatedAt: ops.updatedAt,
  };
}

/**
 * Prefer newer ops fields (level / note / updatedAt) by updatedAt.
 * Used when merging two denormalized snapshots; prefer page ops via overlay when available.
 */
export function mergeLiveOpsFields(
  localContent: Record<string, unknown>,
  serverContent: Record<string, unknown>,
): Record<string, unknown> {
  const localMs = liveOpsUpdatedAtMs(localContent.updatedAt);
  const serverMs = liveOpsUpdatedAtMs(serverContent.updatedAt);
  if (serverMs <= localMs) {
    return {
      ...localContent,
      level: coerceLiveOpsLevel(localContent.level),
    };
  }
  return {
    ...localContent,
    level: coerceLiveOpsLevel(serverContent.level),
    note: "note" in serverContent ? serverContent.note : localContent.note,
    updatedAt: serverContent.updatedAt,
  };
}

/**
 * Apply one ops status onto cards matching a live-ops key's card types.
 * Returns a new array when anything changed.
 */
export function applyLiveOpsStatusToCards<
  T extends { id: string; type: string; content: Record<string, unknown> },
>(
  cards: T[],
  key: LiveOpsKey,
  ops: LiveOpsStatus | null | undefined,
): { cards: T[]; changed: boolean } {
  if (!ops) return { cards, changed: false };

  let changed = false;
  const next = cards.map((card) => {
    if (liveOpsKeyForCardType(card.type) !== key) return card;
    const merged = overlayLiveOpsStatusOnContent(card.content ?? {}, ops);
    if (
      coerceLiveOpsLevel(card.content?.level) === coerceLiveOpsLevel(merged.level) &&
      card.content?.updatedAt === merged.updatedAt &&
      readLiveOpsNoteJa(card.content?.note) === readLiveOpsNoteJa(merged.note)
    ) {
      return card;
    }
    changed = true;
    return { ...card, content: merged };
  });
  return { cards: changed ? next : cards, changed };
}

/**
 * Apply a map of ops-by-key onto matching cards (guest read path / editor load).
 */
export function applyLiveOpsByKeyToCards<
  T extends { id: string; type: string; content: Record<string, unknown> },
>(
  cards: T[],
  opsByKey: Partial<Record<LiveOpsKey, LiveOpsStatus | null | undefined>>,
): { cards: T[]; changed: boolean } {
  let current = cards;
  let anyChanged = false;
  for (const [key, ops] of Object.entries(opsByKey) as Array<
    [LiveOpsKey, LiveOpsStatus | null | undefined]
  >) {
    const result = applyLiveOpsStatusToCards(current, key, ops);
    current = result.cards;
    if (result.changed) anyChanged = true;
  }
  return { cards: current, changed: anyChanged };
}

/**
 * @deprecated Prefer applyLiveOpsStatusToCards with page.ops.
 * Patch in-memory cards with newer ops fields from card DB rows (same card type).
 */
export function applyNewerLiveOpsFromRows<
  T extends { id: string; type: string; content: Record<string, unknown> },
>(
  cards: T[],
  key: LiveOpsKey,
  rows: Array<{ id: string; type?: string; content: unknown }>,
): { cards: T[]; changed: boolean } {
  const serverById = new Map<string, Record<string, unknown>>();
  for (const row of rows) {
    if (row.type != null && liveOpsKeyForCardType(row.type) !== key) continue;
    if (!row.content || typeof row.content !== "object" || Array.isArray(row.content)) continue;
    serverById.set(row.id, row.content as Record<string, unknown>);
  }
  if (serverById.size === 0) return { cards, changed: false };

  let changed = false;
  const next = cards.map((card) => {
    if (liveOpsKeyForCardType(card.type) !== key) return card;
    const server = serverById.get(card.id);
    if (!server) return card;
    const merged = mergeLiveOpsFields(card.content ?? {}, server);
    if (
      coerceLiveOpsLevel(card.content?.level) === coerceLiveOpsLevel(merged.level) &&
      card.content?.updatedAt === merged.updatedAt &&
      card.content?.note === merged.note
    ) {
      return card;
    }
    changed = true;
    return { ...card, content: merged };
  });
  return { cards: changed ? next : cards, changed };
}
