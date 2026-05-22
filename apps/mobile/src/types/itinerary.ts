export type ItineraryCategory = "travel" | "hotel" | "local" | "wellness";

export type ItineraryBlockType =
  | "hero"
  | "schedule"
  | "checklist"
  | "steps"
  | "map"
  | "nearby"
  | "notice"
  | "welcome";

export type ScheduleItem = {
  day: string;
  time: string;
  label: string;
};

export type ItineraryBlock = {
  id: string;
  type: ItineraryBlockType;
  title?: string;
  subtitle?: string;
  body?: string;
  scheduleItems?: ScheduleItem[];
  checklistItems?: string[];
  steps?: { title: string; description: string }[];
  nearby?: { name: string; description: string }[];
};

export type ItineraryCard = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  coverImage: string;
  category: ItineraryCategory;
  location: string;
  duration: string;
  stops: number;
  featured?: boolean;
  popular?: boolean;
  premium?: boolean;
  blocks: ItineraryBlock[];
  /** Sample cards use `sample`; Supabase rows use `remote`. */
  source?: "sample" | "remote";
  status?: "draft" | "published";
};

export type DraftBlock = {
  id: string;
  type: ItineraryBlockType;
  title: string;
};
