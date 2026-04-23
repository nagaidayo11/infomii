import { NextResponse } from "next/server";
import { canUseDevBusinessOverride } from "@/lib/dev-business-override";
import {
  getSupabaseAdminServerClient,
  getSupabaseAnonServerClient,
  isSupabaseServiceRoleConfigured,
} from "@/lib/server/supabase-server";
import { getDisplayNameMapByUserIds } from "@/lib/team-profiles";
import { resolveUserLabel } from "@/lib/user-label";

type Role = "owner" | "admin" | "editor" | "viewer";

type AuthContext =
  | { ok: true; userId: string; hotelId: string; role: Role }
  | { ok: false; response: NextResponse };

function parseBearerToken(request: Request): string {
  const authHeader = request.headers.get("authorization") ?? "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
}

async function authenticateWithHotel(request: Request): Promise<AuthContext> {
  if (!isSupabaseServiceRoleConfigured()) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "サーバー設定不足: SUPABASE_SERVICE_ROLE_KEY を設定してください" },
        { status: 503 },
      ),
    };
  }

  const token = parseBearerToken(request);
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: "認証が必要です" }, { status: 401 }) };
  }

  const anon = getSupabaseAnonServerClient();
  const {
    data: { user },
    error: userError,
  } = await anon.auth.getUser(token);
  if (userError || !user) {
    return { ok: false, response: NextResponse.json({ error: "認証に失敗しました" }, { status: 401 }) };
  }

  const admin = getSupabaseAdminServerClient();
  const { data: membership } = await admin
    .from("hotel_memberships")
    .select("hotel_id, role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership?.hotel_id) {
    return { ok: false, response: NextResponse.json({ error: "施設が選択されていません" }, { status: 403 }) };
  }

  const hotelId = membership.hotel_id;
  const [{ data: hotel }, { data: sub }] = await Promise.all([
    admin.from("hotels").select("owner_user_id").eq("id", hotelId).maybeSingle(),
    admin.from("subscriptions").select("plan").eq("hotel_id", hotelId).maybeSingle(),
  ]);
  const isBusinessAccessible = sub?.plan === "business" || canUseDevBusinessOverride(user);
  if (!isBusinessAccessible) {
    return {
      ok: false,
      response: NextResponse.json({ error: "操作履歴はBusinessプランでご利用いただけます" }, { status: 403 }),
    };
  }

  const isOwner = hotel?.owner_user_id === user.id;
  const membershipRole = membership.role === "admin" ? "admin" : membership.role === "viewer" ? "viewer" : "editor";
  return { ok: true, userId: user.id, hotelId, role: isOwner ? "owner" : membershipRole };
}

export async function GET(request: Request) {
  const ctx = await authenticateWithHotel(request);
  if (!ctx.ok) return ctx.response;

  if (ctx.role !== "owner" && ctx.role !== "admin") {
    return NextResponse.json({ error: "オーナー/管理者のみ閲覧できます" }, { status: 403 });
  }

  const admin = getSupabaseAdminServerClient();
  const { data: rows, error } = await admin
    .from("audit_logs")
    .select("id,action,message,target_type,target_id,actor_user_id,created_at,metadata")
    .eq("hotel_id", ctx.hotelId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    return NextResponse.json({ error: "操作履歴の取得に失敗しました" }, { status: 500 });
  }

  const actorIds = Array.from(
    new Set((rows ?? []).map((r) => r.actor_user_id).filter((id): id is string => Boolean(id))),
  );
  const displayNameMap = await getDisplayNameMapByUserIds(admin, actorIds);
  const emailMap = new Map<string, string | null>();
  for (const id of actorIds) {
    const { data: authRes } = await admin.auth.admin.getUserById(id);
    emailMap.set(id, authRes.user?.email ?? null);
  }

  return NextResponse.json({
    logs: (rows ?? []).map((row) => {
      const aid = row.actor_user_id;
      const actorName = aid ? displayNameMap.get(aid) ?? null : null;
      const actorEmail = aid ? emailMap.get(aid) ?? null : null;
      return {
        id: row.id,
        action: row.action,
        message: row.message,
        targetType: row.target_type,
        targetId: row.target_id,
        actorUserId: row.actor_user_id,
        actorDisplayName: actorName,
        actorLabel:
          aid != null
            ? resolveUserLabel({ displayName: actorName, email: actorEmail, userId: aid })
            : "システム",
        createdAt: row.created_at,
        metadata: row.metadata ?? {},
      };
    }),
  });
}
