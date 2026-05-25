/** Web `informations.content_blocks` schema (shared with Infomii web). */

export type InformationStatus = "draft" | "published";

export type InformationBlockType =
  | "title"
  | "heading"
  | "paragraph"
  | "image"
  | "divider"
  | "icon"
  | "space"
  | "section"
  | "columns"
  | "iconRow"
  | "cta"
  | "badge"
  | "hours"
  | "pricing"
  | "quote"
  | "checklist"
  | "gallery"
  | "columnGroup";

export type KeyValueItem = {
  id: string;
  label: string;
  value: string;
  /** schedule の day など */
  description?: string;
};
export type ChecklistItem = { id: string; text: string };
export type GalleryItem = { id: string; url: string; caption?: string };

export type InformationBlock = {
  id: string;
  type: InformationBlockType;
  text?: string;
  url?: string;
  label?: string;
  description?: string;
  sectionTitle?: string;
  sectionBody?: string;
  hoursItems?: KeyValueItem[];
  checklistItems?: ChecklistItem[];
  pricingItems?: KeyValueItem[];
  galleryItems?: GalleryItem[];
  quoteAuthor?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  badgeText?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  textColor?: string;
};

export type InformationRow = {
  id: string;
  hotel_id: string | null;
  title: string;
  body: string;
  images: string[];
  content_blocks: InformationBlock[];
  status: InformationStatus;
  slug: string;
  updated_at: string;
};
