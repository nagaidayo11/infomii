import { createSlug } from "@/lib/slug";
import { getSupabaseClient } from "@/lib/supabase";
import type { EditorCard } from "@/types/editor-card";

const STYLE_KEY = "_style";
const PAGE_STYLE_KEY = "_pageStyle";
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type PageRow = {
  id: string;
  title: string;
  slug: string;
  hotel_id: string;
};

export type PageBundle = {
  page: PageRow;
  informationId: string | null;
  cards: EditorCard[];
};

type DbCardRow = {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order: number | null;
};

function isSupabaseId(id: string): boolean {
  return UUID_REGEX.test(id);
}

function rowToCard(row: DbCardRow): EditorCard {
  const content = { ...row.content };
  const style = content[STYLE_KEY] as Record<string, unknown> | undefined;
  delete content[STYLE_KEY];
  delete content[PAGE_STYLE_KEY];
  return {
    id: row.id,
    type: row.type as EditorCard["type"],
    content,
    ...(style && typeof style === "object" ? { style } : {}),
    order: typeof row.order === "number" ? row.order : 0,
  };
}

export async function fetchPageBySlug(slug: string): Promise<PageRow | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("pages")
    .select("id,title,slug,hotel_id")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as PageRow;
}

export async function fetchPageById(pageId: string): Promise<PageRow | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("pages")
    .select("id,title,slug,hotel_id")
    .eq("id", pageId)
    .maybeSingle();
  if (error || !data) return null;
  return data as PageRow;
}

export async function fetchInformationIdBySlug(slug: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.from("informations").select("id").eq("slug", slug).maybeSingle();
  return data?.id ?? null;
}

export async function fetchPageCards(pageId: string): Promise<EditorCard[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("cards")
    .select("id,type,content,order")
    .eq("page_id", pageId)
    .order("order", { ascending: true });
  if (error || !data) return [];
  return (data as DbCardRow[]).map(rowToCard);
}

export async function createPageWithInformation(
  hotelId: string,
  title: string,
): Promise<{ pageId: string; slug: string; informationId: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase が未設定です");

  const trimmed = title.trim() || "新しいしおり";
  const baseSlug = createSlug(trimmed);
  const slug = `${baseSlug}-${Date.now().toString(36).slice(2, 8)}`;

  const { data: page, error: pageError } = await supabase
    .from("pages")
    .insert({ hotel_id: hotelId, title: trimmed, slug })
    .select("id,slug")
    .single();
  if (pageError || !page) throw pageError ?? new Error("ページの作成に失敗しました");

  const pageId = page.id as string;
  const pageSlug = page.slug as string;

  const { data: info, error: infoError } = await supabase
    .from("informations")
    .insert({
      hotel_id: hotelId,
      title: trimmed,
      body: "",
      images: [],
      content_blocks: [],
      theme: {},
      status: "draft",
      publish_at: null,
      unpublish_at: null,
      slug: pageSlug,
    })
    .select("id")
    .single();
  if (infoError || !info) throw infoError ?? new Error("下書き情報の作成に失敗しました");

  return { pageId, slug: pageSlug, informationId: info.id as string };
}

export async function ensureInformationForPage(
  hotelId: string,
  slug: string,
  title: string,
): Promise<string> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase が未設定です");

  const { data: existing } = await supabase
    .from("informations")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing?.id) return existing.id as string;

  const { data, error } = await supabase
    .from("informations")
    .insert({
      hotel_id: hotelId,
      title: title.trim() || "新しいしおり",
      body: "",
      images: [],
      content_blocks: [],
      theme: {},
      status: "draft",
      publish_at: null,
      unpublish_at: null,
      slug,
    })
    .select("id")
    .single();
  if (error || !data) throw error ?? new Error("informations の作成に失敗しました");
  return data.id as string;
}

export async function updatePageTitle(pageId: string, title: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.from("pages").update({ title: title.trim() || "新しいしおり" }).eq("id", pageId);
}

export async function updateInformationMeta(
  informationId: string,
  patch: { title?: string; slug?: string },
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase
    .from("informations")
    .update({
      ...(patch.title !== undefined ? { title: patch.title.trim() || "新しいしおり" } : {}),
      ...(patch.slug !== undefined ? { slug: patch.slug } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", informationId);
}

/** Web `savePageCards` と同じ永続化（cards が正本）。 */
export async function savePageCards(
  pageId: string,
  cards: EditorCard[],
): Promise<{ updatedIds: Record<string, string> }> {
  const supabase = getSupabaseClient();
  const updatedIds: Record<string, string> = {};
  if (!supabase) return { updatedIds };

  const { data: existingRows, error: existingError } = await supabase
    .from("cards")
    .select("id")
    .eq("page_id", pageId);
  if (existingError) throw existingError;

  const existingIds = new Set((existingRows ?? []).map((r) => r.id as string));
  const storeIds = new Set(cards.map((c) => c.id));

  for (let index = 0; index < cards.length; index += 1) {
    const card = cards[index];
    const contentBase = { ...card.content };
    delete contentBase[STYLE_KEY];
    delete contentBase[PAGE_STYLE_KEY];
    const contentToSave =
      card.style && Object.keys(card.style).length > 0
        ? { ...contentBase, [STYLE_KEY]: card.style }
        : contentBase;

    if (isSupabaseId(card.id)) {
      const { error } = await supabase
        .from("cards")
        .update({ content: contentToSave, order: index, type: card.type })
        .eq("id", card.id);
      if (error) throw error;
    } else {
      const { data: inserted, error } = await supabase
        .from("cards")
        .insert({
          page_id: pageId,
          type: card.type,
          content: contentToSave,
          order: index,
        })
        .select("id")
        .single();
      if (error) throw error;
      if (inserted?.id) updatedIds[card.id] = inserted.id as string;
    }
  }

  const toDelete = [...existingIds].filter((id) => !storeIds.has(id));
  for (const id of toDelete) {
    const { error } = await supabase.from("cards").delete().eq("id", id);
    if (error) throw error;
  }

  return { updatedIds };
}

export async function fetchPageBundleByInformationId(
  informationId: string,
): Promise<PageBundle | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: info, error: infoError } = await supabase
    .from("informations")
    .select("id,title,slug,hotel_id,status")
    .eq("id", informationId)
    .maybeSingle();
  if (infoError || !info) return null;

  const slug = info.slug as string;
  let page = await fetchPageBySlug(slug);
  if (!page && info.hotel_id) {
    const { data: created } = await supabase
      .from("pages")
      .insert({
        hotel_id: info.hotel_id,
        title: info.title as string,
        slug,
      })
      .select("id,title,slug,hotel_id")
      .single();
    if (created) page = created as PageRow;
  }
  if (!page) return null;

  const cards = await fetchPageCards(page.id);
  return {
    page,
    informationId: info.id as string,
    cards,
  };
}

export async function fetchHotelPlan(hotelId: string): Promise<"free" | "pro" | "business" | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("hotel_id", hotelId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const plan = data?.plan;
  if (plan === "business" || plan === "pro" || plan === "free") return plan;
  return null;
}
