import { NextResponse } from "next/server";
import { getSupabaseAdminServerClient } from "@/lib/server/supabase-server";
import { templatePreviewPublicPath } from "@/lib/template-preview";
import { MARKETPLACE_SEED_TEMPLATES } from "@/lib/marketplace-seed-templates";
import {
  ensurePageLinksAfterOpening,
  stripDeprecatedIconCards,
  templateCardsContainIcon,
} from "@/lib/template-marketplace";

type SeedTemplate = {
  name: string;
  description: string;
  preview_image: string;
  category: string | null;
  cards: Array<{ type: string; content: Record<string, unknown>; order: number }>;
};

const DEFAULT_HERO_IMAGE = "/preset-hero-sample.png";
const DEFAULT_PREVIEW_IMAGE = "/preset-hero-sample.png";

const THEME_IMAGE_SETS: Record<string, { hero: string; details: string[] }> = {
  business: {
    hero: "/template-business-hero-01.jpg",
    details: ["/template-business-detail-01.jpg", "/template-business-detail-02.jpg", "/template-business-detail-03.jpg"],
  },
  resort: {
    hero: "/template-resort-hero-01.jpg",
    details: ["/template-resort-detail-01.jpg", "/template-resort-detail-02.jpg", "/template-resort-detail-03.jpg"],
  },
  ryokan: {
    hero: "/template-ryokan-hero-01.jpg",
    details: ["/template-ryokan-detail-01.jpg", "/template-ryokan-detail-02.jpg", "/template-ryokan-detail-03.jpg"],
  },
  airbnb: {
    hero: "/template-airbnb-hero-01.jpg",
    details: ["/template-airbnb-detail-01.jpg", "/template-airbnb-detail-02.jpg", "/template-airbnb-detail-03.jpg"],
  },
  guide: {
    hero: "/template-guide-hero-01.jpg",
    details: ["/template-guide-detail-01.jpg", "/template-guide-detail-02.jpg", "/template-guide-detail-03.jpg"],
  },
  inbound: {
    hero: "/template-inbound-hero-01.jpg",
    details: ["/template-inbound-detail-01.jpg", "/template-inbound-detail-02.jpg", "/template-inbound-detail-03.jpg"],
  },
  default: {
    hero: DEFAULT_HERO_IMAGE,
    details: [DEFAULT_HERO_IMAGE, DEFAULT_HERO_IMAGE, DEFAULT_HERO_IMAGE],
  },
};

function galleryItemsForCategory(
  category: string | null,
  categoryIndex: number,
): Array<{ src: string; alt: string }> {
  const key = category && THEME_IMAGE_SETS[category] ? category : "default";
  const base = THEME_IMAGE_SETS[key].details.map((src, i) => ({ src, alt: `gallery-${i + 1}` }));
  return rotate(base, categoryIndex);
}

function applyTemplateMediaDefaults(template: SeedTemplate, categoryIndex: number): SeedTemplate {
  const previewPath = templatePreviewPublicPath(template.category, template.name);
  const cards = template.cards.map((card) => ({
    ...card,
    content: { ...(card.content ?? {}) },
  }));

  // Per-template hero + listing preview: same local path (see public/templates/previews/...).
  for (const card of cards) {
    if (card.type !== "hero") continue;
    card.content.image = previewPath;
  }

  // Fill gallery image sources with category-aware samples.
  for (const card of cards) {
    if (card.type !== "gallery") continue;
    const items = Array.isArray(card.content.items) ? card.content.items : [];
    const sampleItems = galleryItemsForCategory(template.category, categoryIndex);
    const nextItems =
      items.length > 0
        ? items.map((item, idx) => {
            const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
            const src = typeof row.src === "string" ? row.src.trim() : "";
            return {
              ...row,
              src: src || sampleItems[idx % sampleItems.length]?.src || "",
              alt:
                (typeof row.alt === "string" && row.alt.trim()) ||
                sampleItems[idx % sampleItems.length]?.alt ||
                `gallery-${idx + 1}`,
            };
          })
        : sampleItems;
    card.content.items = nextItems;
    if (!("title" in card.content)) card.content.title = "ギャラリー";
  }

  const hasHero = cards.some((c) => c.type === "hero");
  const hasGallery = cards.some((c) => c.type === "gallery");
  const shouldAddHero = !hasHero && ["resort", "guide", "inbound"].includes(template.category ?? "");
  const shouldAddGallery = !hasGallery && ["resort", "guide", "ryokan"].includes(template.category ?? "");

  if (shouldAddHero) {
    cards.unshift({
      type: "hero",
      content: {
        title: template.name,
        subtitle: template.description,
        image: previewPath,
      },
      order: 0,
    });
  }

  if (shouldAddGallery) {
    cards.splice(Math.min(2, cards.length), 0, {
      type: "gallery",
      content: {
        title: "施設・周辺イメージ",
        columns: 2,
        items: galleryItemsForCategory(template.category, categoryIndex),
      },
      order: 0,
    });
  }

  return {
    ...template,
    preview_image: previewPath || DEFAULT_PREVIEW_IMAGE,
    cards: cards.map((card, index) => ({ ...card, order: index })),
  };
}

function rotate<T>(arr: T[], offset: number): T[] {
  if (arr.length === 0) return arr;
  const n = ((offset % arr.length) + arr.length) % arr.length;
  return [...arr.slice(n), ...arr.slice(0, n)];
}

function buildCardContentByType(type: string): Record<string, unknown> {
  switch (type) {
    case "kpi":
      return {
        title: "クイック情報",
        items: [
          { label: "チェックイン", value: "15:00" },
          { label: "チェックアウト", value: "10:00" },
          { label: "フロント", value: "内線 9" },
        ],
      };
    case "schedule":
      return {
        title: "営業時間",
        items: [
          { day: "朝食", time: "7:00-9:30", label: "1F レストラン" },
          { day: "フロント", time: "24時間", label: "対応可" },
        ],
      };
    case "steps":
      return {
        title: "ご利用ステップ",
        items: [
          { title: "Step 1", description: "必要情報を確認" },
          { title: "Step 2", description: "施設をご利用" },
          { title: "Step 3", description: "チェックアウト手続き" },
        ],
      };
    case "checklist":
      return {
        title: "チェックリスト",
        items: [
          { text: "鍵を持った", checked: false },
          { text: "Wi-Fiを確認した", checked: false },
          { text: "出発前に忘れ物確認", checked: false },
        ],
      };
    case "quote":
      return { quote: "案内が分かりやすく、迷わず使えました。", author: "ゲストレビュー" };
    case "faq":
      return {
        title: "よくある質問",
        items: [
          { q: "チェックインは何時から？", a: "15:00以降です。" },
          { q: "困った時の連絡先は？", a: "フロントへご連絡ください。" },
        ],
      };
    case "menu":
      return {
        title: "おすすめメニュー",
        items: [
          { name: "季節メニュー", price: "1,200円", description: "日替わり提供" },
          { name: "ドリンク", price: "500円", description: "ラウンジで提供" },
        ],
      };
    case "wifi":
      return {
        title: "Wi-Fi案内",
        ssid: "Infomii-Guest",
        password: "guest2026",
        description: "接続しづらい場合はフロントへご連絡ください。",
      };
    case "checkout":
      return {
        title: "チェックアウト手順",
        time: "10:00",
        note: "混雑を避ける場合は早めの手続きをお願いします。",
        linkUrl: "",
        linkLabel: "延長申請はこちら",
      };
    case "emergency":
      return {
        title: "緊急連絡先",
        fire: "119",
        police: "110",
        hospital: "地域医療センター",
        note: "体調不良時はフロントへご連絡ください。",
      };
    case "restaurant":
      return {
        title: "お食事のご案内",
        breakfast: "7:00-9:30（1F レストラン）",
        dinner: "18:00-21:00（ラストオーダー 20:30）",
        note: "混雑時は時間をずらしてご利用ください。",
      };
    case "map":
      return {
        title: "アクセスマップ",
        address: "施設住所を入力してください",
        mapEmbedUrl: "",
      };
    case "gallery":
      return { title: "ギャラリー", columns: 2, items: [] };
    case "pageLinks":
      return {
        title: "関連ページ",
        columns: 3,
        iconSize: "md",
        items: [
          { label: "朝食", icon: "utensils", linkType: "page", pageSlug: "", link: "" },
          { label: "Wi-Fi", icon: "wifi", linkType: "page", pageSlug: "", link: "" },
          { label: "周辺", icon: "map-pin", linkType: "page", pageSlug: "", link: "" },
        ],
      };
    case "nearby":
      return {
        title: "周辺案内",
        items: [
          { name: "コンビニ", description: "徒歩3分", link: "" },
          { name: "駅", description: "徒歩8分", link: "" },
        ],
      };
    case "taxi":
      return { title: "タクシー", phone: "03-1234-5678", companyName: "○○タクシー", note: "" };
    case "notice":
      return { title: "お知らせ", body: "最新情報はこのページでご確認ください。", variant: "info" };
    default:
      return { title: "ご案内", content: "詳細をご確認ください。" };
  }
}

/** Hand-authored seeds with 6+ blocks skip pool/required auto-fill to preserve curated stories. */
const CURATED_MIN_CARD_COUNT = 6;

function diversifyTemplateBlocks(template: SeedTemplate, templateIndexInCategory: number): SeedTemplate {
  const categoryKey = template.category ?? "default";
  const blockedByCategory: Record<string, Set<string>> = {
    // ビジホは「温浴特化」を外して業務導線重視に
    business: new Set(["spa"]),
    // リゾートは体験訴求を優先しつつ、必須案内は残す
    resort: new Set(),
    // 旅館はKPIよりも体験・作法を重視
    ryokan: new Set(["kpi"]),
    // Airbnbはホテル運用寄りの要素を除外
    airbnb: new Set(["kpi", "spa", "restaurant"]),
    // 観光ガイドは重い運用ブロックを除外
    guide: new Set(["laundry", "spa"]),
    // インバウンドは言語・移動・連絡を重視（必須案内は残す）
    inbound: new Set(["laundry", "spa"]),
    default: new Set(),
  };
  const blocked = blockedByCategory[categoryKey] ?? blockedByCategory.default;

  const cards = template.cards
    .filter((card) => card.type !== "icon" && !blocked.has(card.type))
    .map((card) => ({ ...card, content: { ...(card.content ?? {}) } }));

  if (cards.length >= CURATED_MIN_CARD_COUNT) {
    return {
      ...template,
      cards: cards.map((card, index) => ({ ...card, order: index })),
    };
  }

  const existingTypes = new Set(cards.map((card) => card.type));

  const requiredByCategory: Record<string, string[]> = {
    // S基準の必須要素: 到着導線 + Wi-Fi + 食事 + checkout + emergency
    business: ["hero", "steps", "wifi", "restaurant", "checkout", "emergency", "faq"],
    resort: ["hero", "gallery", "wifi", "menu", "checkout", "emergency", "steps", "notice"],
    ryokan: ["hero", "welcome", "wifi", "restaurant", "checkout", "emergency", "steps", "notice"],
    airbnb: ["hero", "steps", "wifi", "menu", "checklist", "checkout", "emergency", "notice"],
    guide: ["hero", "map", "wifi", "menu", "checkout", "emergency", "nearby", "faq"],
    inbound: ["hero", "notice", "wifi", "menu", "checkout", "emergency", "pageLinks", "faq"],
    default: ["hero", "steps", "wifi", "menu", "checkout", "emergency", "faq"],
  };

  const pools: Record<string, string[]> = {
    business: ["kpi", "schedule", "steps", "faq", "taxi", "checklist", "quote"],
    resort: ["gallery", "spa", "menu", "quote", "pageLinks", "schedule", "button"],
    ryokan: ["welcome", "notice", "spa", "restaurant", "steps", "quote", "faq"],
    airbnb: ["steps", "checklist", "wifi", "nearby", "emergency", "notice", "faq"],
    guide: ["nearby", "pageLinks", "map", "taxi", "faq", "quote", "schedule"],
    inbound: ["welcome", "notice", "pageLinks", "wifi", "emergency", "faq", "steps"],
    default: ["kpi", "steps", "faq", "checklist", "nearby"],
  };
  const advanced = new Set(["kpi", "gallery", "pageLinks", "steps", "schedule", "checklist", "menu", "faq", "quote"]);
  const categoryPool = rotate(
    (pools[categoryKey] ?? pools.default).filter((type) => !blocked.has(type)),
    templateIndexInCategory,
  );
  const desiredUnique = Math.min(8, Math.max(6, cards.length));

  const countAdvanced = () => cards.filter((card) => advanced.has(card.type)).length;

  const requiredSet = (requiredByCategory[categoryKey] ?? requiredByCategory.default).filter(
    (type) => !blocked.has(type),
  );
  for (const type of requiredSet) {
    if (existingTypes.has(type)) continue;
    if (cards.length >= 10) {
      // Keep hard-required cards even at max capacity by evicting a non-required tail card.
      const removableIndex = [...cards]
        .reverse()
        .findIndex((card) => !requiredSet.includes(card.type) && card.type !== "hero");
      if (removableIndex >= 0) {
        const idx = cards.length - 1 - removableIndex;
        const [removed] = cards.splice(idx, 1);
        if (removed?.type) existingTypes.delete(removed.type);
      } else {
        continue;
      }
    }
    cards.push({
      type,
      content: buildCardContentByType(type),
      order: cards.length,
    });
    existingTypes.add(type);
  }

  for (const type of categoryPool) {
    if (cards.length >= 10) break;
    if (existingTypes.size >= desiredUnique && countAdvanced() >= 2) break;
    if (existingTypes.has(type)) continue;
    cards.push({
      type,
      content: buildCardContentByType(type),
      order: cards.length,
    });
    existingTypes.add(type);
  }

  return {
    ...template,
    cards: cards.map((card, index) => ({ ...card, order: index })),
  };
}

function normalizeTemplateComposition(template: SeedTemplate): SeedTemplate {
  const importantTypes = new Set(["hero", "summary", "wifi", "breakfast", "checkout", "faq", "cta"]);
  const cards = template.cards
    .filter((card) => card && typeof card.type === "string" && card.type !== "icon")
    .slice(0, 10)
    .map((card, index) => ({
      ...card,
      order: index,
      content: { ...(card.content ?? {}) },
    }));

  const reordered = reorderCardsByCategory(template.category, cards).map((card, index) => ({
    ...card,
    order: index,
  }));
  const withPageLinksPlacement = ensurePageLinksAfterOpening(reordered).map((card, index) => ({
    ...card,
    order: index,
  }));
  const enriched = enrichCriticalCardContent(withPageLinksPlacement);

  const hasImportant = enriched.some((card) => importantTypes.has(card.type));
  if (hasImportant) return { ...template, cards: enriched };
  return {
    ...template,
    cards: enriched.slice(0, 9),
  };
}

function reorderCardsByCategory(
  category: string | null,
  cards: Array<{ type: string; content: Record<string, unknown>; order: number }>,
): Array<{ type: string; content: Record<string, unknown>; order: number }> {
  const priorityByCategory: Record<string, string[]> = {
    business: ["hero", "pageLinks", "welcome", "heading_body", "notice", "kpi", "wifi", "schedule", "restaurant", "laundry", "checkout", "faq", "taxi", "nearby", "emergency"],
    resort: ["hero", "pageLinks", "welcome", "heading_body", "notice", "gallery", "spa", "menu", "schedule", "nearby", "map", "quote", "faq", "checkout", "emergency"],
    ryokan: ["hero", "pageLinks", "welcome", "heading_body", "notice", "spa", "restaurant", "menu", "steps", "schedule", "nearby", "map", "checkout", "faq", "emergency"],
    airbnb: ["hero", "pageLinks", "welcome", "heading_body", "notice", "steps", "checklist", "wifi", "nearby", "map", "checkout", "emergency", "faq"],
    guide: ["hero", "pageLinks", "welcome", "heading_body", "notice", "nearby", "map", "taxi", "schedule", "faq", "quote", "emergency"],
    inbound: ["hero", "pageLinks", "welcome", "heading_body", "notice", "map", "wifi", "steps", "checkout", "emergency", "faq", "taxi"],
    default: ["hero", "pageLinks", "welcome", "heading_body", "steps", "wifi", "schedule", "checkout", "nearby", "map", "faq", "emergency"],
  };
  const key = category && priorityByCategory[category] ? category : "default";
  const orderMap = new Map(priorityByCategory[key].map((type, idx) => [type, idx]));
  return [...cards].sort((a, b) => {
    const aRank = orderMap.has(a.type) ? orderMap.get(a.type)! : Number.MAX_SAFE_INTEGER;
    const bRank = orderMap.has(b.type) ? orderMap.get(b.type)! : Number.MAX_SAFE_INTEGER;
    if (aRank !== bRank) return aRank - bRank;
    return a.order - b.order;
  });
}

function enrichCriticalCardContent(
  cards: Array<{ type: string; content: Record<string, unknown>; order: number }>,
): Array<{ type: string; content: Record<string, unknown>; order: number }> {
  return cards.map((card) => {
    const content = { ...(card.content ?? {}) };
    if (card.type === "wifi") {
      if (typeof content.ssid !== "string" || !content.ssid.trim()) content.ssid = "Infomii-Guest";
      if (typeof content.password !== "string" || !content.password.trim()) content.password = "guest2026";
      if (typeof content.description !== "string" || !content.description.trim()) {
        content.description = "接続しづらい場合はフロントへご連絡ください。";
      }
    }
    if (card.type === "menu") {
      if (typeof content.title !== "string" || !content.title.trim()) content.title = "朝食・お食事のご案内";
      if (Array.isArray(content.items)) {
        content.items = content.items.map((item) => {
          const row = item && typeof item === "object" ? { ...(item as Record<string, unknown>) } : {};
          if (typeof row.description !== "string" || !row.description.trim()) row.description = "朝食会場にて提供";
          return row;
        });
      }
    }
    if (card.type === "restaurant") {
      if (typeof content.breakfast !== "string" || !content.breakfast.trim()) {
        content.breakfast = "7:00-9:30（会場はフロントでご案内）";
      }
    }
    if (card.type === "checkout") {
      if (typeof content.time !== "string" || !content.time.trim()) content.time = "10:00";
      if (typeof content.note !== "string" || !content.note.trim()) {
        content.note = "混雑回避のため、早めの手続きをおすすめします。";
      }
    }
    if (card.type === "emergency") {
      if (typeof content.fire !== "string" || !content.fire.trim()) content.fire = "119";
      if (typeof content.police !== "string" || !content.police.trim()) content.police = "110";
      if (typeof content.note !== "string" || !content.note.trim()) {
        content.note = "体調不良・事故時はフロントへご連絡ください。";
      }
    }
    if (card.type === "notice" && typeof content.body === "string" && content.body.length > 110) {
      content.body = `${content.body.slice(0, 107)}...`;
    }
    if (card.type === "text" && typeof content.content === "string" && content.content.length > 100) {
      content.content = `${content.content.slice(0, 97)}...`;
    }
    for (const [key, value] of Object.entries(content)) {
      if (typeof value === "string" && value.length > 220) {
        content[key] = `${value.slice(0, 217)}...`;
      }
    }
    return { ...card, content };
  });
}

const SEED_TEMPLATES: SeedTemplate[] = MARKETPLACE_SEED_TEMPLATES;

// One-off hard removals from template marketplace.
const REMOVED_TEMPLATE_NAMES = [
  "ビジネスホテル・館内案内",
  "リゾートホテル・館内案内",
  "旅館・ご案内",
  "観光ガイド・スポット案内",
];

/** @internal Used by scripts/verify-seed-templates.mts */
export {
  SEED_TEMPLATES,
  applyTemplateMediaDefaults,
  diversifyTemplateBlocks,
  normalizeTemplateComposition,
};

/**
 * GET /api/seed-templates — insert any SEED_TEMPLATES rows missing from DB.
 * GET /api/seed-templates?sync=1 — also UPDATE existing rows (preview_image → /templates/previews/<category>/<slug>.jpg, cards, description, category),
 *   and DELETE any `templates` row whose `name` is not in `SEED_TEMPLATES` (removes legacy marketplace titles / broken preview rows).
 * After deploying `public/templates/previews/**`, run sync once per environment so Supabase matches the on-disk assets.
 */
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseAdminServerClient();
    const { searchParams } = new URL(request.url);
    const syncParam = searchParams.get("sync");

    const { data: existing, error: existingError } = await supabase
      .from("templates")
      .select("id, name, cards")
      .limit(500);
    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    const existingByName = new Map<string, { id: string; name: string; cards?: unknown }>();
    let legacyIconTemplates = 0;
    for (const row of existing ?? []) {
      const entry = row as { id: string; name: string; cards?: unknown };
      existingByName.set(entry.name, entry);
      if (templateCardsContainIcon(entry.cards)) legacyIconTemplates += 1;
    }

    const syncLatest =
      syncParam === "1" || (syncParam !== "0" && legacyIconTemplates > 0);

    const toInsert: SeedTemplate[] = [];
    let updated = 0;
    let removed = 0;

    const categoryIndexMap = new Map<string, number>();
    for (const template of SEED_TEMPLATES) {
      const categoryKey = template.category ?? "default";
      const categoryIndex = categoryIndexMap.get(categoryKey) ?? 0;
      categoryIndexMap.set(categoryKey, categoryIndex + 1);
      const mediaTemplate = applyTemplateMediaDefaults(template, categoryIndex);
      const diversifiedTemplate = diversifyTemplateBlocks(mediaTemplate, categoryIndex);
      const normalizedTemplate = normalizeTemplateComposition(diversifiedTemplate);
      const cards = stripDeprecatedIconCards(normalizedTemplate.cards);
      const payload = { ...normalizedTemplate, cards };
      const found = existingByName.get(template.name);
      if (!found) {
        toInsert.push(payload);
        continue;
      }
      if (syncLatest) {
        const { error } = await supabase
          .from("templates")
          .update({
            description: payload.description,
            preview_image: payload.preview_image,
            category: payload.category,
            cards: payload.cards,
          })
          .eq("id", found.id);
        if (!error) updated += 1;
      }
    }

    if (REMOVED_TEMPLATE_NAMES.length > 0) {
      const { data: deletedRows, error } = await supabase
        .from("templates")
        .delete()
        .in("name", REMOVED_TEMPLATE_NAMES)
        .select("id");
      if (!error) removed += deletedRows?.length ?? 0;
    }

    // Legacy rows like "○○・ゲスト向け案内" (not in current SEED_TEMPLATES).
    const { data: guestGuideRows, error: guestGuideErr } = await supabase
      .from("templates")
      .delete()
      .like("name", "%・ゲスト向け案内")
      .select("id");
    if (!guestGuideErr) removed += guestGuideRows?.length ?? 0;

    let inserted = 0;
    if (toInsert.length > 0) {
      const rows = toInsert.map(({ name, description, preview_image, category, cards }) => ({
        name,
        description,
        preview_image,
        category,
        cards,
      }));
      const { error } = await supabase.from("templates").insert(rows);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      inserted = rows.length;
    }

    // Drop any marketplace row whose name is not in the current seed (legacy titles, broken previews).
    if (syncLatest) {
      const allowedNames = new Set(SEED_TEMPLATES.map((t) => t.name));
      const { data: allRows, error: allErr } = await supabase.from("templates").select("id, name").limit(500);
      if (!allErr && allRows) {
        const orphanIds = allRows.filter((row) => !allowedNames.has(row.name)).map((r) => r.id);
        if (orphanIds.length > 0) {
          const { data: orphanDeleted, error: orphanDelErr } = await supabase
            .from("templates")
            .delete()
            .in("id", orphanIds)
            .select("id");
          if (!orphanDelErr) removed += orphanDeleted?.length ?? 0;
        }
      }
    }

    return NextResponse.json({
      seeded: inserted > 0,
      syncLatest,
      message: syncLatest ? "Templates synced to latest" : "Templates checked",
      inserted,
      updated,
      removed,
      totalSeedTemplates: SEED_TEMPLATES.length,
      legacyIconTemplates,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Seed failed" },
      { status: 500 }
    );
  }
}
