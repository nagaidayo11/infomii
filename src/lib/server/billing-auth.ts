import { getSupabaseAdminServerClient, getSupabaseAnonServerClient } from "@/lib/server/supabase-server";

export const OWNER_ONLY_BILLING_MESSAGE =
  "課金操作はオーナーのみ実行できます。オーナーに依頼してください。";

export async function requireBillingOwner(token: string): Promise<
  | { ok: true; userId: string; hotelId: string }
  | { ok: false; status: number; message: string }
> {
  if (!token) {
    return { ok: false, status: 401, message: "認証トークンがありません" };
  }

  const anon = getSupabaseAnonServerClient();
  const admin = getSupabaseAdminServerClient();

  const {
    data: { user },
    error: userError,
  } = await anon.auth.getUser(token);

  if (userError || !user) {
    return { ok: false, status: 401, message: "認証に失敗しました" };
  }

  const { data: membership, error: memberError } = await admin
    .from("hotel_memberships")
    .select("hotel_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (memberError) {
    return { ok: false, status: 400, message: memberError.message };
  }

  const hotelId = membership?.hotel_id ?? null;
  if (!hotelId) {
    return { ok: false, status: 403, message: OWNER_ONLY_BILLING_MESSAGE };
  }

  const { data: hotel, error: hotelError } = await admin
    .from("hotels")
    .select("owner_user_id")
    .eq("id", hotelId)
    .maybeSingle();

  if (hotelError) {
    return { ok: false, status: 400, message: hotelError.message };
  }

  if (hotel?.owner_user_id !== user.id) {
    return { ok: false, status: 403, message: OWNER_ONLY_BILLING_MESSAGE };
  }

  return { ok: true, userId: user.id, hotelId };
}

export function extractBearerToken(authHeader: string | null): string {
  if (!authHeader?.startsWith("Bearer ")) return "";
  return authHeader.slice("Bearer ".length);
}
