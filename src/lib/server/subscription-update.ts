import type { PostgrestError } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

function columnFromSchemaError(message: string): string | null {
  const pgrst = message.match(/Could not find the '([^']+)' column/i);
  if (pgrst?.[1]) return pgrst[1];
  const pg = message.match(/column subscriptions\.([a-z0-9_]+) does not exist/i);
  if (pg?.[1]) return pg[1];
  return null;
}

export function isSubscriptionsSchemaCacheError(error: PostgrestError | null | undefined): boolean {
  if (!error) return false;
  if (error.code === "42703" || error.code === "PGRST204") return true;
  return /schema cache/i.test(error.message ?? "");
}

/**
 * Update subscriptions row, omitting columns missing from the live DB schema (PostgREST cache).
 */
export async function updateHotelSubscription(
  admin: SupabaseClient,
  hotelId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  let current: Record<string, unknown> = { ...patch };

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const { error } = await admin.from("subscriptions").update(current).eq("hotel_id", hotelId);
    if (!error) return;

    const missingColumn = columnFromSchemaError(error.message ?? "");
    if (!missingColumn || !(missingColumn in current)) {
      throw new Error(error.message);
    }

    const next = { ...current };
    delete next[missingColumn];
    current = next;
  }

  throw new Error("Subscription update failed after schema fallbacks");
}
