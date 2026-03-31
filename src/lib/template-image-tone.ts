export type TemplateImageToneId =
  | "balanced"
  | "people"
  | "scenery"
  | "facility"
  | "local"
  | "night";

export const TEMPLATE_IMAGE_TONES: Array<{ id: TemplateImageToneId; label: string }> = [
  { id: "balanced", label: "バランス" },
  { id: "people", label: "人物入り" },
  { id: "scenery", label: "風景中心" },
  { id: "facility", label: "施設内観" },
  { id: "local", label: "周辺観光" },
  { id: "night", label: "ナイトムード" },
];

const HERO_BY_TONE: Record<TemplateImageToneId, string> = {
  balanced: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&q=80",
  people: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
  scenery: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
  facility: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80",
  local: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1200&q=80",
  night: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&q=80",
};

const GALLERY_BY_TONE: Record<TemplateImageToneId, string[]> = {
  balanced: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1200&q=80",
    "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80",
  ],
  people: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
  ],
  scenery: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
    "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1200&q=80",
    "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1200&q=80",
  ],
  facility: [
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80",
    "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=1200&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
  ],
  local: [
    "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1200&q=80",
    "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1200&q=80",
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&q=80",
  ],
  night: [
    "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&q=80",
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80",
    "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80",
  ],
};

export function applyImageToneToTemplateCards(
  cards: Array<{ type: string; content?: Record<string, unknown>; order?: number }>,
  toneId: TemplateImageToneId
): Array<{ type: string; content?: Record<string, unknown>; order?: number }> {
  const hero = HERO_BY_TONE[toneId] ?? HERO_BY_TONE.balanced;
  const gallerySamples = GALLERY_BY_TONE[toneId] ?? GALLERY_BY_TONE.balanced;

  return cards.map((card) => {
    const content = { ...(card.content ?? {}) };
    if (card.type === "hero") {
      content.image = hero;
    }
    if (card.type === "gallery") {
      const items = Array.isArray(content.items) ? content.items : [];
      const nextItems = (items.length > 0 ? items : gallerySamples.map((src) => ({ src }))).map((item, i) => {
        const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        return {
          ...row,
          src: gallerySamples[i % gallerySamples.length],
          alt:
            (typeof row.alt === "string" && row.alt.trim()) ||
            `${toneId}-gallery-${i + 1}`,
        };
      });
      content.items = nextItems;
    }
    return { ...card, content };
  });
}

