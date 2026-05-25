import { getSupabaseClient } from "@/lib/supabase";

export async function redeemHotelInvite(inputCode: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase設定が未完了です");
  }
  const code = inputCode.trim().toUpperCase();
  if (!code) return null;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("ユーザー情報の取得に失敗しました");
  }

  const { data: hotelId, error } = await supabase.rpc("redeem_hotel_invite", {
    input_code: code,
  });
  if (error) throw error;

  return typeof hotelId === "string" ? hotelId : null;
}
