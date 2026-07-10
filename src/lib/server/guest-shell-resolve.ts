import type { SupabaseClient } from "@supabase/supabase-js";
import type { GuestShellConfig } from "@/lib/guest-shell";
import {
  getConnectionRootPageIdForPage,
  resolveEffectiveGuestShell,
} from "@/lib/page-guest-shell";

/** Server-side guest shell resolution for a page (page → root → hotel). */
export async function fetchResolvedGuestShellForPage(
  supabase: SupabaseClient,
  page: { id: string; hotel_id: string | null },
): Promise<GuestShellConfig> {
  const hotelId = page.hotel_id;
  if (!hotelId) {
    return resolveEffectiveGuestShell({
      pageId: page.id,
      pageShell: null,
      rootPageId: page.id,
      rootShell: null,
      hotelShell: null,
    });
  }

  const [{ data: pageRow }, { rootPageId }, { data: hotelRow }] = await Promise.all([
    supabase.from("pages").select("guest_shell").eq("id", page.id).maybeSingle(),
    getConnectionRootPageIdForPage(supabase, hotelId, page.id),
    supabase.from("hotels").select("guest_shell").eq("id", hotelId).maybeSingle(),
  ]);

  let rootShell: unknown | null = null;
  if (rootPageId !== page.id) {
    const { data: rootRow } = await supabase
      .from("pages")
      .select("guest_shell")
      .eq("id", rootPageId)
      .maybeSingle();
    rootShell = (rootRow as { guest_shell?: unknown } | null)?.guest_shell ?? null;
  }

  const pageShell = (pageRow as { guest_shell?: unknown } | null)?.guest_shell ?? null;
  const hotelShell = (hotelRow as { guest_shell?: unknown } | null)?.guest_shell ?? null;

  return resolveEffectiveGuestShell({
    pageId: page.id,
    pageShell,
    rootPageId,
    rootShell,
    hotelShell,
  });
}
