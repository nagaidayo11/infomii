import { ensureUserHotelScopeForOnboarding } from "@/lib/hotel-scope";
import { mapPageToItineraryCard } from "@/lib/map-page-cards";
import {
  createPageWithInformation,
  ensureInformationForPage,
  fetchPageBundleByInformationId,
  fetchPageCards,
  fetchPageBySlug,
  savePageCards,
  updateInformationMeta,
  updatePageTitle,
} from "@/lib/pages-api";
import { createSlug } from "@/lib/slug";
import { resolveCardImageUrls } from "@/lib/upload-page-asset";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import type { EditorCard } from "@/types/editor-card";
import type { InformationRow } from "@/types/information";
import type { ItineraryCard } from "@/types/itinerary";

function mapRowToCard(row: Record<string, unknown>): InformationRow {
  return {
    id: String(row.id),
    hotel_id: (row.hotel_id as string | null) ?? null,
    title: String(row.title ?? ""),
    body: String(row.body ?? ""),
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    content_blocks: [],
    status: row.status === "published" ? "published" : "draft",
    slug: String(row.slug ?? ""),
    updated_at: String(row.updated_at ?? new Date().toISOString()),
  };
}

async function rowToItineraryCard(row: Record<string, unknown>): Promise<ItineraryCard | null> {
  const info = mapRowToCard(row);
  const bundle = await fetchPageBundleByInformationId(info.id);
  if (bundle) {
    return mapPageToItineraryCard({
      informationId: info.id,
      pageId: bundle.page.id,
      title: bundle.page.title || info.title,
      slug: bundle.page.slug,
      status: info.status,
      hotelId: info.hotel_id,
      cards: bundle.cards,
    });
  }

  const page = await fetchPageBySlug(info.slug);
  const cards = page ? await fetchPageCards(page.id) : [];
  return mapPageToItineraryCard({
    informationId: info.id,
    pageId: page?.id ?? info.id,
    title: info.title,
    slug: info.slug,
    status: info.status,
    hotelId: info.hotel_id,
    cards,
  });
}

export async function fetchPublishedItineraries(limit = 24): Promise<ItineraryCard[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("informations")
    .select("id,hotel_id,title,body,images,status,slug,updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  const cards = await Promise.all(
    data.map((row) => rowToItineraryCard(row as Record<string, unknown>)),
  );
  return cards.filter((c): c is ItineraryCard => Boolean(c));
}

export async function fetchItineraryById(id: string): Promise<ItineraryCard | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("informations")
    .select("id,hotel_id,title,body,images,status,slug,updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return rowToItineraryCard(data as Record<string, unknown>);
}

export async function fetchPublishedBySlug(slug: string): Promise<ItineraryCard | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("informations")
    .select("id,hotel_id,title,body,images,status,slug,updated_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  return rowToItineraryCard(data as Record<string, unknown>);
}

export async function fetchMyDraftItineraries(): Promise<ItineraryCard[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const hotelId = await ensureUserHotelScopeForOnboarding();
  if (!hotelId) return [];

  const { data, error } = await supabase
    .from("informations")
    .select("id,hotel_id,title,body,images,status,slug,updated_at")
    .eq("hotel_id", hotelId)
    .eq("status", "draft")
    .order("updated_at", { ascending: false })
    .limit(40);

  if (error || !data) return [];
  const cards = await Promise.all(
    data.map((row) => rowToItineraryCard(row as Record<string, unknown>)),
  );
  return cards.filter((c): c is ItineraryCard => Boolean(c));
}

export type SavePageDraftInput = {
  title: string;
  pageId: string;
  slug: string;
  informationId?: string;
  cards: EditorCard[];
};

export async function savePageDraft(input: SavePageDraftInput): Promise<{
  pageId: string;
  slug: string;
  informationId: string;
}> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase が未設定です");

  const hotelId = await ensureUserHotelScopeForOnboarding();
  if (!hotelId) throw new Error("ログインが必要です");

  const title = input.title.trim() || "新しいしおり";
  await updatePageTitle(input.pageId, title);

  const prefix = input.pageId;
  const { cards: resolved, errors } = await resolveCardImageUrls(input.cards, prefix);
  if (errors.length) throw new Error(errors[0]);

  const { updatedIds } = await savePageCards(input.pageId, resolved);
  let cards = resolved.map((card) => (updatedIds[card.id] ? { ...card, id: updatedIds[card.id] } : card));
  if (Object.keys(updatedIds).length) {
    const second = await savePageCards(input.pageId, cards);
    cards = cards.map((card) => (second.updatedIds[card.id] ? { ...card, id: second.updatedIds[card.id] } : card));
  }

  let informationId = input.informationId;
  if (!informationId) {
    const { data } = await supabase
      .from("informations")
      .select("id")
      .eq("slug", input.slug)
      .maybeSingle();
    informationId = data?.id as string | undefined;
  }
  if (!informationId) {
    informationId = await ensureInformationForPage(hotelId, input.slug, title);
  }

  await updateInformationMeta(informationId, { title });

  return { pageId: input.pageId, slug: input.slug, informationId };
}

export async function createNewPageDraft(title: string): Promise<{
  pageId: string;
  slug: string;
  informationId: string;
}> {
  const hotelId = await ensureUserHotelScopeForOnboarding();
  if (!hotelId) throw new Error("ログインが必要です");
  return createPageWithInformation(hotelId, title);
}

export async function publishItinerary(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase が未設定です");

  const hotelId = await ensureUserHotelScopeForOnboarding();
  if (!hotelId) throw new Error("ログインが必要です");

  const { error } = await supabase
    .from("informations")
    .update({
      status: "published",
      publish_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("hotel_id", hotelId);

  if (error) throw error;
}

export async function upsertPageDraftFromLocal(input: SavePageDraftInput): Promise<{
  pageId: string;
  slug: string;
  informationId: string;
}> {
  return savePageDraft(input);
}

export async function searchPublishedItineraries(query: string, limit = 24): Promise<ItineraryCard[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const q = query.trim();
  if (!q) return fetchPublishedItineraries(limit);

  const escaped = q.replace(/[%_]/g, "\\$&");
  const pattern = `%${escaped}%`;
  const { data, error } = await supabase
    .from("informations")
    .select("id,hotel_id,title,body,images,status,slug,updated_at")
    .eq("status", "published")
    .or(`title.ilike."${pattern}",body.ilike."${pattern}",slug.ilike."${pattern}"`)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  const cards = await Promise.all(
    data.map((row) => rowToItineraryCard(row as Record<string, unknown>)),
  );
  return cards.filter((c): c is ItineraryCard => Boolean(c));
}

export async function recordItineraryView(
  informationId: string,
  slug: string,
  hotelId: string | null,
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase || !hotelId) return;

  await supabase.from("information_views").insert({
    information_id: informationId,
    hotel_id: hotelId,
    slug,
    source: "mobile",
  });
}

export function isRemoteItineraryId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/** @deprecated cards 正本へ移行。savePageDraft を使用 */
export async function upsertDraftFromLocal(
  title: string,
  _draftBlocks: unknown,
  existingId?: string,
  _uploadPrefix?: string,
): Promise<string> {
  void _draftBlocks;
  void _uploadPrefix;
  if (existingId) return existingId;
  const created = await createNewPageDraft(title);
  return created.informationId;
}

export { hasSupabaseEnv, createSlug };
