/** Shared block content builders for marketplace seed templates (hotel + legacy). */

export const SEED_PREVIEW_IMAGE = "/preset-hero-sample.png" as const;

export const hero = (title: string, subtitle: string) => ({
  title,
  subtitle,
  image: SEED_PREVIEW_IMAGE,
  widthMode: "full",
});

export const welcome = (title: string, message: string) => ({ title, message });
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
) => ({ title, icon, rows });

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

export const tabsInfo = (title: string, tabs: Array<{ label: string; body: string }>) => ({
  title,
  defaultIndex: 0,
  tabs,
});

export const accordionInfo = (title: string, items: Array<{ title: string; body: string }>) => ({
  title,
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
  items: Array<{ label: string; icon: string }>,
  columns = 2,
) => ({
  title,
  columns,
  iconSize: "md",
  styleVariant: "tile",
  tileShadowStrength: "md",
  circleIconShadowStrength: "md",
  items: items.map((item) => ({ ...item, linkType: "page", pageSlug: "", link: "" })),
});

export const heroSlider = (title: string) => ({
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
      src: SEED_PREVIEW_IMAGE,
      alt: "館内イメージ",
      caption: "ご滞在のご案内",
      linkEnabled: false,
      linkType: "internal",
      href: "",
      openInNewTab: false,
    },
    {
      src: "/templates/previews/business/515b796d.jpg",
      alt: "朝食イメージ",
      caption: "朝食ビュッフェ",
      linkEnabled: false,
      linkType: "internal",
      href: "",
      openInNewTab: false,
    },
    {
      src: "/templates/previews/business/4bfe5cc6.jpg",
      alt: "施設イメージ",
      caption: "館内施設",
      linkEnabled: false,
      linkType: "internal",
      href: "",
      openInNewTab: false,
    },
  ],
});

export const circlePageLinks = (items: Array<{ label: string; icon: string }>) => ({
  title: "",
  columns: 3,
  iconSize: "md",
  styleVariant: "circle" as const,
  tileShadowStrength: "md",
  circleIconShadowStrength: "md",
  items: items.map((item) => ({ ...item, linkType: "page", pageSlug: "", link: "" })),
});

export const imageTiles = (items: Array<{ label: string; src?: string }>, columns = 2) => ({
  title: "",
  columns,
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
export const faqSearch = (title: string, items: Array<{ q: string; a: string }>) => ({ title, items });

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
  items: alts.map((alt) => ({ src: SEED_PREVIEW_IMAGE, alt })),
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

export const map = (title: string, address: string) => ({ title, address, mapEmbedUrl: "" });

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
