import { getSupabaseAdminServerClient } from "@/lib/server/supabase-server";

type Admin = ReturnType<typeof getSupabaseAdminServerClient>;

/**
 * 複数 user_id の表示名をまとめて取得（足りない id は null）
 */
export async function getDisplayNameMapByUserIds(
  admin: Admin,
  userIds: string[],
): Promise<Map<string, string | null>> {
  const out = new Map<string, string | null>();
  const unique = Array.from(new Set(userIds.filter(Boolean)));
  for (const id of unique) {
    out.set(id, null);
  }
  if (unique.length === 0) return out;

  const { data, error } = await admin.from("profiles").select("user_id, display_name").in("user_id", unique);
  if (error) {
    return out;
  }
  for (const row of data ?? []) {
    if (row.user_id) {
      out.set(row.user_id, row.display_name ?? null);
    }
  }
  return out;
}
