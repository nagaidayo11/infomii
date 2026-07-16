/**
 * Live ops registry — add a new key here to wire Quick Ops + overlay + autosave.
 */

import type { LiveOpsDefinition, LiveOpsKey } from "./types";
import { LIVE_OPS_LEVELS } from "./types";

const SHARED_LEVEL_TONES: LiveOpsDefinition["levelTones"] = {
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

export const LIVE_OPS_DEFINITIONS: Record<LiveOpsKey, LiveOpsDefinition> = {
  breakfastCrowd: {
    key: "breakfastCrowd",
    cardTypes: ["breakfast_crowd"],
    levels: LIVE_OPS_LEVELS,
    editorLabels: {
      open: "空いている",
      moderate: "やや混雑",
      busy: "混雑",
      closed: "提供時間外",
    },
    statusLabels: {
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
    },
    levelTones: SHARED_LEVEL_TONES,
    defaultTitle: "朝食混雑",
    dashboardSlug: "breakfast-crowd",
    quickOpsEyebrow: "フロントデスク",
    quickOpsTitle: "朝食混雑クイック切替",
    quickOpsSubtitle: "大きなボタンで混雑状況をすぐ更新できます",
    emptyNoBlocksTitle: "朝食混雑ブロックがありません",
    emptyNoBlocksBody:
      "編集画面で「朝食混雑」ブロックを追加すると、ここから混雑状況を切り替えられます。",
    emptyPageNoBlocksTitle: "このページに朝食混雑ブロックがありません",
    emptyPageNoBlocksBody: "編集画面でブロックを追加してください。",
    saveSuccessMessage: "朝食混雑を更新しました",
    localStorageLastPageKey: "infomii:ops:breakfast-crowd:lastPageId",
  },
  dinnerCrowd: {
    key: "dinnerCrowd",
    cardTypes: ["dinner_crowd"],
    levels: LIVE_OPS_LEVELS,
    editorLabels: {
      open: "空いている",
      moderate: "やや混雑",
      busy: "混雑",
      closed: "営業時間外",
    },
    statusLabels: {
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
        ja: "現在は営業時間外です",
        en: "Outside restaurant hours",
        zh: "当前非营业时间",
        ko: "현재 영업 시간이 아닙니다",
      },
    },
    levelTones: SHARED_LEVEL_TONES,
    defaultTitle: "夕食混雑",
    dashboardSlug: "dinner-crowd",
    quickOpsEyebrow: "フロントデスク",
    quickOpsTitle: "夕食混雑クイック切替",
    quickOpsSubtitle: "大きなボタンでレストランの混雑状況をすぐ更新できます",
    emptyNoBlocksTitle: "夕食混雑ブロックがありません",
    emptyNoBlocksBody:
      "編集画面で「夕食混雑」ブロックを追加すると、ここから混雑状況を切り替えられます。",
    emptyPageNoBlocksTitle: "このページに夕食混雑ブロックがありません",
    emptyPageNoBlocksBody: "編集画面でブロックを追加してください。",
    saveSuccessMessage: "夕食混雑を更新しました",
    localStorageLastPageKey: "infomii:ops:dinner-crowd:lastPageId",
  },
  spaCrowd: {
    key: "spaCrowd",
    cardTypes: ["spa_crowd"],
    levels: LIVE_OPS_LEVELS,
    editorLabels: {
      open: "空いている",
      moderate: "やや混雑",
      busy: "混雑",
      closed: "入浴時間外",
    },
    statusLabels: {
      open: {
        ja: "空いています",
        en: "Quiet now",
        zh: "空闲",
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
        ja: "現在は入浴時間外です",
        en: "Outside bathing hours",
        zh: "当前非入浴时间",
        ko: "현재 입욕 시간이 아닙니다",
      },
    },
    levelTones: SHARED_LEVEL_TONES,
    defaultTitle: "大浴場混雑",
    dashboardSlug: "spa-crowd",
    quickOpsEyebrow: "フロントデスク",
    quickOpsTitle: "大浴場混雑クイック切替",
    quickOpsSubtitle: "大きなボタンで大浴場の混雑状況をすぐ更新できます",
    emptyNoBlocksTitle: "大浴場混雑ブロックがありません",
    emptyNoBlocksBody:
      "編集画面で「大浴場混雑」ブロックを追加すると、ここから混雑状況を切り替えられます。",
    emptyPageNoBlocksTitle: "このページに大浴場混雑ブロックがありません",
    emptyPageNoBlocksBody: "編集画面でブロックを追加してください。",
    saveSuccessMessage: "大浴場混雑を更新しました",
    localStorageLastPageKey: "infomii:ops:spa-crowd:lastPageId",
  },
};

export const LIVE_OPS_KEYS = Object.keys(LIVE_OPS_DEFINITIONS) as LiveOpsKey[];

export function getLiveOpsDefinition(key: LiveOpsKey): LiveOpsDefinition {
  return LIVE_OPS_DEFINITIONS[key];
}

/** Map card type → live ops key (first match). */
const CARD_TYPE_TO_KEY = new Map<string, LiveOpsKey>();
for (const key of LIVE_OPS_KEYS) {
  for (const cardType of LIVE_OPS_DEFINITIONS[key].cardTypes) {
    CARD_TYPE_TO_KEY.set(cardType, key);
  }
}

export function liveOpsKeyForCardType(cardType: string): LiveOpsKey | null {
  return CARD_TYPE_TO_KEY.get(cardType) ?? null;
}

export function isLiveOpsCardType(cardType: string): boolean {
  return CARD_TYPE_TO_KEY.has(cardType);
}

/** All card types that participate in live ops. */
export function allLiveOpsCardTypes(): string[] {
  return [...CARD_TYPE_TO_KEY.keys()];
}

export function buildLiveOpsHref(key: LiveOpsKey, pageId?: string | null): string {
  const base = `/dashboard/ops/${LIVE_OPS_DEFINITIONS[key].dashboardSlug}`;
  if (!pageId) return base;
  return `${base}?pageId=${encodeURIComponent(pageId)}`;
}
