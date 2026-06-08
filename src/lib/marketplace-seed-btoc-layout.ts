import { block, type CardDraft, type MarketplaceSeedCardType } from "@/lib/marketplace-seed-types";

/** Seed card builder (alias for readability in BtoC templates). */
export function btocBlock(type: MarketplaceSeedCardType, content: Record<string, unknown>): CardDraft {
  return block(type, content);
}

/** Visual break between major sections. */
export function sectionDivider(variant: "line" | "dotted" = "line"): CardDraft {
  return block("divider", { style: variant });
}

/** Section title with underline between title and lead copy. */
export function sectionHeading(title: string, lead = ""): CardDraft {
  return block("heading_body", {
    title,
    body: lead,
    dividerEnabled: true,
    dividerStyle: "solid",
  });
}

/** Top quick-nav tiles (placed right after hero via `ordered()` + seed placement rules). */
export function hubLinks(
  title: string,
  items: Array<{ label: string; icon: string }>,
  columns: 2 | 3 | 4 = 2,
): CardDraft {
  return block("pageLinks", {
    title,
    columns,
    iconSize: "md",
    styleVariant: "tile",
    tileShadowStrength: "md",
    circleIconShadowStrength: "md",
    items: items.map((item) => ({ ...item, linkType: "page", pageSlug: "", link: "" })),
  });
}

/** Compact icon row for secondary actions (optional; use when pageLinks is not enough). */
export function quickIconRow(items: Array<{ label: string; icon: string }>): CardDraft {
  return block("iconRow", {
    iconRowBackgroundColor: "#f8fafc",
    iconSize: "lg",
    iconItems: items.map((item, index) => ({
      id: `quick-${index + 1}`,
      icon: item.icon,
      label: item.label,
      link: "",
    })),
  });
}
