import { nanoid } from "nanoid";
import type { EditorCard, CardType } from "@/components/editor/types";
import { createEmptyCard } from "@/components/editor/types";

/**
 * Migrate legacy card types to new Canva-style types (wifi→info, breakfast→highlight).
 * Ensures at least one hero card exists (prepends if none).
 * Call this when loading cards from DB before setCards().
 */
export function migrateCardsForEditor(cards: Array<{ id: string; type: string; content: Record<string, unknown>; style?: Record<string, unknown>; order: number }>): EditorCard[] {
  const hasHero = cards.some((c) => c.type === "hero");
  let migrated = cards.map((card, index): EditorCard => {
    const id = card.id;
    const order = card.order;
    let type = card.type as CardType;
    let content = { ...card.content };

    if (type === "wifi") {
      type = "info";
      const c = card.content as Record<string, unknown>;
      content = {
        title: (c?.title as string) || "Wi-Fi",
        icon: "📶",
        rows: [
          { label: "ネットワーク名", value: (c?.ssid as string) ?? "" },
          { label: "パスワード", value: (c?.password as string) ?? "" },
        ],
      };
    } else if (type === "breakfast") {
      type = "highlight";
      const c = card.content as Record<string, unknown>;
      const time = (c?.time as string) ?? "";
      const location = (c?.location as string) ?? "";
      const menu = (c?.menu as string) ?? "";
      content = {
        title: (c?.title as string) || "朝食",
        body: [time, location, menu].filter(Boolean).join(" · ") || "時間・会場・メニューを入力",
        accent: "amber",
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

  if (!hasHero) {
    const heroCard = createEmptyCard("hero", nanoid(10), 0);
    heroCard.content = { title: "Infomii Hotel", image: "", subtitle: "" };
    migrated = [heroCard, ...migrated.map((c) => ({ ...c, order: c.order + 1 }))];
  }

  return migrated.map((c, i) => ({ ...c, order: i }));
}
