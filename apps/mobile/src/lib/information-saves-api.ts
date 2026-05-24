import { getSupabaseClient } from "@/lib/supabase";
import { isRemoteItineraryId } from "@/lib/informations-api";
import type { ItineraryCard } from "@/types/itinerary";

export type SaveTarget = {
  informationId?: string;
  sampleId?: string;
};

export function saveTargetFromCard(item: Pick<ItineraryCard, "id" | "source">): SaveTarget {
  if (item.source === "remote" && isRemoteItineraryId(item.id)) {
    return { informationId: item.id };
  }
  if (item.source === "sample" || !isRemoteItineraryId(item.id)) {
    return { sampleId: item.id };
  }
  return { informationId: item.id };
}

export function saveKeyFromTarget(target: SaveTarget): string {
  if (target.informationId) return `remote:${target.informationId}`;
  if (target.sampleId) return `sample:${target.sampleId}`;
  return "";
}

export function saveKeyFromCard(item: Pick<ItineraryCard, "id" | "source">): string {
  return saveKeyFromTarget(saveTargetFromCard(item));
}

export function targetFromKey(key: string): SaveTarget | null {
  if (key.startsWith("remote:")) return { informationId: key.slice(7) };
  if (key.startsWith("sample:")) return { sampleId: key.slice(7) };
  return null;
}

export async function fetchMySaveKeys(): Promise<string[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) return [];

  const { data, error } = await supabase
    .from("information_saves")
    .select("information_id,sample_id")
    .eq("user_id", session.session.user.id);

  if (error || !data) return [];

  return data
    .map((row) => {
      if (row.information_id) return `remote:${row.information_id}`;
      if (row.sample_id) return `sample:${row.sample_id}`;
      return "";
    })
    .filter(Boolean);
}

export async function saveItinerary(target: SaveTarget): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase が未設定です");

  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user?.id;
  if (!userId) throw new Error("ログインが必要です");

  if (!target.informationId && !target.sampleId) {
    throw new Error("保存対象が不正です");
  }

  const { error } = await supabase.from("information_saves").insert({
    user_id: userId,
    information_id: target.informationId ?? null,
    sample_id: target.sampleId ?? null,
  });

  if (error) {
    if (error.code === "23505") return;
    throw error;
  }
}

export async function unsaveItinerary(target: SaveTarget): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase が未設定です");

  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user?.id;
  if (!userId) throw new Error("ログインが必要です");

  let query = supabase.from("information_saves").delete().eq("user_id", userId);

  if (target.informationId) {
    query = query.eq("information_id", target.informationId);
  } else if (target.sampleId) {
    query = query.eq("sample_id", target.sampleId);
  } else {
    return;
  }

  const { error } = await query;
  if (error) throw error;
}

export async function fetchSaveCountsForInformationIds(
  ids: string[],
): Promise<Record<string, number>> {
  if (!ids.length) return {};
  const supabase = getSupabaseClient();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("information_save_stats")
    .select("information_id,save_count")
    .in("information_id", ids);

  if (error || !data) return {};

  const out: Record<string, number> = {};
  for (const row of data) {
    if (row.information_id) {
      out[row.information_id] = row.save_count ?? 0;
    }
  }
  return out;
}

export async function fetchSampleSaveCounts(): Promise<Record<string, number>> {
  const supabase = getSupabaseClient();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("information_saves")
    .select("sample_id")
    .not("sample_id", "is", null);

  if (error || !data) return {};

  const out: Record<string, number> = {};
  for (const row of data) {
    const id = row.sample_id as string;
    out[id] = (out[id] ?? 0) + 1;
  }
  return out;
}
