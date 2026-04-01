import { getSupabaseAdminServerClient } from "@/lib/server/supabase-server";

/**
 * 公開ゲスト画面でデフォルトフッターを出さないか。
 * DB フラグが on でも、Business プランでない場合は false（ダウングレード時にフッター復帰）。
 */
export async function resolveGuestFooterHidden(hotelId: string | null | undefined): Promise<boolean> {
  if (!hotelId) return false;
  try {
    const admin = getSupabaseAdminServerClient();
    const [{ data: hotel }, { data: sub }] = await Promise.all([
      admin.from("hotels").select("hide_guest_footer").eq("id", hotelId).maybeSingle(),
      admin.from("subscriptions").select("plan").eq("hotel_id", hotelId).maybeSingle(),
    ]);
    if (!hotel?.hide_guest_footer) return false;
    return sub?.plan === "business";
  } catch {
    return false;
  }
}
