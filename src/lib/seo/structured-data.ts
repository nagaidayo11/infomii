/**
 * JSON-LD (schema.org) builders for SEO rich results.
 * Keep values in sync with LP copy and pricing single-sources.
 */
import { PLAN_MONTHLY_YEN } from "@/lib/plan-pricing";

export const SEO_APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://infomii.com").replace(/\/$/, "");

const ORG_ID = `${SEO_APP_URL}/#organization`;
const WEBSITE_ID = `${SEO_APP_URL}/#website`;

export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "Infomii",
    url: SEO_APP_URL,
    logo: `${SEO_APP_URL}/icon-512.png`,
    description: "ホテル・宿泊施設向けの案内ページをスマホ・QRで公開できるSaaS。",
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: "Infomii",
    url: SEO_APP_URL,
    inLanguage: "ja",
    publisher: { "@id": ORG_ID },
  };
}

/**
 * SoftwareApplication with plan offers. Prices are ex-first-tier (Free=0).
 */
export function softwareApplicationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Infomii",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    url: SEO_APP_URL,
    publisher: { "@id": ORG_ID },
    description:
      "ホテル向け案内ページを最短3分で作成・公開。編集画面から即時更新でき、QR運用にも対応。",
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "JPY",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: String(PLAN_MONTHLY_YEN.pro),
        priceCurrency: "JPY",
      },
      {
        "@type": "Offer",
        name: "Business",
        price: String(PLAN_MONTHLY_YEN.business),
        priceCurrency: "JPY",
      },
    ],
  };
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SEO_APP_URL}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  };
}

export function itemListJsonLd(
  name: string,
  items: Array<{ name: string; path: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: `${SEO_APP_URL}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  };
}

export type FaqItem = { q: string; a: string };

export function faqJsonLd(items: readonly FaqItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export type ArticleJsonLdInput = {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
};

export function articleJsonLd(input: ArticleJsonLdInput): Record<string, unknown> {
  const url = `${SEO_APP_URL}/blog/${input.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    inLanguage: "ja",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    image: input.image ?? `${url}/opengraph-image`,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}
