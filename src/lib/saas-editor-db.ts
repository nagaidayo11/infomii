/**
 * SaaS Editor — load/save pages and blocks to Supabase.
 * Table: saas_editor_pages (id, title, slug, user_id, blocks jsonb, created_at, updated_at)
 */

import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import type { SaasBlock } from "@/components/saas-editor/types";

export type SaasEditorPageRow = {
  id: string;
  title: string;
  slug: string | null;
  user_id: string | null;
  blocks: SaasBlock[];
  created_at: string;
  updated_at: string;
};

export async function loadSaasPage(pageId: string): Promise<SaasEditorPageRow | null> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("saas_editor_pages")
    .select("*")
    .eq("id", pageId)
    .single();
  if (error || !data) return null;
  return data as unknown as SaasEditorPageRow;
}

export async function saveSaasPageBlocks(
  pageId: string,
  blocks: SaasBlock[]
): Promise<{ error: Error | null }> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    return { error: new Error("Supabase not configured") };
  }
  const { error } = await supabase
    .from("saas_editor_pages")
    .update({
      blocks: blocks as unknown as Record<string, unknown>[],
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId);
  return { error: error ? new Error(error.message) : null };
}

export async function createSaasPage(title: string): Promise<SaasEditorPageRow | null> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) return null;
  const slug = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("saas_editor_pages")
    .insert({
      title,
      slug,
      user_id: user.user?.id ?? null,
      blocks: [],
    })
    .select()
    .single();
  if (error || !data) return null;
  return data as unknown as SaasEditorPageRow;
}
