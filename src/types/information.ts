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

export type IconRowItem = {
  id: string;
  icon: string;
  label: string;
  nodeId?: string;
  link?: string;
  backgroundColor?: string;
};

export type KeyValueItem = {
  id: string;
  label: string;
  value: string;
};

export type ChecklistItem = {
  id: string;
  text: string;
};

export type GalleryItem = {
  id: string;
  url: string;
  caption: string;
};

export type ColumnGroupItem = {
  id: string;
  title: string;
  body: string;
};

export type NodeMapNode = {
  id: string;
  title: string;
  icon: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  targetSlug?: string;
};

export type NodeMapEdge = {
  id: string;
  from: string;
  to: string;
};

export type NodeMap = {
  enabled: boolean;
  nodes: NodeMapNode[];
  edges: NodeMapEdge[];
};

export type InformationBlock = {
  id: string;
  type: InformationBlockType;
  text?: string;
  url?: string;
  icon?: string;
  label?: string;
  description?: string;
  textSize?: "sm" | "md" | "lg";
  textColor?: string;
  textWeight?: "normal" | "medium" | "semibold";
  textAlign?: "left" | "center" | "right";
  spacing?: "sm" | "md" | "lg";
  dividerThickness?: "thin" | "medium" | "thick";
  dividerColor?: string;
  cardRadius?: "sm" | "md" | "lg" | "xl" | "full";
  sectionTitle?: string;
  sectionBody?: string;
  sectionBackgroundColor?: string;
  leftTitle?: string;
  leftText?: string;
  rightTitle?: string;
  rightText?: string;
  columnsBackgroundColor?: string;
  iconRowBackgroundColor?: string;
  iconItems?: IconRowItem[];
  ctaLabel?: string;
  ctaUrl?: string;
  badgeText?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  hoursItems?: KeyValueItem[];
  pricingItems?: KeyValueItem[];
  quoteAuthor?: string;
  checklistItems?: ChecklistItem[];
  galleryItems?: GalleryItem[];
  columnGroupItems?: ColumnGroupItem[];
};

export type InformationTheme = {
  backgroundColor?: string;
  textColor?: string;
  titleSize?: "sm" | "md" | "lg";
  titleColor?: string;
  titleWeight?: "normal" | "medium" | "semibold";
  titleAlign?: "left" | "center" | "right";
  bodySize?: "sm" | "md" | "lg";
  nodeMap?: NodeMap;
};

export type Information = {
  id: string;
  title: string;
  body: string;
  images: string[];
  contentBlocks: InformationBlock[];
  theme: InformationTheme;
  status: InformationStatus;
  publishAt: string | null;
  unpublishAt: string | null;
  slug: string;
  updatedAt: string;
};
