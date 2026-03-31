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
  infoBg: string;
  infoBorder: string;
  guideBg: string;
  guideBorder: string;
  cautionBg: string;
  cautionBorder: string;
};

const PALETTES: Record<TemplateThemeId, ThemePalette> = {
  classic: {
    pageFrom: "#f8fafc",
    pageTo: "#eef2f7",
    pageAngle: 180,
    heroBg: "#0f172a",
    heroBorder: "#0f172a",
    heroText: "#ffffff",
    neutralBg: "#ffffff",
    neutralBorder: "#e2e8f0",
    infoBg: "#f7fbff",
    infoBorder: "#cfe2ff",
    guideBg: "#f3fbf8",
    guideBorder: "#c7eadf",
    cautionBg: "#fffaf3",
    cautionBorder: "#f8d9ac",
  },
  cool: {
    pageFrom: "#f3f8ff",
    pageTo: "#e9f2ff",
    pageAngle: 170,
    heroBg: "#1e40af",
    heroBorder: "#1d4ed8",
    heroText: "#eff6ff",
    neutralBg: "#ffffff",
    neutralBorder: "#dbe4f0",
    infoBg: "#f2f8ff",
    infoBorder: "#bfd8ff",
    guideBg: "#f2fbff",
    guideBorder: "#bde6f7",
    cautionBg: "#fafbff",
    cautionBorder: "#d6dff5",
  },
  warm: {
    pageFrom: "#fff9f3",
    pageTo: "#fff2e5",
    pageAngle: 165,
    heroBg: "#92400e",
    heroBorder: "#b45309",
    heroText: "#fff7ed",
    neutralBg: "#fffefb",
    neutralBorder: "#f0dcc4",
    infoBg: "#fff8ef",
    infoBorder: "#f3d5b5",
    guideBg: "#fffdf7",
    guideBorder: "#f2e4c6",
    cautionBg: "#fff4e8",
    cautionBorder: "#f2c89a",
  },
  luxury: {
    pageFrom: "#f7f6f3",
    pageTo: "#ece8df",
    pageAngle: 170,
    heroBg: "#262626",
    heroBorder: "#3f3f46",
    heroText: "#fafaf9",
    neutralBg: "#ffffff",
    neutralBorder: "#ddd6c8",
    infoBg: "#f7f5ef",
    infoBorder: "#ddd3bf",
    guideBg: "#f4f3ee",
    guideBorder: "#d9d5ca",
    cautionBg: "#fbf6ef",
    cautionBorder: "#e2cfb8",
  },
};

function colorSetForType(type: string, palette: ThemePalette): { backgroundColor: string; borderColor: string; textColor?: string } {
  if (type === "hero") {
    return { backgroundColor: palette.heroBg, borderColor: palette.heroBorder, textColor: palette.heroText };
  }
  // Only a subset of blocks gets accent tint; others stay neutral for natural look.
  if (["notice", "emergency"].includes(type)) {
    return { backgroundColor: palette.cautionBg, borderColor: palette.cautionBorder };
  }
  if (["wifi", "checklist", "steps"].includes(type)) {
    return { backgroundColor: palette.infoBg, borderColor: palette.infoBorder };
  }
  if (["nearby", "map", "pageLinks"].includes(type)) {
    return { backgroundColor: palette.guideBg, borderColor: palette.guideBorder };
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
    if (colorSet.textColor) {
      nextStyle.textColor = colorSet.textColor;
    } else {
      delete nextStyle.textColor;
    }
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

