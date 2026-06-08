import type { EditorCard, CardType } from "@/components/editor/types";
import {
  isObjectJoinGarbageText,
  localizedFieldToPlain,
} from "@/lib/localized-content";

const LEGACY_ICON_TOKEN_MAP: Record<string, string> = {
  "📶": "wifi",
  "🍳": "breakfast",
  "🕐": "checkout",
  "🍽️": "restaurant",
  "♨️": "spa",
  "🅿️": "parking",
  "📍": "map",
  "🗺️": "nearby",
  "📢": "notice",
  "🚨": "emergency",
  "🧺": "laundry",
  "🚕": "taxi",
  "ℹ️": "info",
  "📌": "link",
};

function joinFacilityDetailFields(
  content: Record<string, unknown>,
  separator: string,
  locale = "ja",
): string {
  const time = localizedFieldToPlain(content.time, locale) || localizedFieldToPlain(content.hours, locale);
  const location = localizedFieldToPlain(content.location, locale);
  const menu =
    localizedFieldToPlain(content.menu, locale) ||
    localizedFieldToPlain(content.description, locale) ||
    localizedFieldToPlain(content.note, locale);
  return [time, location, menu].filter(Boolean).join(separator);
}

function normalizeLegacyIcon(raw: unknown, fallback = "info"): string {
  if (typeof raw !== "string") return fallback;
  const icon = raw.trim();
  if (!icon) return fallback;
  return LEGACY_ICON_TOKEN_MAP[icon] ?? icon.toLowerCase();
}

/**
 * Migrate legacy card content (icon tokens, corrupted highlight body, pageLinks icons).
 * breakfast/spa は type を変えず、time/location/menu などの多言語フィールドを保持する。
 * Call this when loading cards from DB before setCards().
 */
export function migrateCardsForEditor(cards: Array<{ id: string; type: string; content: Record<string, unknown>; style?: Record<string, unknown>; order: number }>): EditorCard[] {
  const migrated = cards.map((card, index): EditorCard => {
    const id = card.id;
    let type = card.type as CardType;
    let content = { ...card.content };

    /* breakfast/spa は type のまま（施設案内フィールドを保持）。表示は CardRenderer が担当 */
    if (type === "highlight" && isObjectJoinGarbageText(content.body)) {
      const repaired = joinFacilityDetailFields(content, " · ");
      if (repaired) {
        content = { ...content, body: repaired };
      }
    } else if (type === "info") {
      const c = card.content as Record<string, unknown>;
      content = { ...c, icon: normalizeLegacyIcon(c?.icon, "info") };
    } else if (type === "pageLinks") {
      const c = card.content as Record<string, unknown>;
      const items = Array.isArray(c?.items) ? c.items : [];
      const rawColumns = typeof c.columns === "number" ? c.columns : Number(c.columns);
      const columns = rawColumns === 2 || rawColumns === 3 || rawColumns === 4 ? rawColumns : 2;
      content = {
        ...c,
        columns,
        items: items.map((entry) => {
          const item = (entry ?? {}) as Record<string, unknown>;
          return { ...item, icon: normalizeLegacyIcon(item.icon, "link") };
        }),
      };
    }

    return {
      id,
      type,
      content,
      style: card.style ?? {},
      order: index,
    };
  });

  return migrated.map((c, i) => ({ ...c, order: i }));
}
