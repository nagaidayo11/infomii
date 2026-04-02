/**
 * Multi-page template system for infomii.
 * Templates are stored as JSON; selecting one creates multiple pages with predefined blocks.
 *
 * Block types map to public InformationBlock variants.
 */

export type TemplateBlockType =
  | "title"
  | "heading"
  | "text"
  | "image"
  | "button"
  | "icon"
  | "section"
  | "iconRow"
  | "checklist"
  | "hours"
  | "pricing"
  | "quote";

export type TemplateIconRowItem = {
  icon: string;
  label: string;
  link?: string;
};

export type TemplateKeyValueItem = {
  label: string;
  value: string;
};

export type TemplateBlock =
  | { type: "title"; content: string }
  | { type: "heading"; content: string }
  | { type: "text"; content: string }
  | { type: "image"; src: string; alt?: string }
  | { type: "button"; label: string; href?: string }
  | { type: "icon"; icon: string; label?: string; description?: string }
  | { type: "section"; title: string; body: string }
  | { type: "iconRow"; items: TemplateIconRowItem[] }
  | { type: "checklist"; items: string[] }
  | { type: "hours"; items: TemplateKeyValueItem[] }
  | { type: "pricing"; items: TemplateKeyValueItem[] }
  | { type: "quote"; text: string; author?: string };

export type TemplatePage = {
  title: string;
  blocks: TemplateBlock[];
};

export type MultiPageTemplate = {
  id: string;
  name: string;
  description: string;
  /** Card preview image URL */
  previewImage: string;
  /** Page titles + default blocks for each page */
  pages: TemplatePage[];
};

export type MultiPageTemplateId =
  | "hotel-basic"
  | "business-hotel"
  | "ryokan"
  | "minpaku"
  | "hotel-kurekake";
