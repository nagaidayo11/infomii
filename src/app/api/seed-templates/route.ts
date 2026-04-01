import { NextResponse } from "next/server";
import { getSupabaseAdminServerClient } from "@/lib/server/supabase-server";

type SeedTemplate = {
  name: string;
  description: string;
  preview_image: string;
  category: string | null;
  cards: Array<{ type: string; content: Record<string, unknown>; order: number }>;
};

const STYLE_KEY = "_style";
const PAGE_STYLE_KEY = "_pageStyle";
const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&q=80";

const CATEGORY_GALLERY_IMAGES: Record<string, string[]> = {
  business: [
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80",
    "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1200&q=80",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
  ],
  resort: [
    "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80",
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
  ],
  ryokan: [
    "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&q=80",
    "https://images.unsplash.com/photo-1496412705862-e0088f16f791?w=1200&q=80",
    "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&q=80",
  ],
  airbnb: [
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80",
  ],
  guide: [
    "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1200&q=80",
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&q=80",
    "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1200&q=80",
  ],
  inbound: [
    "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1200&q=80",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80",
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&q=80",
  ],
  default: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
  ],
};

function galleryItemsForCategory(category: string | null): Array<{ src: string; alt: string }> {
  const key = category && CATEGORY_GALLERY_IMAGES[category] ? category : "default";
  return CATEGORY_GALLERY_IMAGES[key].map((src, i) => ({ src, alt: `gallery-${i + 1}` }));
}

function iconLabelDefaultsByCategory(category: string | null): Array<{ icon: string; label: string; description: string }> {
  switch (category) {
    case "business":
      return [
        { icon: "svg:clock", label: "チェックイン 15:00 / チェックアウト 11:00", description: "" },
        { icon: "svg:wifi", label: "Wi-Fiは全客室で利用可能", description: "" },
      ];
    case "resort":
      return [
        { icon: "svg:bath", label: "温浴施設の営業時間を事前確認", description: "" },
        { icon: "svg:utensils", label: "夕朝食の時間を先にチェック", description: "" },
      ];
    case "ryokan":
      return [
        { icon: "svg:info", label: "館内作法・静粛時間のご案内", description: "" },
        { icon: "svg:bath", label: "大浴場の時間帯をご確認ください", description: "" },
      ];
    case "airbnb":
      return [
        { icon: "svg:key", label: "チェックイン手順を先に確認", description: "" },
        { icon: "svg:bell", label: "ハウスルールの確認をお願いします", description: "" },
      ];
    case "guide":
      return [
        { icon: "svg:map-pin", label: "主要スポットの位置を把握", description: "" },
        { icon: "svg:train", label: "移動手段と所要時間を確認", description: "" },
      ];
    case "inbound":
      return [
        { icon: "svg:language", label: "英語でのサポート案内あり", description: "" },
        { icon: "svg:phone", label: "緊急連絡先を事前に保存", description: "" },
      ];
    default:
      return [
        { icon: "svg:info", label: "基本情報を先にご確認ください", description: "" },
      ];
  }
}

function applyTemplateMediaDefaults(template: SeedTemplate): SeedTemplate {
  const cards = template.cards.map((card) => ({
    ...card,
    content: { ...(card.content ?? {}) },
  }));

  // Fill missing hero image.
  for (const card of cards) {
    if (card.type !== "hero") continue;
    const image = typeof card.content.image === "string" ? card.content.image.trim() : "";
    if (!image) {
      card.content.image = DEFAULT_HERO_IMAGE;
    }
  }

  // Fill gallery image sources with category-aware samples.
  for (const card of cards) {
    if (card.type !== "gallery") continue;
    const items = Array.isArray(card.content.items) ? card.content.items : [];
    const sampleItems = galleryItemsForCategory(template.category);
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
  const iconCount = cards.filter((c) => c.type === "icon").length;
  const shouldAddHero = !hasHero && ["resort", "guide", "inbound"].includes(template.category ?? "");
  const shouldAddGallery = !hasGallery && ["resort", "guide", "ryokan"].includes(template.category ?? "");

  if (shouldAddHero) {
    cards.unshift({
      type: "hero",
      content: {
        title: template.name,
        subtitle: template.description,
        image: DEFAULT_HERO_IMAGE,
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
        items: galleryItemsForCategory(template.category),
      },
      order: 0,
    });
  }

  // Add icon-label cards when templates are text-heavy.
  if (iconCount < 2) {
    const iconDefaults = iconLabelDefaultsByCategory(template.category);
    const missing = Math.max(0, 2 - iconCount);
    const insertAt = cards.findIndex((c) => c.type !== "hero");
    const baseIndex = insertAt >= 0 ? insertAt + 1 : Math.min(2, cards.length);
    for (let i = 0; i < missing; i += 1) {
      const row = iconDefaults[i % iconDefaults.length];
      cards.splice(baseIndex + i, 0, {
        type: "icon",
        content: {
          icon: row.icon,
          label: row.label,
          description: row.description,
        },
        order: 0,
      });
    }
  }

  return {
    ...template,
    cards: cards.map((card, index) => ({ ...card, order: index })),
  };
}

function getCategoryBackground(category: string | null): {
  mode: "solid" | "gradient";
  color: string;
  from: string;
  to: string;
  angle: number;
} {
  switch (category) {
    case "business":
      return { mode: "gradient", color: "#f8fafc", from: "#f8fafc", to: "#e2e8f0", angle: 180 };
    case "resort":
      return { mode: "gradient", color: "#ecfeff", from: "#ecfeff", to: "#cffafe", angle: 160 };
    case "ryokan":
      return { mode: "gradient", color: "#fff7ed", from: "#fff7ed", to: "#ffedd5", angle: 165 };
    case "airbnb":
      return { mode: "gradient", color: "#fdf4ff", from: "#fdf4ff", to: "#f3e8ff", angle: 170 };
    case "guide":
      return { mode: "gradient", color: "#f0fdf4", from: "#f0fdf4", to: "#dcfce7", angle: 170 };
    case "inbound":
      return { mode: "gradient", color: "#eff6ff", from: "#eff6ff", to: "#dbeafe", angle: 170 };
    default:
      return { mode: "gradient", color: "#f8fafc", from: "#f8fafc", to: "#f1f5f9", angle: 180 };
  }
}

function getBaseCardStyle(type: string): Record<string, unknown> {
  const shared = {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
  };
  switch (type) {
    case "hero":
      return {
        ...shared,
        borderRadius: 18,
      };
    case "notice":
    case "emergency":
      return {
        ...shared,
        borderColor: "#fdba74",
      };
    case "wifi":
    case "checklist":
    case "steps":
      return {
        ...shared,
        borderColor: "#bfdbfe",
      };
    case "breakfast":
    case "menu":
    case "restaurant":
      return {
        ...shared,
        borderColor: "#fde68a",
      };
    case "nearby":
    case "map":
    case "pageLinks":
      return {
        ...shared,
        borderColor: "#a5f3fc",
      };
    default:
      return {
        ...shared,
        borderColor: "#e2e8f0",
      };
  }
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

function diversifyTemplateBlocks(template: SeedTemplate, templateIndexInCategory: number): SeedTemplate {
  const categoryKey = template.category ?? "default";
  const blockedByCategory: Record<string, Set<string>> = {
    // ビジホは「温浴特化」を外して業務導線重視に
    business: new Set(["spa"]),
    // リゾートは緊急連絡より体験訴求を優先
    resort: new Set(["emergency"]),
    // 旅館はKPIよりも体験・作法を重視
    ryokan: new Set(["kpi"]),
    // Airbnbはホテル運用寄りの要素を除外
    airbnb: new Set(["kpi", "spa", "restaurant"]),
    // 観光ガイドは宿泊運用ブロックを除外
    guide: new Set(["checkout", "laundry", "wifi", "restaurant"]),
    // インバウンドは運用系より言語・移動・連絡を重視
    inbound: new Set(["laundry", "spa", "restaurant"]),
    default: new Set(),
  };
  const blocked = blockedByCategory[categoryKey] ?? blockedByCategory.default;

  const cards = template.cards
    .filter((card) => !blocked.has(card.type))
    .map((card) => ({ ...card, content: { ...(card.content ?? {}) } }));
  const existingTypes = new Set(cards.map((card) => card.type));

  const requiredByCategory: Record<string, string[]> = {
    business: ["hero", "kpi", "wifi", "schedule", "checkout", "faq"],
    resort: ["hero", "gallery", "spa", "menu", "quote"],
    ryokan: ["welcome", "notice", "spa", "restaurant", "steps"],
    airbnb: ["hero", "steps", "checklist", "wifi", "emergency", "checkout"],
    guide: ["hero", "nearby", "pageLinks", "map", "taxi"],
    inbound: ["hero", "notice", "pageLinks", "wifi", "emergency", "faq"],
    default: ["hero", "steps", "faq"],
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
    if (cards.length >= 10) break;
    if (existingTypes.has(type)) continue;
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

function applyTemplateVisualStyles(template: SeedTemplate): SeedTemplate {
  const background = getCategoryBackground(template.category);
  const cards = template.cards.map((card, index) => {
    const content = { ...(card.content ?? {}) };
    const existingStyle =
      STYLE_KEY in content && typeof content[STYLE_KEY] === "object" && content[STYLE_KEY] != null
        ? (content[STYLE_KEY] as Record<string, unknown>)
        : {};
    const style = {
      ...getBaseCardStyle(card.type),
      ...existingStyle,
    };
    // Keep typography and block surface color on app defaults for visual consistency.
    delete (style as Record<string, unknown>).fontSize;
    delete (style as Record<string, unknown>).titleFontSize;
    delete (style as Record<string, unknown>).bodyFontSize;
    delete (style as Record<string, unknown>).backgroundColor;
    const nextContent: Record<string, unknown> = {
      ...content,
      [STYLE_KEY]: style,
    };
    if (index === 0) {
      nextContent[PAGE_STYLE_KEY] = {
        background,
      };
    }
    return {
      ...card,
      content: nextContent,
    };
  });
  return {
    ...template,
    cards,
  };
}

const SEED_TEMPLATES: SeedTemplate[] = [
  {
    name: "ビジネスホテル・即運用セット",
    description: "出張客向けに、Wi-Fi・朝食・ランドリー・チェックアウト導線を最適化した構成です。",
    preview_image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80",
    category: "business",
    cards: [
      { type: "hero", content: { title: "Business Stay Guide", subtitle: "必要情報を1ページで確認", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "kpi", content: { title: "クイック情報", items: [{ label: "チェックイン", value: "15:00" }, { label: "チェックアウト", value: "11:00" }, { label: "フロント内線", value: "9" }] }, order: 1 },
      { type: "wifi", content: { title: "Wi-Fi案内", ssid: "Infomii-Biz", password: "biz2026stay", description: "接続不具合はフロントへ" }, order: 2 },
      { type: "schedule", content: { title: "営業時間", items: [{ day: "朝食会場", time: "6:30-9:30", label: "1F レストラン" }, { day: "ランドリー", time: "6:00-24:00", label: "2F セルフランドリー" }] }, order: 3 },
      { type: "laundry", content: { title: "ランドリー案内", hours: "6:00-24:00", priceNote: "洗濯 300円 / 乾燥 100円(30分)", contact: "内線 9" }, order: 4 },
      { type: "checkout", content: { title: "チェックアウト手順", time: "11:00", note: "混雑を避ける場合は10:30までがおすすめです。", linkUrl: "", linkLabel: "延長申請はこちら" }, order: 5 },
      { type: "faq", content: { title: "よくある質問", items: [{ q: "領収書の宛名変更は可能ですか？", a: "フロントで対応可能です。" }, { q: "深夜チェックインはできますか？", a: "24時以降は事前連絡をお願いします。" }] }, order: 6 },
    ],
  },
  {
    name: "リゾートホテル・体験訴求セット",
    description: "館内体験とアクティビティを中心に、滞在価値を伝える構成です。",
    preview_image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80",
    category: "resort",
    cards: [
      { type: "hero", content: { title: "Resort Experience", subtitle: "非日常の滞在を満喫", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "gallery", content: { title: "館内ハイライト", columns: 2, items: [{ src: "", alt: "プール" }, { src: "", alt: "ラウンジ" }, { src: "", alt: "スパ" }, { src: "", alt: "夕景" }] }, order: 1 },
      { type: "spa", content: { title: "スパ・温泉", hours: "15:00-24:00 / 6:00-10:00", location: "2F", description: "サウナ・露天風呂あり", note: "混雑時は時間をずらしてご利用ください。" }, order: 2 },
      { type: "menu", content: { title: "リゾートダイニング", items: [{ name: "サンセットコース", price: "6,500円", description: "地元食材のフルコース" }, { name: "トロピカルモクテル", price: "980円", description: "バーラウンジ限定" }] }, order: 3 },
      { type: "action", content: { label: "アクティビティ予約", href: "#" }, order: 4 },
      { type: "quote", content: { quote: "館内で一日中楽しめる、満足度の高い滞在でした。", author: "ゲストレビュー" }, order: 5 },
    ],
  },
  {
    name: "旅館・おもてなし案内セット",
    description: "大浴場・食事処・館内作法を丁寧に伝える和風旅館向け構成です。",
    preview_image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&q=80",
    category: "ryokan",
    cards: [
      { type: "welcome", content: { title: "ご到着ありがとうございます", message: "湯と食を楽しむひとときをお過ごしください。" }, order: 0 },
      { type: "notice", content: { title: "館内のお願い", body: "23:00以降は客室廊下での会話をお控えください。", variant: "warning" }, order: 1 },
      { type: "spa", content: { title: "大浴場のご案内", hours: "15:00-24:00 / 5:30-9:30", location: "1F", description: "内湯・露天風呂", note: "刺青がある場合は貸切風呂をご利用ください。" }, order: 2 },
      { type: "restaurant", content: { title: "お食事処", time: "18:00-21:00", location: "1F お食事処", menu: "会席料理 / お子様膳あり" }, order: 3 },
      { type: "steps", content: { title: "チェックアウトまでの流れ", items: [{ title: "朝食", description: "7:00-9:00に会場へ" }, { title: "精算", description: "10:00までにフロントへ" }, { title: "お見送り", description: "玄関でスタッフがお見送りします" }] }, order: 4 },
      { type: "map", content: { title: "周辺散策", address: "○○温泉街 中央通り 1-2-3", mapEmbedUrl: "" }, order: 5 },
    ],
  },
  {
    name: "民泊・セルフチェックインセット",
    description: "セルフ運用に必要な手順、ハウスルール、緊急連絡をまとめた構成です。",
    preview_image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
    category: "airbnb",
    cards: [
      { type: "hero", content: { title: "Welcome to Your Stay", subtitle: "セルフチェックイン案内", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "steps", content: { title: "チェックイン手順", items: [{ title: "1. 入口解錠", description: "暗証番号を入力して解錠" }, { title: "2. 鍵受け取り", description: "キーボックスから受け取り" }, { title: "3. 入室", description: "室内案内を確認してご利用開始" }] }, order: 1 },
      { type: "checklist", content: { title: "ハウスルール", items: [{ text: "22時以降は静かに過ごす", checked: false }, { text: "室内は禁煙", checked: false }, { text: "ゴミは分別して廃棄", checked: false }] }, order: 2 },
      { type: "wifi", content: { title: "Wi-Fi", ssid: "Infomii-HomeStay", password: "home2026stay", description: "接続できない場合はホストへ連絡" }, order: 3 },
      { type: "emergency", content: { title: "緊急連絡先", fire: "119", police: "110", hospital: "○○クリニック 03-1111-2222", note: "ホスト直通: 090-xxxx-xxxx" }, order: 4 },
      { type: "checkout", content: { title: "チェックアウト", time: "10:00", note: "退室時にエアコンと照明OFFを確認してください。", linkUrl: "", linkLabel: "退室報告" }, order: 5 },
    ],
  },
  {
    name: "観光ガイド・回遊促進セット",
    description: "周辺スポットと移動導線を整理し、滞在中の回遊を促す構成です。",
    preview_image: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=600&q=80",
    category: "guide",
    cards: [
      { type: "hero", content: { title: "Local Guide", subtitle: "周辺のおすすめを厳選", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "nearby", content: { title: "徒歩圏スポット", items: [{ name: "朝市", description: "徒歩5分 / 7:00-11:00", link: "" }, { name: "展望台", description: "徒歩12分 / 夕景が人気", link: "" }] }, order: 1 },
      { type: "pageLinks", content: { title: "テーマ別ガイド", columns: 3, iconSize: "md", items: [{ label: "グルメ", icon: "utensils", linkType: "page", pageSlug: "", link: "" }, { label: "温泉", icon: "bath", linkType: "page", pageSlug: "", link: "" }, { label: "交通", icon: "train", linkType: "page", pageSlug: "", link: "" }] }, order: 2 },
      { type: "taxi", content: { title: "タクシー・移動", phone: "03-1234-5678", companyName: "○○タクシー", note: "主要駅まで約12分" }, order: 3 },
      { type: "map", content: { title: "ホテル所在地", address: "東京都○○区○○ 2-3-4", mapEmbedUrl: "" }, order: 4 },
      { type: "faq", content: { title: "観光FAQ", items: [{ q: "雨の日におすすめの場所は？", a: "美術館と屋内市場がおすすめです。" }, { q: "最終バス時刻は？", a: "ホテル前バス停は21:40発が最終です。" }] }, order: 5 },
    ],
  },
  {
    name: "ファミリー向け・館内回遊セット",
    description: "館内導線をわかりやすくし、子連れ滞在で必要な情報を網羅した構成です。",
    preview_image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80",
    category: "resort",
    cards: [
      { type: "hero", content: { title: "Family Stay Guide", subtitle: "お子さま連れでも安心", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "pageLinks", content: { title: "館内メニュー", columns: 2, iconSize: "lg", items: [{ label: "朝食会場", icon: "utensils", linkType: "page", pageSlug: "", link: "" }, { label: "キッズ備品", icon: "package", linkType: "page", pageSlug: "", link: "" }, { label: "駐車場", icon: "car", linkType: "page", pageSlug: "", link: "" }, { label: "周辺観光", icon: "map-pin", linkType: "page", pageSlug: "", link: "" }] }, order: 1 },
      { type: "parking", content: { title: "駐車場", capacity: "35台", fee: "1泊 800円", note: "ベビーカー積み下ろしスペースあり", address: "ホテル南側" }, order: 2 },
      { type: "breakfast", content: { title: "朝食ビュッフェ", time: "7:00-9:30", location: "1F レストラン", menu: "キッズメニューあり" }, order: 3 },
      { type: "checklist", content: { title: "出発前チェック", items: [{ text: "お子さまの忘れ物チェック", checked: false }, { text: "ルームキー返却", checked: false }, { text: "駐車券精算", checked: false }] }, order: 4 },
      { type: "quote", content: { quote: "案内が見やすく、子連れでも迷わず過ごせました。", author: "ファミリーゲスト" }, order: 5 },
    ],
  },
  {
    name: "駅前特化ビジホ・時短導線セット",
    description: "駅徒歩圏の強みを活かし、移動・チェックイン・朝の出発を最短化した構成です。",
    preview_image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80",
    category: "business",
    cards: [
      { type: "hero", content: { title: "Station Access Smart Stay", subtitle: "駅徒歩3分・最短導線で迷わない", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "kpi", content: { title: "アクセス要点", items: [{ label: "最寄駅", value: "JR ○○駅 東口" }, { label: "徒歩", value: "3分" }, { label: "始発空港バス", value: "5:40" }] }, order: 1 },
      { type: "steps", content: { title: "駅からホテルまで", items: [{ title: "Step 1", description: "東口改札を出て右へ" }, { title: "Step 2", description: "ロータリー沿いに直進 180m" }, { title: "Step 3", description: "1Fコンビニ併設ビルの上階" }] }, order: 2 },
      { type: "pageLinks", content: { title: "出張クイックメニュー", columns: 3, iconSize: "md", items: [{ label: "交通案内", icon: "train", linkType: "page", pageSlug: "", link: "" }, { label: "チェックアウト", icon: "checkout", linkType: "page", pageSlug: "", link: "" }, { label: "領収書", icon: "credit-card", linkType: "page", pageSlug: "", link: "" }] }, order: 3 },
      { type: "breakfast", content: { title: "朝食（時短対応）", time: "6:00-9:30", location: "2F レストラン", menu: "テイクアウトBOX対応（6:00-8:30）" }, order: 4 },
      { type: "taxi", content: { title: "タクシー即時手配", phone: "03-5678-1234", companyName: "駅前タクシー", note: "フロントから最短3分で配車可能" }, order: 5 },
      { type: "faq", content: { title: "ビジネスFAQ", items: [{ q: "早朝チェックアウトは可能ですか？", a: "24時間対応の自動精算機をご利用いただけます。" }, { q: "会場までの最短ルートは？", a: "フロントで当日朝に地図をお渡しします。" }] }, order: 6 },
    ],
  },
  {
    name: "インバウンド特化・多言語おもてなしセット",
    description: "海外ゲスト向けに、交通・決済・ハウスルールをわかりやすく伝える多言語運用向け構成です。",
    preview_image: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=600&q=80",
    category: "inbound",
    cards: [
      { type: "hero", content: { title: "Welcome International Guests", subtitle: "EN/JP対応の滞在ガイド", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "notice", content: { title: "Language Support", body: "Front desk supports English. Translation support available via QR.", variant: "info" }, order: 1 },
      { type: "pageLinks", content: { title: "Travel Essentials", columns: 3, iconSize: "md", items: [{ label: "Transport", icon: "train", linkType: "page", pageSlug: "", link: "" }, { label: "Local Bus", icon: "bus", linkType: "page", pageSlug: "", link: "" }, { label: "Area Map", icon: "map-pin", linkType: "page", pageSlug: "", link: "" }, { label: "Payment", icon: "credit-card", linkType: "page", pageSlug: "", link: "" }, { label: "Emergency", icon: "phone", linkType: "page", pageSlug: "", link: "" }, { label: "Baggage", icon: "package", linkType: "page", pageSlug: "", link: "" }] }, order: 2 },
      { type: "wifi", content: { title: "Wi-Fi", ssid: "Infomii-Global", password: "global2026", description: "For support, contact front desk." }, order: 3 },
      { type: "checklist", content: { title: "Stay Rules", items: [{ text: "No smoking in rooms", checked: false }, { text: "Quiet hours after 22:00", checked: false }, { text: "Please separate trash", checked: false }] }, order: 4 },
      { type: "emergency", content: { title: "Emergency Contacts", fire: "119", police: "110", hospital: "City General Hospital +81-3-1111-2222", note: "Front desk: +81-3-9999-8888" }, order: 5 },
      { type: "faq", content: { title: "International FAQ", items: [{ q: "Can I pay by credit card?", a: "Yes, Visa/Mastercard/Amex are accepted." }, { q: "Do you support luggage shipping?", a: "Yes, delivery slips are available at front desk." }] }, order: 6 },
    ],
  },
  {
    name: "連泊ゲスト向け・快適滞在セット",
    description: "2泊以上のゲスト向けに、清掃タイミング・ランドリー・周辺導線を強化した構成です。",
    preview_image: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=600&q=80",
    category: "business",
    cards: [
      { type: "welcome", content: { title: "Long Stay Guide", message: "連泊中に便利な情報をまとめています。" }, order: 0 },
      { type: "wifi", content: { ssid: "Infomii-LongStay", password: "stay2026plus", description: "動画会議に最適化された回線です。" }, order: 1 },
      { type: "notice", content: { title: "客室清掃のご案内", body: "清掃は毎日 10:00-14:00。不要時はドアサインをご利用ください。", variant: "info" }, order: 2 },
      { type: "laundry", content: { title: "ランドリー", hours: "6:00-24:00", priceNote: "洗濯 300円 / 乾燥 100円(30分)", contact: "内線 9" }, order: 3 },
      { type: "nearby", content: { title: "連泊に便利な周辺施設", items: [{ name: "スーパー", description: "徒歩4分 / 24時まで営業", link: "" }, { name: "ドラッグストア", description: "徒歩6分 / 日用品あり", link: "" }] }, order: 4 },
      { type: "checkout", content: { title: "チェックアウト", time: "11:00", note: "連泊中の延泊相談は前日20:00までにご連絡ください。", linkUrl: "", linkLabel: "延泊相談" }, order: 5 },
    ],
  },
  {
    name: "スパ&ウェルネス重視セット",
    description: "スパ・温浴・食事の時間設計を重視し、滞在満足を高める構成です。",
    preview_image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=80",
    category: "resort",
    cards: [
      { type: "hero", content: { title: "Wellness Stay", subtitle: "整える滞在体験をご案内", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "spa", content: { title: "スパ営業時間", hours: "14:00-23:00 / 6:00-9:00", location: "2F Wellness Zone", description: "トリートメント・サウナ利用可", note: "混雑状況はフロントで確認できます。" }, order: 1 },
      { type: "schedule", content: { title: "おすすめ利用時間", items: [{ day: "夕方", time: "16:00-18:00", label: "比較的空いています" }, { day: "朝", time: "6:30-8:00", label: "景色を楽しめる時間帯" }] }, order: 2 },
      { type: "menu", content: { title: "ヘルシーメニュー", items: [{ name: "発酵和朝食", price: "2,200円", description: "地元食材中心" }, { name: "デトックスティー", price: "850円", description: "ラウンジ提供" }] }, order: 3 },
      { type: "notice", content: { title: "ご利用前のお願い", body: "体調が優れない場合は無理せずスタッフへご相談ください。", variant: "info" }, order: 4 },
      { type: "button", content: { label: "スパ予約をする", href: "" }, order: 5 },
    ],
  },
  {
    name: "旅館・食事時間重視セット",
    description: "夕朝食の導線と館内作法を中心に、和旅館運用に最適化した構成です。",
    preview_image: "https://images.unsplash.com/photo-1496412705862-e0088f16f791?w=600&q=80",
    category: "ryokan",
    cards: [
      { type: "welcome", content: { title: "ご滞在のご案内", message: "お食事と温泉をゆったりお楽しみください。" }, order: 0 },
      { type: "restaurant", content: { title: "夕食のご案内", time: "18:00-21:00", location: "1F 食事処", menu: "季節の会席料理" }, order: 1 },
      { type: "breakfast", content: { title: "朝食", time: "7:00-9:00", location: "1F 食事処", menu: "和定食 / お子様対応可" }, order: 2 },
      { type: "notice", content: { title: "館内作法", body: "浴場・廊下での通話はお控えください。客室内は禁煙です。", variant: "warning" }, order: 3 },
      { type: "spa", content: { title: "温泉", hours: "15:00-24:00 / 5:30-9:30", location: "1F 大浴場", description: "内湯・露天", note: "貸切風呂は要予約" }, order: 4 },
      { type: "checkout", content: { title: "ご出発", time: "10:00", note: "送迎をご利用の方はチェックイン時にお申し付けください。", linkUrl: "", linkLabel: "送迎案内" }, order: 5 },
    ],
  },
  {
    name: "Airbnb・ワーケーション向けセット",
    description: "長期滞在・リモートワーク利用向けに、設備情報と生活導線を重視した構成です。",
    preview_image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80",
    category: "airbnb",
    cards: [
      { type: "hero", content: { title: "Workation Home Guide", subtitle: "仕事も滞在も快適に", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "wifi", content: { title: "Wi-Fi / Work", ssid: "Infomii-Workation", password: "remote2026", description: "会議用の有線LANアダプタ貸出あり" }, order: 1 },
      { type: "checklist", content: { title: "チェックイン後の確認", items: [{ text: "ワークデスク位置の確認", checked: false }, { text: "エアコン動作確認", checked: false }, { text: "ゴミ分別ルール確認", checked: false }] }, order: 2 },
      { type: "nearby", content: { title: "生活インフラ", items: [{ name: "コインランドリー", description: "徒歩3分 / 24時間", link: "" }, { name: "カフェ", description: "徒歩5分 / 電源あり", link: "" }] }, order: 3 },
      { type: "emergency", content: { title: "緊急時", fire: "119", police: "110", hospital: "○○総合病院 03-2222-3333", note: "ホスト連絡先: 090-xxxx-xxxx" }, order: 4 },
      { type: "checkout", content: { title: "チェックアウト", time: "10:00", note: "キーボックス返却後にメッセージ送信をお願いします。", linkUrl: "", linkLabel: "退室報告" }, order: 5 },
    ],
  },
  {
    name: "インバウンド・空港アクセス重視セット",
    description: "海外ゲスト向けに、空港アクセス・決済・緊急時の英語導線を強化した構成です。",
    preview_image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80",
    category: "inbound",
    cards: [
      { type: "welcome", content: { title: "Airport Access Guide", message: "International guests can check transport and payment info here." }, order: 0 },
      { type: "notice", content: { title: "Payment", body: "Credit cards and contactless payments are accepted.", variant: "info" }, order: 1 },
      { type: "nearby", content: { title: "Airport Transfer", items: [{ name: "Limousine Bus", description: "Hotel front 6:10 / 7:20 / 8:30", link: "" }, { name: "Train", description: "Nearest station 5 min walk", link: "" }] }, order: 2 },
      { type: "taxi", content: { title: "Taxi", phone: "+81-3-5555-6666", companyName: "City Taxi", note: "24/7 support with English operator" }, order: 3 },
      { type: "emergency", content: { title: "Emergency Contacts", fire: "119", police: "110", hospital: "+81-3-1111-2222", note: "Front Desk: +81-3-9999-8888" }, order: 4 },
      { type: "map", content: { title: "Hotel Location", address: "Tokyo, Chiyoda-ku ○○ 1-2-3", mapEmbedUrl: "" }, order: 5 },
    ],
  },
  {
    name: "ビジネスホテル・深夜到着対応セット",
    description: "深夜チェックインの案内を中心に、到着後の迷いを減らす構成です。",
    preview_image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80",
    category: "business",
    cards: [
      { type: "welcome", content: { title: "深夜到着のお客様へ", message: "24時以降のご案内をまとめています。" }, order: 0 },
      { type: "notice", content: { title: "チェックイン方法", body: "フロント到着後、夜間ベルをご利用ください。", variant: "info" }, order: 1 },
      { type: "wifi", content: { ssid: "Infomii-Night", password: "nightstay", description: "客室でご利用ください" }, order: 2 },
      { type: "taxi", content: { title: "深夜タクシー", phone: "03-1111-2233", companyName: "ナイトタクシー", note: "駅から約8分" }, order: 3 },
      { type: "checkout", content: { title: "翌朝のご出発", time: "11:00", note: "早朝出発は前日までに申請してください。", linkUrl: "", linkLabel: "申請" }, order: 4 },
    ],
  },
  {
    name: "ビジネスホテル・会議参加者向けセット",
    description: "会場アクセス・朝食・領収書対応をまとめた出張参加者向け構成です。",
    preview_image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=600&q=80",
    category: "business",
    cards: [
      { type: "hero", content: { title: "Conference Stay", subtitle: "会議参加をスムーズに", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "kpi", content: { title: "参加者向け要点", items: [{ label: "会場", value: "国際フォーラム" }, { label: "移動", value: "電車12分" }, { label: "朝食", value: "6:30開始" }] }, order: 1 },
      { type: "nearby", content: { title: "会場アクセス", items: [{ name: "電車", description: "JR ○○駅→△△駅", link: "" }, { name: "タクシー", description: "所要約15分", link: "" }] }, order: 2 },
      { type: "breakfast", content: { title: "朝食", time: "6:30-9:30", location: "2F", menu: "和洋ビュッフェ" }, order: 3 },
      { type: "faq", content: { title: "出張FAQ", items: [{ q: "領収書の再発行はできますか？", a: "フロントで対応可能です。" }, { q: "宅配便は使えますか？", a: "1Fカウンターで受付しています。" }] }, order: 4 },
    ],
  },
  {
    name: "ビジネスホテル・女性出張安心セット",
    description: "セキュリティとアメニティ案内を強化した女性出張向け構成です。",
    preview_image: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=600&q=80",
    category: "business",
    cards: [
      { type: "welcome", content: { title: "安心してご滞在ください", message: "セキュリティ・設備情報をまとめています。" }, order: 0 },
      { type: "notice", content: { title: "セキュリティ", body: "エレベーターはルームキー認証です。", variant: "info" }, order: 1 },
      { type: "checklist", content: { title: "客室チェック", items: [{ text: "ドアロック確認", checked: false }, { text: "非常口確認", checked: false }, { text: "連絡先確認", checked: false }] }, order: 2 },
      { type: "laundry", content: { title: "ランドリー", hours: "6:00-24:00", priceNote: "洗濯300円", contact: "内線9" }, order: 3 },
      { type: "emergency", content: { title: "緊急連絡先", fire: "119", police: "110", hospital: "○○病院", note: "フロント内線9" }, order: 4 },
    ],
  },
  {
    name: "ビジネスホテル・朝活サポートセット",
    description: "早朝行動に必要な情報を集約した朝活・早朝移動向け構成です。",
    preview_image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80",
    category: "business",
    cards: [
      { type: "hero", content: { title: "Morning Smart Stay", subtitle: "早朝を有効活用", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "schedule", content: { title: "朝の営業時間", items: [{ day: "朝食", time: "6:00-9:00", label: "1F" }, { day: "ジム", time: "5:00-23:00", label: "3F" }] }, order: 1 },
      { type: "nearby", content: { title: "朝ランコース", items: [{ name: "川沿いルート", description: "往復20分", link: "" }, { name: "公園ルート", description: "往復30分", link: "" }] }, order: 2 },
      { type: "taxi", content: { title: "早朝配車", phone: "03-2222-1212", companyName: "モーニングタクシー", note: "前夜予約可" }, order: 3 },
      { type: "checkout", content: { title: "早朝チェックアウト", time: "24時間対応", note: "自動精算機をご利用ください。", linkUrl: "", linkLabel: "詳細" }, order: 4 },
    ],
  },
  {
    name: "リゾートホテル・連泊体験セット",
    description: "2〜3日滞在を想定し、日ごとの過ごし方を提案する構成です。",
    preview_image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    category: "resort",
    cards: [
      { type: "hero", content: { title: "3 Days Resort Plan", subtitle: "連泊で楽しむ滞在提案", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "steps", content: { title: "おすすめ過ごし方", items: [{ title: "1日目", description: "チェックイン後にスパへ" }, { title: "2日目", description: "アクティビティと散策" }, { title: "3日目", description: "ブランチ後にチェックアウト" }] }, order: 1 },
      { type: "spa", content: { title: "温浴施設", hours: "6:00-11:00 / 15:00-24:00", location: "2F", description: "露天・サウナ", note: "" }, order: 2 },
      { type: "menu", content: { title: "滞在中おすすめ", items: [{ name: "シーフードディナー", price: "7,800円", description: "" }, { name: "サンセットバー", price: "1,200円", description: "" }] }, order: 3 },
      { type: "button", content: { label: "体験予約", href: "" }, order: 4 },
    ],
  },
  {
    name: "リゾートホテル・ハネムーンセット",
    description: "記念日滞在向けに、演出・食事・写真導線を整えた構成です。",
    preview_image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80",
    category: "resort",
    cards: [
      { type: "hero", content: { title: "Honeymoon Stay", subtitle: "特別な滞在をサポート", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "gallery", content: { title: "フォトスポット", columns: 2, items: [{ src: "", alt: "テラス" }, { src: "", alt: "夕景" }] }, order: 1 },
      { type: "menu", content: { title: "記念日ディナー", items: [{ name: "Anniversary Course", price: "12,000円", description: "" }] }, order: 2 },
      { type: "notice", content: { title: "サプライズ相談", body: "ケーキ・花束の手配は前日までにご連絡ください。", variant: "info" }, order: 3 },
      { type: "button", content: { label: "記念日相談フォーム", href: "" }, order: 4 },
    ],
  },
  {
    name: "リゾートホテル・雨の日満喫セット",
    description: "天候不良時でも館内で楽しめる導線をまとめた構成です。",
    preview_image: "https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7?w=600&q=80",
    category: "resort",
    cards: [
      { type: "welcome", content: { title: "Rainy Day Plan", message: "館内で快適に過ごせる情報をご案内します。" }, order: 0 },
      { type: "pageLinks", content: { title: "館内アクティビティ", columns: 2, iconSize: "md", items: [{ label: "スパ", icon: "bath", linkType: "page", pageSlug: "", link: "" }, { label: "ラウンジ", icon: "coffee", linkType: "page", pageSlug: "", link: "" }, { label: "キッズ", icon: "package", linkType: "page", pageSlug: "", link: "" }] }, order: 1 },
      { type: "schedule", content: { title: "館内イベント", items: [{ day: "映画上映", time: "16:00", label: "1F シアター" }, { day: "クラフト体験", time: "14:00", label: "2F ラボ" }] }, order: 2 },
      { type: "menu", content: { title: "ティータイム", items: [{ name: "季節のスイーツ", price: "1,300円", description: "" }] }, order: 3 },
      { type: "quote", content: { quote: "雨の日でも一日中楽しめました。", author: "ゲストレビュー" }, order: 4 },
    ],
  },
  {
    name: "リゾートホテル・アクティビティ重視セット",
    description: "海・山・体験予約を主軸にしたアクティビティ訴求構成です。",
    preview_image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80",
    category: "resort",
    cards: [
      { type: "hero", content: { title: "Activity Base", subtitle: "外遊びを最大化する滞在案内", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "nearby", content: { title: "人気アクティビティ", items: [{ name: "SUP", description: "送迎あり", link: "" }, { name: "トレッキング", description: "初心者可", link: "" }] }, order: 1 },
      { type: "checklist", content: { title: "持ち物チェック", items: [{ text: "動きやすい服", checked: false }, { text: "飲料水", checked: false }, { text: "日焼け止め", checked: false }] }, order: 2 },
      { type: "taxi", content: { title: "送迎・タクシー", phone: "03-4444-8787", companyName: "リゾート交通", note: "フロント手配可" }, order: 3 },
      { type: "button", content: { label: "体験を予約する", href: "" }, order: 4 },
    ],
  },
  {
    name: "旅館・温泉街散策セット",
    description: "温泉街の回遊と館内滞在を両立させる旅館向け構成です。",
    preview_image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=600&q=80",
    category: "ryokan",
    cards: [
      { type: "welcome", content: { title: "温泉街散策のご案内", message: "徒歩で楽しめる周辺情報をまとめました。" }, order: 0 },
      { type: "nearby", content: { title: "散策スポット", items: [{ name: "足湯通り", description: "徒歩3分", link: "" }, { name: "土産店", description: "徒歩5分", link: "" }] }, order: 1 },
      { type: "map", content: { title: "散策マップ", address: "○○温泉街 中央通り", mapEmbedUrl: "" }, order: 2 },
      { type: "notice", content: { title: "外出時のお願い", body: "門限は23:30です。", variant: "warning" }, order: 3 },
      { type: "checkout", content: { title: "翌朝のご出発", time: "10:00", note: "荷物預かり可", linkUrl: "", linkLabel: "詳細" }, order: 4 },
    ],
  },
  {
    name: "旅館・団体旅行向けセット",
    description: "団体客向けに、食事時間・移動・館内ルールを整理した構成です。",
    preview_image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=600&q=80",
    category: "ryokan",
    cards: [
      { type: "hero", content: { title: "Group Stay Guide", subtitle: "団体様向け案内", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "schedule", content: { title: "団体スケジュール", items: [{ day: "夕食", time: "18:30", label: "大広間" }, { day: "朝食", time: "7:30", label: "大広間" }] }, order: 1 },
      { type: "notice", content: { title: "館内ルール", body: "深夜の宴会・廊下での会話はお控えください。", variant: "warning" }, order: 2 },
      { type: "steps", content: { title: "出発までの流れ", items: [{ title: "精算", description: "代表者様まとめ払い" }, { title: "集合", description: "玄関前へ" }] }, order: 3 },
      { type: "emergency", content: { title: "緊急連絡先", fire: "119", police: "110", hospital: "○○病院", note: "フロント内線9" }, order: 4 },
    ],
  },
  {
    name: "旅館・ファミリー三世代向けセット",
    description: "三世代旅行でも使いやすい導線・食事・温泉情報を整えた構成です。",
    preview_image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&q=80",
    category: "ryokan",
    cards: [
      { type: "welcome", content: { title: "三世代でのご滞在へ", message: "年齢問わず快適に過ごせる情報をまとめています。" }, order: 0 },
      { type: "restaurant", content: { title: "お食事", time: "18:00-21:00", location: "食事処", menu: "お子様膳・やわらか食対応" }, order: 1 },
      { type: "spa", content: { title: "温泉", hours: "15:00-24:00", location: "1F", description: "手すり設置", note: "貸切風呂あり" }, order: 2 },
      { type: "checklist", content: { title: "お出かけ前チェック", items: [{ text: "部屋鍵", checked: false }, { text: "タオル", checked: false }, { text: "薬", checked: false }] }, order: 3 },
      { type: "nearby", content: { title: "近場観光", items: [{ name: "庭園", description: "徒歩7分", link: "" }] }, order: 4 },
    ],
  },
  {
    name: "Airbnb・ファミリー滞在セット",
    description: "子連れ民泊で必要なルール・設備・周辺情報をまとめた構成です。",
    preview_image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&q=80",
    category: "airbnb",
    cards: [
      { type: "hero", content: { title: "Family Home Stay", subtitle: "ご家族向け案内", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "checklist", content: { title: "入室後チェック", items: [{ text: "ベビーベッド確認", checked: false }, { text: "調理器具確認", checked: false }] }, order: 1 },
      { type: "wifi", content: { ssid: "Infomii-Family", password: "familyhome", description: "" }, order: 2 },
      { type: "nearby", content: { title: "家族向け周辺", items: [{ name: "公園", description: "徒歩4分", link: "" }, { name: "スーパー", description: "徒歩5分", link: "" }] }, order: 3 },
      { type: "checkout", content: { title: "退室手順", time: "10:00", note: "ゴミ分別と施錠確認をお願いします。", linkUrl: "", linkLabel: "詳細" }, order: 4 },
    ],
  },
  {
    name: "Airbnb・一人旅ミニマルセット",
    description: "一人旅ゲスト向けに必要情報だけを簡潔にまとめた構成です。",
    preview_image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
    category: "airbnb",
    cards: [
      { type: "welcome", content: { title: "Welcome Solo Traveler", message: "快適な一人旅をサポートします。" }, order: 0 },
      { type: "wifi", content: { ssid: "Infomii-Solo", password: "solo2026", description: "" }, order: 1 },
      { type: "nearby", content: { title: "近隣情報", items: [{ name: "コンビニ", description: "徒歩2分", link: "" }, { name: "駅", description: "徒歩8分", link: "" }] }, order: 2 },
      { type: "taxi", content: { title: "移動", phone: "03-8989-1010", companyName: "シティタクシー", note: "" }, order: 3 },
      { type: "checkout", content: { title: "チェックアウト", time: "10:00", note: "鍵をキーボックスへ戻してください。", linkUrl: "", linkLabel: "報告" }, order: 4 },
    ],
  },
  {
    name: "Airbnb・ペット同伴セット",
    description: "ペット同伴滞在で必要なルール・設備案内を整えた構成です。",
    preview_image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&q=80",
    category: "airbnb",
    cards: [
      { type: "hero", content: { title: "Pet Friendly Stay", subtitle: "ペット同伴のご案内", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "notice", content: { title: "ペットルール", body: "ベッド利用不可。共用部ではリード着用をお願いします。", variant: "warning" }, order: 1 },
      { type: "checklist", content: { title: "持ち物", items: [{ text: "ペットシーツ", checked: false }, { text: "食器", checked: false }, { text: "リード", checked: false }] }, order: 2 },
      { type: "nearby", content: { title: "周辺施設", items: [{ name: "動物病院", description: "徒歩10分", link: "" }, { name: "ドッグラン", description: "車で8分", link: "" }] }, order: 3 },
      { type: "emergency", content: { title: "緊急連絡", fire: "119", police: "110", hospital: "○○動物病院 03-1111-7777", note: "ホスト連絡先あり" }, order: 4 },
    ],
  },
  {
    name: "観光ガイド・半日モデルコースセット",
    description: "半日で回れる観光導線を提案するベーシック観光構成です。",
    preview_image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=80",
    category: "guide",
    cards: [
      { type: "hero", content: { title: "Half-Day Guide", subtitle: "半日で楽しむおすすめ", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "steps", content: { title: "モデルコース", items: [{ title: "10:00", description: "市場見学" }, { title: "12:00", description: "ランチ" }, { title: "14:00", description: "展望台" }] }, order: 1 },
      { type: "nearby", content: { title: "スポット詳細", items: [{ name: "朝市", description: "地元食材", link: "" }, { name: "展望台", description: "写真映え", link: "" }] }, order: 2 },
      { type: "map", content: { title: "ルートマップ", address: "○○駅 周辺", mapEmbedUrl: "" }, order: 3 },
      { type: "taxi", content: { title: "移動", phone: "03-7676-1212", companyName: "観光タクシー", note: "" }, order: 4 },
    ],
  },
  {
    name: "観光ガイド・グルメ巡りセット",
    description: "食べ歩き・地元名店を中心に構成したグルメ特化ガイドです。",
    preview_image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
    category: "guide",
    cards: [
      { type: "welcome", content: { title: "グルメガイド", message: "地元で人気の店を厳選しました。" }, order: 0 },
      { type: "nearby", content: { title: "おすすめ店", items: [{ name: "海鮮食堂", description: "11:00-14:00", link: "" }, { name: "和菓子店", description: "10:00-18:00", link: "" }] }, order: 1 },
      { type: "menu", content: { title: "名物メニュー", items: [{ name: "海鮮丼", price: "1,800円", description: "" }, { name: "抹茶大福", price: "280円", description: "" }] }, order: 2 },
      { type: "map", content: { title: "エリア地図", address: "○○商店街", mapEmbedUrl: "" }, order: 3 },
      { type: "faq", content: { title: "グルメFAQ", items: [{ q: "予約は必要ですか？", a: "人気店は予約推奨です。" }] }, order: 4 },
    ],
  },
  {
    name: "観光ガイド・雨天代替スポットセット",
    description: "雨の日でも楽しめる屋内スポット中心の構成です。",
    preview_image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=600&q=80",
    category: "guide",
    cards: [
      { type: "hero", content: { title: "Rainy Day Spots", subtitle: "天候不良でも楽しめる", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "nearby", content: { title: "屋内スポット", items: [{ name: "美術館", description: "徒歩9分", link: "" }, { name: "屋内市場", description: "徒歩6分", link: "" }] }, order: 1 },
      { type: "pageLinks", content: { title: "目的別", columns: 2, iconSize: "md", items: [{ label: "文化", icon: "book", linkType: "page", pageSlug: "", link: "" }, { label: "買い物", icon: "shopping-bag", linkType: "page", pageSlug: "", link: "" }] }, order: 2 },
      { type: "taxi", content: { title: "雨天時移動", phone: "03-4343-7878", companyName: "レインタクシー", note: "" }, order: 3 },
      { type: "notice", content: { title: "注意", body: "雨の日は混雑するため早めの出発がおすすめです。", variant: "info" }, order: 4 },
    ],
  },
  {
    name: "インバウンド・家族旅行セット",
    description: "海外ファミリー向けに、移動・食事・緊急対応をまとめた構成です。",
    preview_image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&q=80",
    category: "inbound",
    cards: [
      { type: "welcome", content: { title: "Family Travel Guide", message: "EN support available for family guests." }, order: 0 },
      { type: "nearby", content: { title: "Family Spots", items: [{ name: "Zoo", description: "15 min by train", link: "" }, { name: "Science Museum", description: "20 min", link: "" }] }, order: 1 },
      { type: "wifi", content: { title: "Wi-Fi", ssid: "Infomii-FamilyGlobal", password: "globalfamily", description: "" }, order: 2 },
      { type: "checklist", content: { title: "Before Going Out", items: [{ text: "Kids pass", checked: false }, { text: "Emergency contact", checked: false }] }, order: 3 },
      { type: "emergency", content: { title: "Emergency", fire: "119", police: "110", hospital: "+81-3-2222-3333", note: "Front desk can assist in English." }, order: 4 },
    ],
  },
  {
    name: "インバウンド・公共交通特化セット",
    description: "電車・バス移動を中心に説明する交通特化構成です。",
    preview_image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&q=80",
    category: "inbound",
    cards: [
      { type: "hero", content: { title: "Public Transport Guide", subtitle: "Train & Bus Access", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "steps", content: { title: "Station to Hotel", items: [{ title: "Step 1", description: "Take Exit A2" }, { title: "Step 2", description: "Walk straight 350m" }] }, order: 1 },
      { type: "nearby", content: { title: "Main Routes", items: [{ name: "Airport Line", description: "45 min", link: "" }, { name: "City Loop Bus", description: "every 10 min", link: "" }] }, order: 2 },
      { type: "map", content: { title: "Transit Map", address: "Nearest station area", mapEmbedUrl: "" }, order: 3 },
      { type: "faq", content: { title: "Transit FAQ", items: [{ q: "IC cards accepted?", a: "Yes, major IC cards are accepted." }] }, order: 4 },
    ],
  },
  {
    name: "インバウンド・長期滞在サポートセット",
    description: "1週間以上の海外滞在者向けに生活情報を重視した構成です。",
    preview_image: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=600&q=80",
    category: "inbound",
    cards: [
      { type: "welcome", content: { title: "Long Stay Support", message: "Useful local info for extended stays." }, order: 0 },
      { type: "laundry", content: { title: "Laundry", hours: "6:00-24:00", priceNote: "Wash 300 JPY", contact: "Front desk" }, order: 1 },
      { type: "nearby", content: { title: "Daily Life Spots", items: [{ name: "Supermarket", description: "4 min walk", link: "" }, { name: "Drugstore", description: "6 min walk", link: "" }] }, order: 2 },
      { type: "notice", content: { title: "Waste Separation", body: "Please separate burnable and recyclable trash.", variant: "info" }, order: 3 },
      { type: "emergency", content: { title: "Emergency Contacts", fire: "119", police: "110", hospital: "+81-3-4444-5555", note: "Host contact available." }, order: 4 },
    ],
  },
  {
    name: "ベーシック・ビジネスホテル案内",
    description: "出張利用で最低限必要な情報を1ページにまとめた基本構成です。",
    preview_image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
    category: "business",
    cards: [
      { type: "welcome", content: { title: "ご案内", message: "ご滞在に必要な情報をまとめています。" }, order: 0 },
      { type: "wifi", content: { ssid: "Hotel-WiFi", password: "welcome1234", description: "" }, order: 1 },
      { type: "breakfast", content: { title: "朝食", time: "7:00-9:30", location: "1F レストラン", menu: "和洋ビュッフェ" }, order: 2 },
      { type: "checkout", content: { title: "チェックアウト", time: "11:00", note: "フロントへお越しください。", linkUrl: "", linkLabel: "詳細" }, order: 3 },
      { type: "map", content: { title: "所在地", address: "東京都○○区○○ 1-2-3", mapEmbedUrl: "" }, order: 4 },
    ],
  },
  {
    name: "ベーシック・リゾートホテル案内",
    description: "館内施設と基本動線をシンプルに伝えるリゾート向け基本構成です。",
    preview_image: "https://images.unsplash.com/photo-1469796466635-455ede028aca?w=600&q=80",
    category: "resort",
    cards: [
      { type: "hero", content: { title: "Resort Basic Guide", subtitle: "滞在情報をシンプルにご案内", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "wifi", content: { ssid: "Resort-WiFi", password: "resort1234", description: "" }, order: 1 },
      { type: "spa", content: { title: "スパ・大浴場", hours: "15:00-24:00", location: "2F", description: "", note: "" }, order: 2 },
      { type: "breakfast", content: { title: "朝食", time: "7:00-10:00", location: "1F", menu: "ビュッフェ" }, order: 3 },
      { type: "checkout", content: { title: "チェックアウト", time: "11:00", note: "", linkUrl: "", linkLabel: "詳細" }, order: 4 },
    ],
  },
  {
    name: "ベーシック・旅館ご案内",
    description: "旅館滞在の基本情報（温泉・食事・出発）を網羅した基本構成です。",
    preview_image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&q=80",
    category: "ryokan",
    cards: [
      { type: "welcome", content: { title: "旅館ご案内", message: "ご滞在の基本情報をご確認ください。" }, order: 0 },
      { type: "spa", content: { title: "大浴場", hours: "15:00-24:00 / 6:00-9:00", location: "1F", description: "", note: "" }, order: 1 },
      { type: "restaurant", content: { title: "お食事", time: "18:00-21:00", location: "お食事処", menu: "会席料理" }, order: 2 },
      { type: "notice", content: { title: "館内のお願い", body: "23時以降はお静かにお過ごしください。", variant: "warning" }, order: 3 },
      { type: "checkout", content: { title: "チェックアウト", time: "10:00", note: "", linkUrl: "", linkLabel: "詳細" }, order: 4 },
    ],
  },
  {
    name: "ベーシック・Airbnbゲスト案内",
    description: "民泊で必要なチェックイン・WiFi・退室情報をまとめた基本構成です。",
    preview_image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80",
    category: "airbnb",
    cards: [
      { type: "welcome", content: { title: "Welcome", message: "チェックインから退室までのご案内です。" }, order: 0 },
      { type: "steps", content: { title: "チェックイン手順", items: [{ title: "入口", description: "暗証番号入力" }, { title: "鍵", description: "キーボックス受け取り" }] }, order: 1 },
      { type: "wifi", content: { ssid: "Home-WiFi", password: "airbnb1234", description: "" }, order: 2 },
      { type: "checklist", content: { title: "ハウスルール", items: [{ text: "室内禁煙", checked: false }, { text: "ゴミ分別", checked: false }] }, order: 3 },
      { type: "checkout", content: { title: "チェックアウト", time: "10:00", note: "施錠後にメッセージ送信", linkUrl: "", linkLabel: "報告" }, order: 4 },
    ],
  },
  {
    name: "ベーシック・観光ガイド案内",
    description: "初めての来訪者向けに、主要スポットと移動方法をまとめた基本構成です。",
    preview_image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=600&q=80",
    category: "guide",
    cards: [
      { type: "hero", content: { title: "Basic Local Guide", subtitle: "まず押さえる定番情報", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "nearby", content: { title: "主要スポット", items: [{ name: "駅周辺", description: "徒歩10分", link: "" }, { name: "観光名所", description: "バス15分", link: "" }] }, order: 1 },
      { type: "map", content: { title: "エリアマップ", address: "○○駅 周辺", mapEmbedUrl: "" }, order: 2 },
      { type: "taxi", content: { title: "タクシー", phone: "03-1111-3333", companyName: "地域タクシー", note: "" }, order: 3 },
      { type: "faq", content: { title: "観光FAQ", items: [{ q: "おすすめ時間帯は？", a: "午前中がおすすめです。" }] }, order: 4 },
    ],
  },
  {
    name: "ベーシック・インバウンド案内",
    description: "海外ゲスト向けに、交通・WiFi・緊急連絡先を整理した基本構成です。",
    preview_image: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=600&q=80",
    category: "inbound",
    cards: [
      { type: "welcome", content: { title: "Welcome Guests", message: "Basic information for your stay." }, order: 0 },
      { type: "wifi", content: { title: "Wi-Fi", ssid: "Global-WiFi", password: "welcomeglobal", description: "" }, order: 1 },
      { type: "nearby", content: { title: "Access", items: [{ name: "Nearest Station", description: "8 min walk", link: "" }, { name: "Airport Bus", description: "Hotel front", link: "" }] }, order: 2 },
      { type: "notice", content: { title: "House Rules", body: "No smoking in rooms. Quiet hours after 22:00.", variant: "info" }, order: 3 },
      { type: "emergency", content: { title: "Emergency", fire: "119", police: "110", hospital: "+81-3-1111-2222", note: "Front desk supports English." }, order: 4 },
    ],
  },
  {
    name: "ベーシック・ファミリー滞在案内",
    description: "家族旅行で必要な基本情報をシンプルにまとめた構成です。",
    preview_image: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&q=80",
    category: "resort",
    cards: [
      { type: "welcome", content: { title: "ファミリー向け案内", message: "お子さま連れで必要な情報をご案内します。" }, order: 0 },
      { type: "breakfast", content: { title: "朝食", time: "7:00-9:30", location: "1F", menu: "キッズメニューあり" }, order: 1 },
      { type: "nearby", content: { title: "周辺施設", items: [{ name: "公園", description: "徒歩5分", link: "" }, { name: "コンビニ", description: "徒歩3分", link: "" }] }, order: 2 },
      { type: "checklist", content: { title: "出発前チェック", items: [{ text: "忘れ物確認", checked: false }, { text: "鍵返却", checked: false }] }, order: 3 },
      { type: "checkout", content: { title: "チェックアウト", time: "11:00", note: "", linkUrl: "", linkLabel: "詳細" }, order: 4 },
    ],
  },
  {
    name: "ベーシック・長期滞在案内",
    description: "連泊・長期滞在で必要な生活情報をまとめた基本構成です。",
    preview_image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&q=80",
    category: "business",
    cards: [
      { type: "welcome", content: { title: "Long Stay Basic", message: "連泊向け情報をご確認ください。" }, order: 0 },
      { type: "laundry", content: { title: "ランドリー", hours: "6:00-24:00", priceNote: "洗濯300円", contact: "内線9" }, order: 1 },
      { type: "wifi", content: { ssid: "LongStay-WiFi", password: "longstay", description: "" }, order: 2 },
      { type: "nearby", content: { title: "生活導線", items: [{ name: "スーパー", description: "徒歩4分", link: "" }, { name: "ドラッグストア", description: "徒歩6分", link: "" }] }, order: 3 },
      { type: "notice", content: { title: "清掃案内", body: "10:00-14:00に清掃を行います。", variant: "info" }, order: 4 },
    ],
  },
  {
    name: "ベーシック・駅アクセス案内",
    description: "最寄駅からの導線を中心にしたシンプルな基本構成です。",
    preview_image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&q=80",
    category: "guide",
    cards: [
      { type: "hero", content: { title: "Station Access Guide", subtitle: "最寄駅からの案内", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "steps", content: { title: "駅からの行き方", items: [{ title: "改札", description: "東口へ" }, { title: "直進", description: "300m進む" }, { title: "到着", description: "右手にホテル" }] }, order: 1 },
      { type: "map", content: { title: "アクセスマップ", address: "○○駅 東口", mapEmbedUrl: "" }, order: 2 },
      { type: "taxi", content: { title: "タクシー利用", phone: "03-5555-1212", companyName: "駅前タクシー", note: "所要約5分" }, order: 3 },
      { type: "notice", content: { title: "混雑注意", body: "朝夕は駅周辺が混雑します。", variant: "info" }, order: 4 },
    ],
  },
  {
    name: "ベーシック・チェックイン案内セット",
    description: "チェックイン〜滞在開始までをわかりやすく伝える基本構成です。",
    preview_image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80",
    category: "airbnb",
    cards: [
      { type: "welcome", content: { title: "チェックイン案内", message: "ご到着後の流れをご確認ください。" }, order: 0 },
      { type: "steps", content: { title: "入室手順", items: [{ title: "1", description: "ドア解錠" }, { title: "2", description: "鍵受け取り" }, { title: "3", description: "室内確認" }] }, order: 1 },
      { type: "wifi", content: { ssid: "Guest-WiFi", password: "gueststay", description: "" }, order: 2 },
      { type: "checklist", content: { title: "ご利用ルール", items: [{ text: "禁煙", checked: false }, { text: "騒音注意", checked: false }] }, order: 3 },
      { type: "emergency", content: { title: "緊急連絡先", fire: "119", police: "110", hospital: "○○病院", note: "ホスト連絡先あり" }, order: 4 },
    ],
  },
];

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseAdminServerClient();
    const { searchParams } = new URL(request.url);
    const syncLatest = searchParams.get("sync") === "1";

    const { data: existing, error: existingError } = await supabase
      .from("templates")
      .select("id, name")
      .limit(200);
    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    const existingByName = new Map<string, { id: string; name: string }>();
    for (const row of existing ?? []) {
      existingByName.set(row.name, row as { id: string; name: string });
    }

    const toInsert: SeedTemplate[] = [];
    let updated = 0;

    const categoryIndexMap = new Map<string, number>();
    for (const template of SEED_TEMPLATES) {
      const categoryKey = template.category ?? "default";
      const categoryIndex = categoryIndexMap.get(categoryKey) ?? 0;
      categoryIndexMap.set(categoryKey, categoryIndex + 1);
      const mediaTemplate = applyTemplateMediaDefaults(template);
      const diversifiedTemplate = diversifyTemplateBlocks(mediaTemplate, categoryIndex);
      const visualTemplate = applyTemplateVisualStyles(diversifiedTemplate);
      const found = existingByName.get(template.name);
      if (!found) {
        toInsert.push(visualTemplate);
        continue;
      }
      if (syncLatest) {
        const { error } = await supabase
          .from("templates")
          .update({
            description: visualTemplate.description,
            preview_image: visualTemplate.preview_image,
            category: visualTemplate.category,
            cards: visualTemplate.cards,
          })
          .eq("id", found.id);
        if (!error) updated += 1;
      }
    }

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

    return NextResponse.json({
      seeded: inserted > 0,
      syncLatest,
      message: syncLatest ? "Templates synced to latest" : "Templates checked",
      inserted,
      updated,
      totalSeedTemplates: SEED_TEMPLATES.length,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Seed failed" },
      { status: 500 }
    );
  }
}
