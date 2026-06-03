import { HERO_SLIDER_MAX_ITEMS } from "@/components/editor/types";
import {
  type AiPageImageDefaults,
  type AiPageImageTheme,
  type ThemedSlidePreset,
  gallerySlotSrc,
  getAiPageDefaultImages,
  heroCopyForAiTheme,
  inferAiPageImageTheme,
  isHotelLikeDescription,
  isPersonalDailyDescription,
  normalizeGeneratedImageSrc,
  themedSlidePresets,
} from "@/lib/ai-page-theme-images";

export type AiGeneratedCard = {
  type: string;
  content: Record<string, unknown>;
  order: number;
};

const GENERIC_HERO_TITLES = new Set([
  "infomii hotel",
  "まとめページ",
  "guest guide",
  "ようこそ",
  "旅行のしおり",
  "推し活まとめ",
]);

const GENERIC_WELCOME_MESSAGES = [
  "ごゆっくりお過ごしください",
  "ご宿泊ありがとうございます",
  "館内案内をスマートにまとめました",
];

function normalizeText(value: unknown, maxLen = 300): string {
  return String(value ?? "").trim().slice(0, maxLen);
}

function firstSentence(text: string, maxLen = 48): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const m = trimmed.match(/^[^。．!\n?？]+/);
  return (m?.[0] ?? trimmed).trim().slice(0, maxLen);
}

function secondSentence(text: string, maxLen = 80): string {
  const parts = text.split(/[。．!\n?？]/).map((p) => p.trim()).filter(Boolean);
  return (parts[1] ?? parts[0] ?? "").slice(0, maxLen);
}

function isGenericHeroTitle(title: string): boolean {
  const t = title.trim().toLowerCase();
  return !t || GENERIC_HERO_TITLES.has(t);
}

function isGenericWelcomeMessage(message: string): boolean {
  const m = message.trim();
  if (!m) return true;
  return GENERIC_WELCOME_MESSAGES.some((g) => m.includes(g));
}

function pickHeroCopy(
  cards: AiGeneratedCard[],
  description: string,
  theme: AiPageImageTheme,
): { title: string; subtitle: string } {
  const hero = cards.find((c) => c.type === "hero");
  const welcome = cards.find((c) => c.type === "welcome");
  const heroContent = hero?.content ?? {};
  const welcomeContent = welcome?.content ?? {};

  let title = normalizeText(heroContent.title, 80);
  let subtitle = normalizeText(heroContent.subtitle, 120);

  if (isGenericHeroTitle(title)) {
    title = normalizeText(welcomeContent.title, 80);
  }
  if (isGenericHeroTitle(title)) {
    title = firstSentence(description, 40) || heroCopyForAiTheme(theme).title;
  }

  if (!subtitle) {
    subtitle = normalizeText(welcomeContent.message, 120);
  }
  if (!subtitle || isGenericWelcomeMessage(subtitle)) {
    subtitle = secondSentence(description, 100) || heroCopyForAiTheme(theme).subtitle;
  }

  return { title, subtitle };
}

function buildHeroContent(
  cards: AiGeneratedCard[],
  description: string,
  theme: AiPageImageTheme,
  img: AiPageImageDefaults,
): Record<string, unknown> {
  const copy = pickHeroCopy(cards, description, theme);
  return {
    title: copy.title,
    subtitle: copy.subtitle,
    image: img.primary,
  };
}

function mergeSlideCaptions(
  presets: ThemedSlidePreset[],
  aiSlides: unknown,
): Array<Record<string, unknown>> {
  const fromAi = Array.isArray(aiSlides) ? aiSlides : [];
  return presets.slice(0, HERO_SLIDER_MAX_ITEMS).map((preset, index) => {
    const row = fromAi[index];
    const ai =
      row && typeof row === "object" ? (row as Record<string, unknown>) : {};
    const caption = normalizeText(ai.caption, 80) || preset.caption;
    const alt = normalizeText(ai.alt, 80) || preset.alt;
    return {
      src: preset.src,
      alt,
      caption,
      linkEnabled: false,
      linkType: "internal",
      href: "",
      openInNewTab: false,
    };
  });
}

function buildHeroSliderContent(
  description: string,
  theme: AiPageImageTheme,
  img: AiPageImageDefaults,
  existing?: Record<string, unknown>,
): Record<string, unknown> {
  const presets = themedSlidePresets(theme, img);
  const personal = isPersonalDailyDescription(description);
  return {
    title: normalizeText(existing?.title, 80) || (personal ? "思い出フォト" : "フォトギャラリー"),
    autoplay: existing?.autoplay !== false,
    intervalSec: 4,
    transitionEnabled: true,
    transitionType: "fade",
    transitionDurationMs: 500,
    showCaptions: true,
    height: "s",
    slides: mergeSlideCaptions(presets, existing?.slides),
  };
}

function enrichCardContent(
  type: string,
  content: Record<string, unknown>,
  description: string,
  theme: AiPageImageTheme,
  img: AiPageImageDefaults,
): Record<string, unknown> {
  switch (type) {
    case "hero": {
      const copy = pickHeroCopy([{ type: "hero", content, order: 0 }], description, theme);
      const title = normalizeText(content.title, 80);
      const subtitle = normalizeText(content.subtitle, 120);
      return {
        title: title && !isGenericHeroTitle(title) ? title : copy.title,
        subtitle: subtitle && !isGenericWelcomeMessage(subtitle) ? subtitle : copy.subtitle,
        image: img.primary,
      };
    }
    case "hero_slider":
      return buildHeroSliderContent(description, theme, img, content);
    case "image":
      return {
        src: normalizeGeneratedImageSrc(content.src, img.primary),
        alt: normalizeText(content.alt, 120) || pickHeroCopy([], description, theme).title,
      };
    case "gallery": {
      const items = Array.isArray(content.items) ? content.items : [];
      const normalized = items.slice(0, 8).map((item, index) => {
        const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        return {
          src: normalizeGeneratedImageSrc(row.src, gallerySlotSrc(index, img)),
          alt: normalizeText(row.alt, 120) || `photo-${index + 1}`,
        };
      });
      return {
        title: normalizeText(content.title, 80),
        items:
          normalized.length > 0
            ? normalized
            : [
                { src: gallerySlotSrc(0, img), alt: "photo-1" },
                { src: gallerySlotSrc(1, img), alt: "photo-2" },
              ],
      };
    }
    case "welcome": {
      const copy = pickHeroCopy([{ type: "welcome", content, order: 0 }], description, theme);
      const title = normalizeText(content.title, 80);
      const message = normalizeText(content.message, 400);
      return {
        title: title && title !== "ようこそ" ? title : copy.title,
        message: message && !isGenericWelcomeMessage(message) ? message : copy.subtitle,
      };
    }
    case "heading_body":
      return {
        title: normalizeText(content.title, 80) || firstSentence(description, 40) || "ひとこと",
        body:
          normalizeText(content.body, 600) ||
          secondSentence(description, 200) ||
          "当日の予定や連絡先を、このページにまとめています。",
        dividerEnabled: false,
        dividerStyle: "solid",
      };
    case "highlight":
      return {
        title: normalizeText(content.title, 80) || "大事な連絡",
        body:
          normalizeText(content.body, 400) ||
          "変更があったらチャットで一声。集合場所は下の地図を見てね。",
        accent: content.accent === "amber" || content.accent === "rose" ? content.accent : "amber",
      };
    default:
      return content;
  }
}

function enrichSingleCard(
  card: AiGeneratedCard,
  description: string,
  theme: AiPageImageTheme,
  img: AiPageImageDefaults,
): AiGeneratedCard {
  return {
    ...card,
    content: enrichCardContent(card.type, card.content, description, theme, img),
  };
}

function insertCard(
  cards: AiGeneratedCard[],
  card: AiGeneratedCard,
  index: number,
): AiGeneratedCard[] {
  const next = [...cards];
  next.splice(index, 0, card);
  return next.map((c, i) => ({ ...c, order: i }));
}

/**
 * Apply themed local images and contextual copy to AI-generated cards.
 * Images always come from /public (no generative image API).
 */
export function finalizeAiPageCards(cards: AiGeneratedCard[], description: string): AiGeneratedCard[] {
  const theme = inferAiPageImageTheme(description);
  const img = getAiPageDefaultImages(theme);
  const personal = isPersonalDailyDescription(description);
  const hotel = isHotelLikeDescription(description);

  let list = cards.map((c) => enrichSingleCard(c, description, theme, img));

  const heroIndex = list.findIndex((c) => c.type === "hero");
  if (heroIndex >= 0) {
    list[heroIndex] = {
      ...list[heroIndex],
      content: buildHeroContent(list, description, theme, img),
    };
  } else {
    list = insertCard(
      list,
      { type: "hero", content: buildHeroContent(list, description, theme, img), order: 0 },
      0,
    );
  }

  if (personal && !hotel) {
    const sliderIndex = list.findIndex((c) => c.type === "hero_slider");
    if (sliderIndex >= 0) {
      list[sliderIndex] = {
        ...list[sliderIndex],
        content: buildHeroSliderContent(description, theme, img, list[sliderIndex].content),
      };
    } else {
      list = insertCard(
        list,
        {
          type: "hero_slider",
          content: buildHeroSliderContent(description, theme, img),
          order: 1,
        },
        1,
      );
    }
  }

  return list.map((c, i) => ({ ...c, order: i }));
}
