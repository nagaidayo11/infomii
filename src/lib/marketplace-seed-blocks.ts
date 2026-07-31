/** Shared block content builders for marketplace seed templates (hotel + legacy). */

export const SEED_PREVIEW_IMAGE = "/preset-hero-sample.png" as const;

export type HeroLayout = "overlay" | "stack" | "split";
export type WelcomeLayout = "boxed" | "plain" | "quote";
export type InfoLayout = "cards" | "table" | "inline";
export type PageLinkStyle = "tile" | "circle" | "list" | "poster";

export const hero = (
  title: string,
  subtitle: string,
  imageOrOpts?: string | { layout?: HeroLayout; image?: string; accentColor?: string },
) => {
  const opts = typeof imageOrOpts === "string" ? { image: imageOrOpts } : imageOrOpts;
  return {
    title,
    subtitle,
    image: opts?.image ?? SEED_PREVIEW_IMAGE,
    widthMode: "full",
    layout: opts?.layout ?? "overlay",
    ...(opts?.accentColor ? { accentColor: opts.accentColor } : {}),
  };
};

export const welcome = (
  title: string,
  message: string,
  opts?: { layout?: WelcomeLayout; accentColor?: string },
) => ({
  title,
  message,
  layout: opts?.layout ?? "boxed",
  ...(opts?.accentColor ? { accentColor: opts.accentColor } : {}),
});

export const notice = (title: string, body: string, variant = "info") => ({ title, body, variant });
export const headingBody = (title: string, body: string) => ({
  title,
  body,
  dividerEnabled: false,
  dividerStyle: "solid",
});
export const highlight = (title: string, body: string, accent = "amber") => ({ title, body, accent });

export const wifi = (ssid: string, password: string, description: string, title = "Wi-Fi案内") => ({
  title,
  ssid,
  password,
  description,
});

export const infoRows = (
  title: string,
  icon: string,
  rows: Array<{ label: string; value: string }>,
  opts?: { layout?: InfoLayout; tone?: string },
) => ({
  title,
  icon,
  tone: opts?.tone ?? "slate",
  layout: opts?.layout ?? "cards",
  rows: rows.map((r) => ({ ...r, show: true })),
});

export const sectionTitle = (
  title: string,
  opts?: { subtitle?: string; align?: "left" | "center"; showLine?: boolean; accentColor?: string },
) => ({
  title,
  subtitle: opts?.subtitle ?? "",
  align: opts?.align ?? "left",
  showLine: opts?.showLine !== false,
  accentColor: opts?.accentColor ?? "#0f766e",
});

export const storyBand = (
  title: string,
  caption: string,
  opts?: { eyebrow?: string; image?: string; overlay?: boolean; accentColor?: string },
) => ({
  eyebrow: opts?.eyebrow ?? "",
  title,
  caption,
  image: opts?.image ?? SEED_PREVIEW_IMAGE,
  imageAlt: title,
  overlay: opts?.overlay !== false,
  accentColor: opts?.accentColor ?? "#0f766e",
});

export const dayTimeline = (
  title: string,
  items: Array<{ time: string; title: string; description?: string }>,
  opts?: { accentColor?: string },
) => ({
  title,
  accentColor: opts?.accentColor ?? "#0f766e",
  items: items.map((item) => ({
    time: item.time,
    title: item.title,
    description: item.description ?? "",
  })),
});

export const iconAccordion = (
  title: string,
  items: Array<{ label: string; icon: string; description?: string; body: string }>,
  opts?: { columns?: number; styleVariant?: PageLinkStyle; accentColor?: string },
) => ({
  title,
  columns: opts?.columns ?? 2,
  iconSize: "md",
  styleVariant: opts?.styleVariant ?? "tile",
  accentColor: opts?.accentColor ?? "#0f766e",
  items: items.map((item) => ({
    label: item.label,
    icon: item.icon,
    description: item.description ?? "",
    body: item.body,
  })),
});

export const openStatus = (
  title: string,
  hoursText: string,
  openLabel = "利用できます",
  closedLabel = "時間外",
) => ({
  title,
  mode: "manual",
  openNow: true,
  openLabel,
  closedLabel,
  hoursText,
});

export const progressSteps = (
  title: string,
  items: Array<{ label: string; done: boolean }>,
  currentStep = 1,
) => ({ title, currentStep, items });

export const tabsInfo = (
  title: string,
  tabs: Array<{ label: string; body: string; imageSrc?: string }>,
) => ({
  title,
  defaultIndex: 0,
  accentColor: "#0f766e",
  tabs: tabs.map((t) => ({
    label: t.label,
    body: t.body,
    imageSrc: t.imageSrc ?? "",
  })),
});

export const accordionInfo = (title: string, items: Array<{ title: string; body: string }>) => ({
  title,
  accentColor: "#0f766e",
  items,
});

export const comparePricing = (
  title: string,
  pricingColumnHeaders: string[],
  pricingRows: Array<{ label: string; values: string[] }>,
  highlightColumnIndex = 0,
) => ({ layout: "pricing", title, pricingColumnHeaders, pricingRows, highlightColumnIndex });

export const pageLinks = (
  title: string,
  items: Array<{ label: string; icon: string; description?: string }>,
  opts?: { columns?: number; styleVariant?: PageLinkStyle; accentColor?: string },
) => ({
  title,
  columns: opts?.columns ?? 2,
  iconSize: "md",
  styleVariant: opts?.styleVariant ?? "tile",
  tileShadowStrength: "md",
  circleIconShadowStrength: "md",
  accentColor: opts?.accentColor ?? "#0f766e",
  items: items.map((item) => ({
    label: item.label,
    icon: item.icon,
    description: item.description ?? "",
    linkType: "page" as const,
    pageSlug: "",
    link: "",
  })),
});

/** @deprecated Prefer pageLinks(..., { styleVariant: "circle" }) */
export const circlePageLinks = (items: Array<{ label: string; icon: string }>) =>
  pageLinks("", items, { columns: 3, styleVariant: "circle" });

export const heroSlider = (title: string, images?: string[]) => ({
  title,
  autoplay: true,
  intervalSec: 4,
  transitionEnabled: true,
  transitionType: "fade",
  transitionDurationMs: 500,
  showCaptions: true,
  height: "s",
  widthMode: "full",
  slides: [
    {
      src: images?.[0] ?? SEED_PREVIEW_IMAGE,
      alt: "館内イメージ",
      caption: "ご滞在のご案内",
      linkEnabled: false,
      linkType: "internal",
      href: "",
      openInNewTab: false,
    },
    {
      src: images?.[1] ?? "/templates/previews/business/515b796d.jpg",
      alt: "朝食イメージ",
      caption: "朝食ビュッフェ",
      linkEnabled: false,
      linkType: "internal",
      href: "",
      openInNewTab: false,
    },
    {
      src: images?.[2] ?? "/templates/previews/business/4bfe5cc6.jpg",
      alt: "施設イメージ",
      caption: "館内施設",
      linkEnabled: false,
      linkType: "internal",
      href: "",
      openInNewTab: false,
    },
  ],
});

export const imageTiles = (
  items: Array<{ label: string; src?: string }>,
  opts?: { columns?: number; showLabels?: boolean },
) => ({
  title: "",
  columns: opts?.columns ?? 2,
  showLabels: opts?.showLabels !== false,
  items: items.map((item) => ({
    src: item.src ?? SEED_PREVIEW_IMAGE,
    label: item.label,
    linkType: "page",
    pageSlug: "",
    link: "",
  })),
});

export const kpi = (title: string, items: Array<{ label: string; value: string }>) => ({ title, items });

export const schedule = (title: string, items: Array<{ day: string; time: string; label: string }>) => ({
  title,
  dynamicEnabled: false,
  timezone: "Asia/Tokyo",
  rules: [],
  items,
});

export const steps = (title: string, items: Array<{ title: string; description: string }>) => ({ title, items });

export const checklist = (title: string, items: string[]) => ({
  title,
  items: items.map((text) => ({ text, checked: false })),
});

export const faq = (title: string, items: Array<{ q: string; a: string }>) => ({ title, items });

export const menu = (title: string, items: Array<{ name: string; price: string; description: string }>) => ({
  title,
  items,
});

export const drinkMenu = (title: string, items: Array<{ name: string; sizes: string; note: string }>) => ({
  title,
  heroSrc: "/preset-menu-hero-beverage.jpg",
  heroAlt: `${title}のイメージ`,
  items,
});

export const dailySpecial = (
  title: string,
  items: Array<{ name: string; price: string; description: string }>,
) => ({
  title,
  heroSrc: "/preset-menu-hero-dining.jpg",
  heroAlt: `${title}のイメージ`,
  showDate: true,
  items,
});

export const menuCategories = (
  title: string,
  categories: Array<{
    title: string;
    items: Array<{ name: string; price: string; description: string; tag?: string }>;
  }>,
) => ({
  title,
  heroSrc: "/preset-menu-hero-dining.jpg",
  heroAlt: `${title}のイメージ`,
  categories: categories.map((category) => ({
    ...category,
    imageSrc: "/preset-menu-banner-category.jpg",
    imageAlt: `${category.title}のイメージ`,
  })),
});

export const gallery = (title: string, alts: string[]) => ({
  title,
  columns: 2,
  items: alts.map((alt) => ({ src: SEED_PREVIEW_IMAGE, alt, caption: alt })),
});

export const spa = (
  title: string,
  hours: string,
  location: string,
  description: string,
  note = "",
) => ({ title, hours, location, description, note });

export const restaurant = (title: string, time: string, location: string, menuText: string) => ({
  title,
  time,
  location,
  menu: menuText,
});

export const breakfast = (title: string, time: string, location: string, menuText: string) => ({
  title,
  time,
  location,
  menu: menuText,
});

export const breakfastCrowd = (
  title: string,
  level: "open" | "moderate" | "busy" | "closed" = "open",
  note = "",
) => ({
  title,
  level,
  note,
  updatedAt: new Date().toISOString(),
});

export const dinnerCrowd = (
  title: string,
  level: "open" | "moderate" | "busy" | "closed" = "moderate",
  note = "",
) => ({
  title,
  level,
  note,
  updatedAt: new Date().toISOString(),
});

export const spaCrowd = (
  title: string,
  level: "open" | "moderate" | "busy" | "closed" = "open",
  note = "",
) => ({
  title,
  level,
  note,
  updatedAt: new Date().toISOString(),
});

export const checkout = (time: string, note: string, linkLabel = "詳細を見る", title = "チェックアウト") => ({
  title,
  time,
  note,
  linkUrl: "",
  linkLabel,
});

export const emergency = (title: string, hospital: string, note: string) => ({
  title,
  fire: "119",
  police: "110",
  hospital,
  note,
});

export const map = (
  title: string,
  address: string,
  pins: Array<{ name: string; walk?: string; note?: string }> = [],
) => ({
  title,
  address,
  mapEmbedUrl: "",
  accentColor: "#0f766e",
  pins,
});

export const nearby = (title: string, items: Array<{ name: string; description: string }>) => ({
  title,
  items: items.map((item) => ({ ...item, link: "" })),
});

export const laundry = (hours: string, priceNote: string, contact: string, title = "ランドリー") => ({
  title,
  hours,
  priceNote,
  contact,
});

export const contactHub = (title: string, note: string, phone = "03-1234-5678") => ({
  title,
  phone,
  email: "front@example.com",
  lineUrl: "",
  mapUrl: "",
  note,
});

export const socialLinks = (title: string, handle: string) => ({
  title,
  labelStyle: "icon",
  items: [
    { platform: "instagram", label: "Instagram", href: "", handle },
    { platform: "x", label: "X", href: "", handle: handle.replace("@", "@info_") },
  ],
});
