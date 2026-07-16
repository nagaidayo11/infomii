import { guestCardColumnMaxWidthPx, GUEST_PAGE_MAIN_PADDING_X_PX } from "@/lib/guest-page-layout";
import { isCardFullBleed } from "@/lib/editor/card-width-mode";
import { usesHeroColumnWidth, type CardType, type EditorCard } from "@/components/editor/types";

/** Matches FreeformCanvas fixed preview width. */
export const FREEFORM_VIEWPORT_WIDTH_PX = 375;
export const FREEFORM_CONTENT_WIDTH_PX = guestCardColumnMaxWidthPx(FREEFORM_VIEWPORT_WIDTH_PX);
const CANVAS_PADDING_X = GUEST_PAGE_MAIN_PADDING_X_PX;

const POSITION_KEY = "_position";
const STACK_GAP_Y = 12;
const GRID = 8;
const DEFAULT_H = 96;

const DEFAULT_H_BY_TYPE: Record<CardType, number> = {
  hero: 120,
  hero_slider: 220,
  heading_body: 96,
  info: 90,
  highlight: 84,
  action: 64,
  welcome: 90,
  wifi: 90,
  breakfast: 96,
  checkout: 96,
  nearby: 104,
  notice: 84,
  map: 104,
  restaurant: 96,
  taxi: 90,
  emergency: 96,
  laundry: 96,
  spa: 104,
  text: 72,
  icon: 72,
  image: 110,
  video: 120,
  button: 64,
  faq: 104,
  schedule: 96,
  menu: 96,
  gallery: 110,
  divider: 52,
  parking: 96,
  pageLinks: 104,
  icon_shortcuts: 96,
  image_tiles: 180,
  quote: 84,
  checklist: 104,
  steps: 104,
  compare: 96,
  kpi: 96,
  space: 48,
  campaign_timer: 128,
  tabs_info: 120,
  faq_search: 128,
  notice_ticker: 92,
  coupon: 128,
  accordion_info: 140,
  open_status: 104,
  breakfast_crowd: 120,
  dinner_crowd: 120,
  spa_crowd: 120,
  social_links: 120,
  contact_hub: 132,
  progress_steps: 124,
  emergency_banner: 108,
  scheduled_banner: 108,
  menu_categories: 140,
  daily_special: 120,
  drink_menu: 110,
  salon_service_menu: 120,
  combo_set_menu: 110,
  menu_grid: 136,
  menu_sheet_sync: 120,
  menu_time_band: 130,
};

type Position = { x: number; y: number; w?: number; h?: number; manualH?: boolean };

function getCardDefaultHeight(card: EditorCard): number {
  return DEFAULT_H_BY_TYPE[card.type] ?? DEFAULT_H;
}

function getStackHeight(card: EditorCard): number {
  const pos = card.style?.[POSITION_KEY] as Position | undefined;
  if (typeof pos?.h === "number") return pos.h;
  return getCardDefaultHeight(card);
}

function getInitialStackY(cards: EditorCard[], index: number): number {
  if (index <= 0) return 24;
  let y = 24;
  for (let i = 0; i < index; i += 1) {
    y += getStackHeight(cards[i]) + STACK_GAP_Y;
  }
  return y;
}

function getPosition(card: EditorCard, index: number, contentWidth: number, cards: EditorCard[] = []): Position {
  const pos = card.style?.[POSITION_KEY] as Position | undefined;
  const initialH = getCardDefaultHeight(card);
  const fullBleed = isCardFullBleed(card);
  const forceHeroWidth = usesHeroColumnWidth(card.type);
  const stageWidth = contentWidth + CANVAS_PADDING_X * 2;
  const h = typeof pos?.h === "number" ? pos.h : initialH;

  if (fullBleed) {
    return {
      x: 0,
      y: typeof pos?.y === "number" ? pos.y : getInitialStackY(cards, index),
      w: stageWidth,
      h,
    };
  }

  if (forceHeroWidth) {
    return {
      x: CANVAS_PADDING_X,
      y: typeof pos?.y === "number" ? pos.y : getInitialStackY(cards, index),
      w: contentWidth,
      h,
    };
  }

  const w = typeof pos?.w === "number" ? pos.w : contentWidth;
  const blockW = Math.min(w, contentWidth);
  const centeredX = CANVAS_PADDING_X + Math.round((contentWidth - blockW) / 2);

  if (pos && typeof pos.x === "number" && typeof pos.y === "number") {
    const savedX = pos.x;
    const isLegacyLeftAligned = savedX <= 60;
    return {
      x: isLegacyLeftAligned ? centeredX : savedX,
      y: pos.y,
      w: blockW,
      h,
    };
  }
  return {
    x: centeredX,
    y: getInitialStackY(cards, index),
    w: blockW,
    h: initialH,
  };
}

/** Reflow cards into a centered vertical stack and assign order + _position. */
export function reflowStackedCards(
  cards: EditorCard[],
  contentWidth: number = FREEFORM_CONTENT_WIDTH_PX,
): EditorCard[] {
  let currentY = 24;
  return cards.map((card, order) => {
    const pos = getPosition(card, order, contentWidth, cards);
    const w = pos.w ?? contentWidth;
    const h = getStackHeight(card);
    const savedPos = (card.style?.[POSITION_KEY] as Position | undefined) ?? undefined;
    const next = {
      ...card,
      order,
      style: {
        ...(card.style ?? {}),
        [POSITION_KEY]: {
          x: pos.x,
          y: currentY,
          w,
          h,
          manualH: savedPos?.manualH === true,
        },
      },
    };
    currentY += h + STACK_GAP_Y;
    return next;
  });
}

/** Reorder by target Y (same logic as FreeformCanvas drag-stop). */
export function reorderCardsAtTargetY(
  cards: EditorCard[],
  movedId: string,
  targetY: number,
  contentWidth: number = FREEFORM_CONTENT_WIDTH_PX,
): EditorCard[] {
  const snappedY = Math.round(targetY / GRID) * GRID;
  const positions = new Map<
    string,
    {
      card: EditorCard;
      w: number;
      h: number;
      y: number;
      manualH: boolean;
    }
  >();

  for (const card of cards) {
    const index = cards.findIndex((row) => row.id === card.id);
    const pos = getPosition(card, index, contentWidth, cards);
    const savedPos = (card.style?.[POSITION_KEY] as Position | undefined) ?? undefined;
    positions.set(card.id, {
      card,
      w: pos.w ?? contentWidth,
      h: getStackHeight(card),
      y: pos.y,
      manualH: savedPos?.manualH === true,
    });
  }

  const moved = positions.get(movedId);
  if (!moved) return cards;
  moved.y = snappedY;

  const sorted = [...positions.values()].sort((a, b) => a.y - b.y);
  let currentY = 24;
  return sorted.map((entry, order) => {
    const layout = getPosition(entry.card, order, contentWidth, cards);
    const next = {
      ...entry.card,
      order,
      style: {
        ...(entry.card.style ?? {}),
        [POSITION_KEY]: {
          x: layout.x,
          y: currentY,
          w: layout.w ?? entry.w,
          h: entry.h,
          manualH: entry.manualH,
        },
      },
    };
    currentY += entry.h + STACK_GAP_Y;
    return next;
  });
}

export function moveCardInStack(
  cards: EditorCard[],
  cardId: string,
  direction: "up" | "down",
  contentWidth: number = FREEFORM_CONTENT_WIDTH_PX,
): EditorCard[] | null {
  const sorted = [...cards].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((c) => c.id === cardId);
  if (idx < 0) return null;
  const newIdx = direction === "up" ? idx - 1 : idx + 1;
  if (newIdx < 0 || newIdx >= sorted.length) return null;
  const next = [...sorted];
  const [item] = next.splice(idx, 1);
  next.splice(newIdx, 0, item);
  return reflowStackedCards(next, contentWidth);
}

export function getFreeformCardLayout(
  card: EditorCard,
  index: number,
  cards: EditorCard[],
  contentWidth: number = FREEFORM_CONTENT_WIDTH_PX,
): Position {
  return getPosition(card, index, contentWidth, cards);
}
