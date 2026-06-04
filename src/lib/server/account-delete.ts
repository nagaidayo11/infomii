import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

type AdminClient = SupabaseClient<Database>;

export async function deleteHotelAndRelated(admin: AdminClient, hotelId: string): Promise<void> {
  const { data: pages } = await admin.from("pages").select("id").eq("hotel_id", hotelId);
  const pageIds = (pages ?? []).map((p) => p.id);

  if (pageIds.length > 0) {
    await admin.from("cards").delete().in("page_id", pageIds);
    await admin.from("page_views").delete().in("page_id", pageIds);
    await admin.from("pages").delete().eq("hotel_id", hotelId);
  }

  await admin.from("publish_approval_requests").delete().eq("hotel_id", hotelId);
  await admin.from("information_views").delete().eq("hotel_id", hotelId);
  await admin.from("informations").delete().eq("hotel_id", hotelId);
  await admin.from("hotel_invites").delete().eq("hotel_id", hotelId);
  await admin.from("audit_logs").delete().eq("hotel_id", hotelId);
  await admin.from("subscriptions").delete().eq("hotel_id", hotelId);
  await admin.from("hotel_memberships").delete().eq("hotel_id", hotelId);
  await admin.from("hotels").delete().eq("id", hotelId);
}

export type AccountDeleteBlockReason =
  | "team_members_present"
  | "active_subscription"
  | "not_owner";

export async function resolveAccountDeletion(
  admin: AdminClient,
  userId: string,
): Promise<{ ok: true } | { ok: false; reason: AccountDeleteBlockReason; message: string }> {
  const { data: membership } = await admin
    .from("hotel_memberships")
    .select("hotel_id, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (!membership?.hotel_id) {
    return { ok: true };
  }

  const { data: hotel } = await admin
    .from("hotels")
    .select("owner_user_id")
    .eq("id", membership.hotel_id)
    .maybeSingle();

  const isOwner = hotel?.owner_user_id === userId;

  if (!isOwner) {
    await admin.from("hotel_memberships").delete().eq("user_id", userId);
    return { ok: true };
  }

  const { count: memberCount } = await admin
    .from("hotel_memberships")
    .select("user_id", { count: "exact", head: true })
    .eq("hotel_id", membership.hotel_id);

  if ((memberCount ?? 0) > 1) {
    return {
      ok: false,
      reason: "team_members_present",
      message:
        "他のメンバーがワークスペースに参加しています。オーナー権限の移譲またはメンバー削除の後に、アカウント削除を行ってください。",
    };
  }

  const { data: sub } = await admin
    .from("subscriptions")
    .select("plan, status, stripe_subscription_id")
    .eq("hotel_id", membership.hotel_id)
    .maybeSingle();

  const paidActive =
    (sub?.plan === "pro" || sub?.plan === "business") &&
    (sub?.status === "active" || sub?.status === "trialing") &&
    Boolean(sub?.stripe_subscription_id);

  if (paidActive) {
    return {
      ok: false,
      reason: "active_subscription",
      message:
        "有料プランが有効です。アプリの「プラン」または Web の請求管理から解約した後、再度お試しください。",
    };
  }

  await deleteHotelAndRelated(admin, membership.hotel_id);
  return { ok: true };
}
