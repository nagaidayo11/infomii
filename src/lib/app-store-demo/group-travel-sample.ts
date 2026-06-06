import type { CardType, EditorCard } from "@/components/editor/types";
import { BTOC_MARKETPLACE_SEED_TEMPLATES } from "@/lib/marketplace-seed-btoc";
import type { PageBackgroundStyle } from "@/lib/storage";

/** Marketing-only slug shown in App Store screenshots (no live /v/ page required). */
export const APP_STORE_SAMPLE_SLUG = "okinawa-group-sample";

export const APP_STORE_SAMPLE_PUBLIC_URL = `https://www.infomii.com/v/${APP_STORE_SAMPLE_SLUG}`;

export const APP_STORE_SAMPLE_PAGE_TITLE = "沖縄、3泊5人";

/** Static demo page used for guest-view screenshots. */
export const APP_STORE_SAMPLE_DEMO_PATH = "/demo/okinawa-group-sample";

export const APP_STORE_SAMPLE_TEMPLATE_SLUG = "travel-group";

const groupTemplate = BTOC_MARKETPLACE_SEED_TEMPLATES.find(
  (t) => t.slug === APP_STORE_SAMPLE_TEMPLATE_SLUG,
);

export function getGroupTravelSampleEditorCards(): EditorCard[] {
  if (!groupTemplate) return [];
  return groupTemplate.cards.map((card, index) => {
    const content =
      card.type === "pageLinks"
        ? { ...card.content, columns: 2, styleVariant: "tile", iconSize: "md" }
        : card.content;
    return {
      id: `group-sample-${index}`,
      type: card.type as CardType,
      content,
      order: typeof card.order === "number" ? card.order : index,
      style: {},
    };
  });
}

export const GROUP_TRAVEL_SAMPLE_PAGE_BACKGROUND: PageBackgroundStyle = {
  mode: "solid",
  color: "#ffffff",
  from: "#ffffff",
  to: "#ffffff",
  angle: 180,
};
