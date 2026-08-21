import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminServerClient, getSupabaseAnonServerClient } from "@/lib/server/supabase-server";
import { isOpsAdminUser } from "@/lib/server/ops-auth";

export const runtime = "nodejs";

/**
 * Platform-wide growth snapshot for ops admins (weekly KPI sheet).
 * GET /api/ops/growth  Authorization: Bearer <access_token>
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : "";
    if (!token) {
      return NextResponse.json({ message: "認証トークンがありません" }, { status: 401 });
    }

    const anon = getSupabaseAnonServerClient();
    const {
      data: { user },
      error: userError,
    } = await anon.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ message: "認証に失敗しました" }, { status: 401 });
    }
    if (!isOpsAdminUser(user)) {
      return NextResponse.json({ message: "運用センターへのアクセス権限がありません" }, { status: 403 });
    }

    const admin = getSupabaseAdminServerClient();
    const since28d = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString();
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      usersPage,
      hotelsAll,
      hotels28d,
      memberships,
      informations,
      published,
      pages,
      subscriptions,
      published28d,
    ] = await Promise.all([
      admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      admin.from("hotels").select("id", { count: "exact", head: true }),
      admin.from("hotels").select("id", { count: "exact", head: true }).gte("created_at", since28d),
      admin.from("hotel_memberships").select("hotel_id"),
      admin.from("informations").select("id", { count: "exact", head: true }),
      admin.from("informations").select("id", { count: "exact", head: true }).eq("status", "published"),
      admin.from("pages").select("id", { count: "exact", head: true }),
      admin.from("subscriptions").select("plan,status,hotel_id,updated_at"),
      admin
        .from("informations")
        .select("id", { count: "exact", head: true })
        .eq("status", "published")
        .gte("updated_at", since28d),
    ]);

    const authUsers = usersPage.data?.users ?? [];
    const authUsers7d = authUsers.filter((u) => u.created_at && u.created_at >= since7d).length;
    const authUsers28d = authUsers.filter((u) => u.created_at && u.created_at >= since28d).length;
    const likelyTestUsers = authUsers.filter((u) => {
      const email = (u.email ?? "").toLowerCase();
      return (
        email.endsWith("@infomii.com") ||
        email.includes("test") ||
        email.includes("example") ||
        email.includes("apple")
      );
    }).length;

    const membershipHotelIds = new Set(
      (memberships.data ?? [])
        .map((row) => (row as { hotel_id?: string | null }).hotel_id)
        .filter((id): id is string => Boolean(id)),
    );

    const planCounts = { free: 0, pro: 0, business: 0, other: 0 };
    for (const row of subscriptions.data ?? []) {
      const plan = String((row as { plan?: string | null }).plan ?? "free").toLowerCase();
      if (plan === "pro") planCounts.pro += 1;
      else if (plan === "business") planCounts.business += 1;
      else if (plan === "free" || !plan) planCounts.free += 1;
      else planCounts.other += 1;
    }

    const realCustomersEstimate = Math.max(0, authUsers.length - likelyTestUsers);

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      authUsers: authUsers.length,
      authUsers7d,
      authUsers28d,
      likelyTestUsers,
      realCustomersEstimate,
      hotels: hotelsAll.count ?? 0,
      hotels28d: hotels28d.count ?? 0,
      hotelsWithMembership: membershipHotelIds.size,
      informations: informations.count ?? 0,
      publishedPages: published.count ?? 0,
      publishedUpdated28d: published28d.count ?? 0,
      editorPages: pages.count ?? 0,
      subscriptions: (subscriptions.data ?? []).length,
      planCounts,
      paidSubscriptions: planCounts.pro + planCounts.business,
      notes: [
        "hotels 件数はシード/デモ含むため、実運用は hotelsWithMembership または realCustomersEstimate を優先。",
        "GA4 で signup_complete をコンバージョンに登録すると訪問→登録率が追える。",
      ],
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "成長指標の取得に失敗しました" },
      { status: 500 },
    );
  }
}
