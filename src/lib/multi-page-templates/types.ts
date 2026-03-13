/**
 * Multi-page template system for infomii.
 * Templates are stored as JSON; selecting one creates multiple pages with predefined blocks.
 *
 * Block types: Title, Text, Image, Button, Icon (map to page-editor blocks).
 */

export type TemplateBlockType = "title" | "text" | "image" | "button" | "icon";

export type TemplateBlock =
  | { type: "title"; content: string }
  | { type: "text"; content: string }
  | { type: "image"; src: string; alt?: string }
  | { type: "button"; label: string; href?: string }
  | { type: "icon"; icon: string; label?: string };

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
  | "minpaku";
