import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

async function getAccessTokenOrThrow(): Promise<string> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase設定が未完了です");
  }
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  if (!session?.access_token) throw new Error("ログインセッションが見つかりません");
  return session.access_token;
}

export async function deleteCurrentUserAccount(): Promise<void> {
  const token = await getAccessTokenOrThrow();
  const response = await fetch("/api/account/delete", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = (await response.json()) as { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || "アカウント削除に失敗しました");
  }
  const supabase = getBrowserSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
}
