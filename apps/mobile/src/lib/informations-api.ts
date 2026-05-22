import { draftBlocksToContentBlocks } from "@/lib/draft-to-blocks";
import { ensureUserHotelScopeForOnboarding } from "@/lib/hotel-scope";
import { mapInformationToCard } from "@/lib/map-information";
import { blocksToBody, blocksToImages, normalizeContentBlocks } from "@/lib/normalize-blocks";
import { createSlug } from "@/lib/slug";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import type { DraftBlock } from "@/types/itinerary";
import type { InformationRow } from "@/types/information";
import type { ItineraryCard } from "@/types/itinerary";

function mapRow(raw: Record<string, unknown>): InformationRow {
  const blocks = normalizeContentBlocks(raw.content_blocks, String(raw.body ?? ""));
  return {
    id: String(raw.id),
    hotel_id: (raw.hotel_id as string | null) ?? null,
    title: String(raw.title ?? ""),
    body: String(raw.body ?? ""),
    images: Array.isArray(raw.images) ? (raw.images as string[]) : [],
    content_blocks: blocks,
    status: raw.status === "published" ? "published" : "draft",
    slug: String(raw.slug ?? ""),
    updated_at: String(raw.updated_at ?? new Date().toISOString()),
  };
}

export async function fetchPublishedItineraries(limit = 24): Promise<ItineraryCard[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("informations")
    .select("id,hotel_id,title,body,images,content_blocks,status,slug,updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map((row) => mapInformationToCard(mapRow(row as Record<string, unknown>)));
}

export async function fetchItineraryById(id: string): Promise<ItineraryCard | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("informations")
    .select("id,hotel_id,title,body,images,content_blocks,status,slug,updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapInformationToCard(mapRow(data as Record<string, unknown>));
}

export async function fetchPublishedBySlug(slug: string): Promise<ItineraryCard | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("informations")
    .select("id,hotel_id,title,body,images,content_blocks,status,slug,updated_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  return mapInformationToCard(mapRow(data as Record<string, unknown>));
}

export async function fetchMyDraftItineraries(): Promise<ItineraryCard[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const hotelId = await ensureUserHotelScopeForOnboarding();
  if (!hotelId) return [];

  const { data, error } = await supabase
    .from("informations")
    .select("id,hotel_id,title,body,images,content_blocks,status,slug,updated_at")
    .eq("hotel_id", hotelId)
    .order("updated_at", { ascending: false })
    .limit(40);

  if (error || !data) return [];
  return data.map((row) => mapInformationToCard(mapRow(row as Record<string, unknown>)));
}

export async function createDraftItinerary(
  title: string,
  draftBlocks: DraftBlock[],
): Promise<string> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase が未設定です");
  }

  const hotelId = await ensureUserHotelScopeForOnboarding();
  if (!hotelId) {
    throw new Error("ログインが必要です");
  }

  const contentBlocks = draftBlocksToContentBlocks(title, draftBlocks);
  const { data, error } = await supabase
    .from("informations")
    .insert({
      hotel_id: hotelId,
      title: title.trim() || "新しいしおり",
      body: blocksToBody(contentBlocks),
      images: blocksToImages(contentBlocks),
      content_blocks: contentBlocks,
      theme: {},
      status: "draft",
      publish_at: null,
      unpublish_at: null,
      slug: createSlug(title),
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function updateDraftItinerary(
  id: string,
  title: string,
  draftBlocks: DraftBlock[],
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase が未設定です");

  const contentBlocks = draftBlocksToContentBlocks(title, draftBlocks);
  const { error } = await supabase
    .from("informations")
    .update({
      title: title.trim() || "新しいしおり",
      body: blocksToBody(contentBlocks),
      images: blocksToImages(contentBlocks),
      content_blocks: contentBlocks,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export function isRemoteItineraryId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export { hasSupabaseEnv };
