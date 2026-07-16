/** Breakfast crowd / congestion card — level enum helpers (not batch-translated). */

export const BREAKFAST_CROWD_LEVELS = ["open", "moderate", "busy", "closed"] as const;

export type BreakfastCrowdLevel = (typeof BREAKFAST_CROWD_LEVELS)[number];

/** Guest-facing status copy (level itself stays an enum string). */
export const BREAKFAST_CROWD_STATUS_LABELS: Record<
  BreakfastCrowdLevel,
  { ja: string; en: string; zh: string; ko: string }
> = {
  open: {
    ja: "空いています",
    en: "Seats available",
    zh: "空位充足",
    ko: "여유 있습니다",
  },
  moderate: {
    ja: "やや混雑しています",
    en: "Somewhat crowded",
    zh: "稍有拥挤",
    ko: "다소 혼잡합니다",
  },
  busy: {
    ja: "混雑しています",
    en: "Crowded",
    zh: "拥挤",
    ko: "혼잡합니다",
  },
  closed: {
    ja: "現在は提供時間外です",
    en: "Outside serving hours",
    zh: "当前非供应时间",
    ko: "현재 제공 시간이 아닙니다",
  },
};

/** Short labels for editor segmented control. */
export const BREAKFAST_CROWD_EDITOR_LABELS: Record<BreakfastCrowdLevel, string> = {
  open: "空いている",
  moderate: "やや混雑",
  busy: "混雑",
  closed: "提供時間外",
};

/** Shared Tailwind tone tokens — guest card, Quick Ops, settings picker. */
export const BREAKFAST_CROWD_LEVEL_TONES: Record<
  BreakfastCrowdLevel,
  {
    band: string;
    dot: string;
    text: string;
    surface: string;
    opsSelected: string;
    opsIdle: string;
  }
> = {
  open: {
    band: "bg-emerald-500",
    dot: "bg-emerald-500",
    text: "text-emerald-800",
    surface: "border-emerald-200 bg-emerald-50/80",
    opsSelected: "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400/60",
    opsIdle: "border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-50/80",
  },
  moderate: {
    band: "bg-amber-500",
    dot: "bg-amber-500",
    text: "text-amber-900",
    surface: "border-amber-200 bg-amber-50/80",
    opsSelected: "border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-400/60",
    opsIdle: "border-amber-200 bg-white text-amber-950 hover:bg-amber-50/80",
  },
  busy: {
    band: "bg-red-600",
    dot: "bg-red-600",
    text: "text-red-800",
    surface: "border-red-300 bg-red-50",
    opsSelected: "border-red-600 bg-red-50 text-red-950 ring-2 ring-red-500/60",
    opsIdle: "border-red-200 bg-white text-red-950 hover:bg-red-50/80",
  },
  closed: {
    band: "bg-slate-400",
    dot: "bg-slate-400",
    text: "text-slate-700",
    surface: "border-slate-200 bg-slate-50",
    opsSelected: "border-slate-500 bg-slate-100 text-slate-800 ring-2 ring-slate-400/50",
    opsIdle: "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
  },
};

export function coerceBreakfastCrowdLevel(value: unknown): BreakfastCrowdLevel {
  if (typeof value === "string" && (BREAKFAST_CROWD_LEVELS as readonly string[]).includes(value)) {
    return value as BreakfastCrowdLevel;
  }
  // Batch-translate used to wrap enum strings as { ja, en, zh, ko }.
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const entry of Object.values(value as Record<string, unknown>)) {
      if (typeof entry === "string" && (BREAKFAST_CROWD_LEVELS as readonly string[]).includes(entry)) {
        return entry as BreakfastCrowdLevel;
      }
    }
  }
  return "open";
}

export function breakfastCrowdStatusLabel(level: BreakfastCrowdLevel, locale = "ja"): string {
  const labels = BREAKFAST_CROWD_STATUS_LABELS[level];
  if (locale === "en") return labels.en;
  if (locale === "zh") return labels.zh;
  if (locale === "ko") return labels.ko;
  return labels.ja;
}

/** Guest trust line: 「最終更新 HH:MM」 */
export function formatBreakfastCrowdUpdatedAt(iso: unknown, locale = "ja"): string | null {
  if (typeof iso !== "string" || !iso.trim()) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const timeLocale = locale === "en" ? "en-US" : locale === "zh" ? "zh-CN" : locale === "ko" ? "ko-KR" : "ja-JP";
  const time = d.toLocaleTimeString(timeLocale, { hour: "2-digit", minute: "2-digit", hour12: false });
  if (locale === "en") return `Updated ${time}`;
  if (locale === "zh") return `最后更新 ${time}`;
  if (locale === "ko") return `최종 갱신 ${time}`;
  return `最終更新 ${time}`;
}

export function nowBreakfastCrowdUpdatedAt(): string {
  return new Date().toISOString();
}

/** Parse content.updatedAt to epoch ms; missing/invalid → 0. */
export function breakfastCrowdUpdatedAtMs(value: unknown): number {
  if (typeof value !== "string" || !value.trim()) return 0;
  const t = Date.parse(value);
  return Number.isNaN(t) ? 0 : t;
}

/** Page-level ops snapshot (source of truth for live congestion). */
export type BreakfastCrowdOpsStatus = {
  level: BreakfastCrowdLevel;
  note: string;
  updatedAt: string;
  updatedBy?: string | null;
};

export type PageOpsDocument = {
  breakfastCrowd?: BreakfastCrowdOpsStatus;
};

function isLocalizedNoteObject(v: unknown): v is Record<string, string> {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    ("ja" in v || "en" in v || "zh" in v || "ko" in v)
  );
}

/** Read JA note from card content (plain string or localized object). */
export function readBreakfastCrowdNoteJa(note: unknown): string {
  if (typeof note === "string") return note;
  if (isLocalizedNoteObject(note) && typeof note.ja === "string") return note.ja;
  return "";
}

/** Write JA note into existing note field shape (preserve other locales when present). */
export function writeBreakfastCrowdNoteJa(prev: unknown, note: string): unknown {
  if (isLocalizedNoteObject(prev)) return { ...prev, ja: note };
  return note;
}

export function parseBreakfastCrowdOpsStatus(value: unknown): BreakfastCrowdOpsStatus | null {
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
    level: coerceBreakfastCrowdLevel(obj.level),
    note: typeof obj.note === "string" ? obj.note : readBreakfastCrowdNoteJa(obj.note),
    updatedAt,
    ...(updatedBy !== undefined ? { updatedBy } : {}),
  };
}

export function parsePageOpsDocument(value: unknown): PageOpsDocument {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const obj = value as Record<string, unknown>;
  const breakfastCrowd = parseBreakfastCrowdOpsStatus(obj.breakfastCrowd);
  return breakfastCrowd ? { breakfastCrowd } : {};
}

/** Seed ops status from denormalized card content (migration heal). */
export function breakfastCrowdOpsStatusFromCardContent(
  content: Record<string, unknown>,
): BreakfastCrowdOpsStatus {
  const updatedRaw = content.updatedAt;
  const updatedAt =
    typeof updatedRaw === "string" && updatedRaw.trim() && !Number.isNaN(Date.parse(updatedRaw))
      ? updatedRaw.trim()
      : nowBreakfastCrowdUpdatedAt();
  return {
    level: coerceBreakfastCrowdLevel(content.level),
    note: readBreakfastCrowdNoteJa(content.note),
    updatedAt,
  };
}

/**
 * Overlay authoritative ops onto card chrome content.
 * Card keeps title / appearance; ops owns level / note / updatedAt.
 */
export function overlayBreakfastCrowdOpsOnContent(
  content: Record<string, unknown>,
  ops: BreakfastCrowdOpsStatus,
): Record<string, unknown> {
  return {
    ...content,
    level: ops.level,
    note: writeBreakfastCrowdNoteJa(content.note, ops.note),
    updatedAt: ops.updatedAt,
  };
}

/**
 * Prefer newer ops fields (level / note / updatedAt) by updatedAt.
 * Used when merging two denormalized snapshots; prefer page ops via overlay when available.
 */
export function mergeBreakfastCrowdOpsFields(
  localContent: Record<string, unknown>,
  serverContent: Record<string, unknown>,
): Record<string, unknown> {
  const localMs = breakfastCrowdUpdatedAtMs(localContent.updatedAt);
  const serverMs = breakfastCrowdUpdatedAtMs(serverContent.updatedAt);
  if (serverMs <= localMs) {
    return {
      ...localContent,
      level: coerceBreakfastCrowdLevel(localContent.level),
    };
  }
  return {
    ...localContent,
    level: coerceBreakfastCrowdLevel(serverContent.level),
    note: "note" in serverContent ? serverContent.note : localContent.note,
    updatedAt: serverContent.updatedAt,
  };
}

/**
 * Apply page-level breakfast crowd ops onto all breakfast_crowd cards.
 * Returns a new array when anything changed.
 */
export function applyBreakfastCrowdOpsStatusToCards<
  T extends { id: string; type: string; content: Record<string, unknown> },
>(cards: T[], ops: BreakfastCrowdOpsStatus | null | undefined): { cards: T[]; changed: boolean } {
  if (!ops) return { cards, changed: false };

  let changed = false;
  const next = cards.map((card) => {
    if (card.type !== "breakfast_crowd") return card;
    const merged = overlayBreakfastCrowdOpsOnContent(card.content ?? {}, ops);
    if (
      coerceBreakfastCrowdLevel(card.content?.level) === coerceBreakfastCrowdLevel(merged.level) &&
      card.content?.updatedAt === merged.updatedAt &&
      readBreakfastCrowdNoteJa(card.content?.note) === readBreakfastCrowdNoteJa(merged.note)
    ) {
      return card;
    }
    changed = true;
    return { ...card, content: merged };
  });
  return { cards: changed ? next : cards, changed };
}

/**
 * @deprecated Prefer applyBreakfastCrowdOpsStatusToCards with page.ops.
 * Patch in-memory cards with newer breakfast_crowd ops from card DB rows.
 */
export function applyNewerBreakfastCrowdOpsFromRows<
  T extends { id: string; type: string; content: Record<string, unknown> },
>(cards: T[], rows: Array<{ id: string; type?: string; content: unknown }>): { cards: T[]; changed: boolean } {
  const serverById = new Map<string, Record<string, unknown>>();
  for (const row of rows) {
    if (row.type != null && row.type !== "breakfast_crowd") continue;
    if (!row.content || typeof row.content !== "object" || Array.isArray(row.content)) continue;
    serverById.set(row.id, row.content as Record<string, unknown>);
  }
  if (serverById.size === 0) return { cards, changed: false };

  let changed = false;
  const next = cards.map((card) => {
    if (card.type !== "breakfast_crowd") return card;
    const server = serverById.get(card.id);
    if (!server) return card;
    const merged = mergeBreakfastCrowdOpsFields(card.content ?? {}, server);
    if (
      coerceBreakfastCrowdLevel(card.content?.level) === coerceBreakfastCrowdLevel(merged.level) &&
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
