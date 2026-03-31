export type TemplateThemeId = "classic" | "cool" | "warm" | "luxury";

export const TEMPLATE_THEMES: Array<{ id: TemplateThemeId; label: string }> = [
  { id: "classic", label: "クラシック" },
  { id: "cool", label: "クール" },
  { id: "warm", label: "ウォーム" },
  { id: "luxury", label: "ラグジュアリー" },
];

const STYLE_KEY = "_style";
const PAGE_STYLE_KEY = "_pageStyle";

type ThemePalette = {
  pageFrom: string;
  pageTo: string;
  pageAngle: number;
  heroBg: string;
  heroBorder: string;
  heroText: string;
  neutralBg: string;
  neutralBorder: string;
  blueBg: string;
  blueBorder: string;
  warmBg: string;
  warmBorder: string;
  mintBg: string;
  mintBorder: string;
  alertBg: string;
  alertBorder: string;
};

const PALETTES: Record<TemplateThemeId, ThemePalette> = {
  classic: {
    pageFrom: "#f8fafc",
    pageTo: "#e2e8f0",
    pageAngle: 180,
    heroBg: "#0f172a",
    heroBorder: "#0f172a",
    heroText: "#ffffff",
    neutralBg: "#ffffff",
    neutralBorder: "#e2e8f0",
    blueBg: "#eff6ff",
    blueBorder: "#bfdbfe",
    warmBg: "#fefce8",
    warmBorder: "#fde68a",
    mintBg: "#ecfeff",
    mintBorder: "#a5f3fc",
    alertBg: "#fff7ed",
    alertBorder: "#fdba74",
  },
  cool: {
    pageFrom: "#eff6ff",
    pageTo: "#dbeafe",
    pageAngle: 170,
    heroBg: "#1e3a8a",
    heroBorder: "#1d4ed8",
    heroText: "#eff6ff",
    neutralBg: "#f8fafc",
    neutralBorder: "#cbd5e1",
    blueBg: "#e0f2fe",
    blueBorder: "#7dd3fc",
    warmBg: "#f1f5f9",
    warmBorder: "#cbd5e1",
    mintBg: "#e0f7fa",
    mintBorder: "#67e8f9",
    alertBg: "#fef2f2",
    alertBorder: "#fca5a5",
  },
  warm: {
    pageFrom: "#fff7ed",
    pageTo: "#ffedd5",
    pageAngle: 165,
    heroBg: "#7c2d12",
    heroBorder: "#9a3412",
    heroText: "#fff7ed",
    neutralBg: "#fffbeb",
    neutralBorder: "#fed7aa",
    blueBg: "#fffbeb",
    blueBorder: "#fdba74",
    warmBg: "#fef3c7",
    warmBorder: "#f59e0b",
    mintBg: "#fef9c3",
    mintBorder: "#facc15",
    alertBg: "#ffedd5",
    alertBorder: "#fb923c",
  },
  luxury: {
    pageFrom: "#111827",
    pageTo: "#1f2937",
    pageAngle: 175,
    heroBg: "#111827",
    heroBorder: "#374151",
    heroText: "#f8fafc",
    neutralBg: "#1f2937",
    neutralBorder: "#475569",
    blueBg: "#1e293b",
    blueBorder: "#334155",
    warmBg: "#27272a",
    warmBorder: "#52525b",
    mintBg: "#1f2937",
    mintBorder: "#4b5563",
    alertBg: "#3f3f46",
    alertBorder: "#71717a",
  },
};

function colorSetForType(type: string, palette: ThemePalette): { backgroundColor: string; borderColor: string; textColor?: string } {
  if (type === "hero") {
    return { backgroundColor: palette.heroBg, borderColor: palette.heroBorder, textColor: palette.heroText };
  }
  if (["notice", "emergency"].includes(type)) {
    return { backgroundColor: palette.alertBg, borderColor: palette.alertBorder };
  }
  if (["wifi", "checklist", "steps", "kpi", "schedule"].includes(type)) {
    return { backgroundColor: palette.blueBg, borderColor: palette.blueBorder };
  }
  if (["breakfast", "menu", "restaurant", "spa"].includes(type)) {
    return { backgroundColor: palette.warmBg, borderColor: palette.warmBorder };
  }
  if (["nearby", "map", "pageLinks", "taxi"].includes(type)) {
    return { backgroundColor: palette.mintBg, borderColor: palette.mintBorder };
  }
  return { backgroundColor: palette.neutralBg, borderColor: palette.neutralBorder };
}

export function applyThemeToTemplateCards(
  cards: Array<{ type: string; content?: Record<string, unknown>; order?: number }>,
  themeId: TemplateThemeId
): Array<{ type: string; content?: Record<string, unknown>; order?: number }> {
  const palette = PALETTES[themeId] ?? PALETTES.classic;
  return cards.map((card, index) => {
    const content = { ...(card.content ?? {}) };
    const existingStyle =
      STYLE_KEY in content && typeof content[STYLE_KEY] === "object" && content[STYLE_KEY] != null
        ? (content[STYLE_KEY] as Record<string, unknown>)
        : {};
    const colorSet = colorSetForType(card.type, palette);
    const nextStyle: Record<string, unknown> = {
      ...existingStyle,
      backgroundColor: colorSet.backgroundColor,
      borderColor: colorSet.borderColor,
    };
    if (colorSet.textColor) nextStyle.textColor = colorSet.textColor;
    const nextContent: Record<string, unknown> = {
      ...content,
      [STYLE_KEY]: nextStyle,
    };
    if (index === 0) {
      nextContent[PAGE_STYLE_KEY] = {
        background: {
          mode: "gradient",
          color: palette.pageFrom,
          from: palette.pageFrom,
          to: palette.pageTo,
          angle: palette.pageAngle,
        },
      };
    }
    return {
      ...card,
      content: nextContent,
    };
  });
}

