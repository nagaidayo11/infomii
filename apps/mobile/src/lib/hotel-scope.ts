import { getSupabaseClient } from "@/lib/supabase";

function buildDefaultHotelName(email: string | null | undefined): string {
  if (!email) return "My Store";
  const label = email.split("@")[0]?.trim();
  return label ? `${label} Store` : "My Store";
}

export async function ensureUserHotelScope(): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) return null;

  const { data: membership, error: membershipError } = await supabase
    .from("hotel_memberships")
    .select("hotel_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (membershipError) throw membershipError;
  if (membership?.hotel_id) {
    await supabase.rpc("ensure_hotel_subscription", {
      target_hotel_id: membership.hotel_id,
    });
    return membership.hotel_id;
  }
  return null;
}

export async function ensureUserHotelScopeForOnboarding(): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) return null;

  const existing = await ensureUserHotelScope();
  if (existing) return existing;

  const hotelId =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `hotel-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const { error: hotelError } = await supabase.from("hotels").insert({
    id: hotelId,
    name: buildDefaultHotelName(user.email),
    owner_user_id: user.id,
  });
  if (hotelError) throw hotelError;

  const { error: membershipError } = await supabase.from("hotel_memberships").insert({
    user_id: user.id,
    hotel_id: hotelId,
  });
  if (membershipError) throw membershipError;

  await supabase.rpc("ensure_hotel_subscription", { target_hotel_id: hotelId });
  return hotelId;
}
