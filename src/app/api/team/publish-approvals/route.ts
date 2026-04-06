import { NextResponse } from "next/server";
import {
  getSupabaseAdminServerClient,
  getSupabaseAnonServerClient,
  isSupabaseServiceRoleConfigured,
} from "@/lib/server/supabase-server";

type Role = "owner" | "admin" | "editor" | "viewer";

type AuthContext =
  | { ok: true; userId: string; hotelId: string; role: Role; plan: string | null }
  | { ok: false; response: NextResponse };

function parseBearerToken(request: Request): string {
  const authHeader = request.headers.get("authorization") ?? "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
}

async function appendAuditLog(
  hotelId: string,
  actorUserId: string,
  action: string,
  message: string,
  targetType: string,
  targetId: string,
): Promise<void> {
  const admin = getSupabaseAdminServerClient();
  await admin.from("audit_logs").insert({
    hotel_id: hotelId,
    actor_user_id: actorUserId,
    action,
    message,
    target_type: targetType,
    target_id: targetId,
    metadata: {},
  });
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

  if (sub?.plan !== "business") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "公開申請フローはBusinessプランでご利用いただけます" },
        { status: 403 },
      ),
    };
  }

  const isOwner = hotel?.owner_user_id === user.id;
  const membershipRole = membership.role === "admin" ? "admin" : membership.role === "viewer" ? "viewer" : "editor";
  const role: Role = isOwner ? "owner" : membershipRole;

  return { ok: true, userId: user.id, hotelId, role, plan: sub?.plan ?? null };
}

export async function GET(request: Request) {
  const ctx = await authenticateWithHotel(request);
  if (!ctx.ok) return ctx.response;

  if (ctx.role !== "owner" && ctx.role !== "admin") {
    return NextResponse.json({ error: "オーナー/管理者のみ閲覧できます" }, { status: 403 });
  }

  const url = new URL(request.url);
  const statusRaw = (url.searchParams.get("status") ?? "pending").trim().toLowerCase();
  if (statusRaw !== "pending" && statusRaw !== "approved" && statusRaw !== "rejected" && statusRaw !== "all") {
    return NextResponse.json({ error: "status は pending/approved/rejected/all のいずれかです" }, { status: 422 });
  }
  const statusParam: "pending" | "approved" | "rejected" | "all" = statusRaw;

  const admin = getSupabaseAdminServerClient();
  let query = admin
    .from("publish_approval_requests")
    .select(
      "id,information_id,hotel_id,requested_by_user_id,status,requested_at,reviewed_by_user_id,reviewed_at,review_comment",
    )
    .eq("hotel_id", ctx.hotelId)
    .order("requested_at", { ascending: false })
    .limit(100);
  if (statusParam !== "all") {
    query = query.eq("status", statusParam);
  }
  const { data: rows, error } = await query;
  if (error) {
    return NextResponse.json({ error: "公開申請一覧の取得に失敗しました" }, { status: 500 });
  }

  const informationIds = Array.from(new Set((rows ?? []).map((r) => r.information_id)));
  const requesterIds = Array.from(new Set((rows ?? []).map((r) => r.requested_by_user_id)));
  const titleMap = new Map<string, string>();
  const emailMap = new Map<string, string | null>();
  if (informationIds.length > 0) {
    const { data: infos } = await admin
      .from("informations")
      .select("id,title")
      .in("id", informationIds);
    for (const info of infos ?? []) {
      titleMap.set(info.id, info.title ?? "");
    }
  }
  for (const requesterId of requesterIds) {
    const { data: authRes } = await admin.auth.admin.getUserById(requesterId);
    emailMap.set(requesterId, authRes.user?.email ?? null);
  }

  return NextResponse.json({
    approvals: (rows ?? []).map((row) => ({
      id: row.id,
      informationId: row.information_id,
      pageTitle: titleMap.get(row.information_id) ?? "",
      requestedByUserId: row.requested_by_user_id,
      requestedByEmail: emailMap.get(row.requested_by_user_id) ?? null,
      status: row.status,
      requestedAt: row.requested_at,
      reviewedByUserId: row.reviewed_by_user_id,
      reviewedAt: row.reviewed_at,
      reviewComment: row.review_comment,
    })),
  });
}

export async function POST(request: Request) {
  const ctx = await authenticateWithHotel(request);
  if (!ctx.ok) return ctx.response;

  if (ctx.role !== "editor") {
    return NextResponse.json({ error: "公開申請は編集担当（editor）のみ実行できます" }, { status: 403 });
  }

  let body: { informationId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 422 });
  }
  const informationId = typeof body.informationId === "string" ? body.informationId.trim() : "";
  if (!informationId) {
    return NextResponse.json({ error: "informationId が必要です" }, { status: 422 });
  }

  const admin = getSupabaseAdminServerClient();
  const { data: info } = await admin
    .from("informations")
    .select("id,title")
    .eq("id", informationId)
    .eq("hotel_id", ctx.hotelId)
    .maybeSingle();
  if (!info) {
    return NextResponse.json({ error: "公開対象ページが見つかりません" }, { status: 404 });
  }

  const { data: existing } = await admin
    .from("publish_approval_requests")
    .select("id")
    .eq("hotel_id", ctx.hotelId)
    .eq("information_id", informationId)
    .eq("status", "pending")
    .limit(1)
    .maybeSingle();
  if (existing?.id) {
    return NextResponse.json({ error: "承認待ちの公開申請がすでに存在します" }, { status: 409 });
  }

  const { data, error } = await admin
    .from("publish_approval_requests")
    .insert({
      information_id: informationId,
      hotel_id: ctx.hotelId,
      requested_by_user_id: ctx.userId,
      status: "pending",
    })
    .select(
      "id,information_id,requested_by_user_id,status,requested_at,reviewed_by_user_id,reviewed_at,review_comment",
    )
    .single();
  if (error || !data) {
    return NextResponse.json({ error: "公開申請の作成に失敗しました" }, { status: 500 });
  }

  await appendAuditLog(
    ctx.hotelId,
    ctx.userId,
    "information.publish_requested",
    `公開申請を作成しました（${info.title ?? ""}）`,
    "information",
    informationId,
  );

  return NextResponse.json(
    {
      approval: {
        id: data.id,
        informationId: data.information_id,
        requestedByUserId: data.requested_by_user_id,
        status: data.status,
        requestedAt: data.requested_at,
        reviewedByUserId: data.reviewed_by_user_id,
        reviewedAt: data.reviewed_at,
        reviewComment: data.review_comment,
      },
    },
    { status: 201 },
  );
}

export async function PATCH(request: Request) {
  const ctx = await authenticateWithHotel(request);
  if (!ctx.ok) return ctx.response;

  if (ctx.role !== "owner" && ctx.role !== "admin") {
    return NextResponse.json({ error: "オーナー/管理者のみ承認・却下できます" }, { status: 403 });
  }

  let body: { requestId?: string; action?: "approve" | "reject"; comment?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 422 });
  }
  const requestId = typeof body.requestId === "string" ? body.requestId.trim() : "";
  const action = body.action;
  const comment = typeof body.comment === "string" ? body.comment.trim() : "";
  if (!requestId || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ error: "requestId と action(approve/reject) が必要です" }, { status: 422 });
  }

  const admin = getSupabaseAdminServerClient();
  const { data: target, error: targetError } = await admin
    .from("publish_approval_requests")
    .select("id,information_id,status")
    .eq("id", requestId)
    .eq("hotel_id", ctx.hotelId)
    .maybeSingle();
  if (targetError || !target) {
    return NextResponse.json({ error: "公開申請が見つかりません" }, { status: 404 });
  }
  if (target.status !== "pending") {
    return NextResponse.json({ error: "この公開申請はすでに処理済みです" }, { status: 409 });
  }

  const now = new Date().toISOString();
  if (action === "approve") {
    const { data: info } = await admin
      .from("informations")
      .select("id,title")
      .eq("id", target.information_id)
      .eq("hotel_id", ctx.hotelId)
      .maybeSingle();
    if (!info?.id) {
      return NextResponse.json({ error: "公開対象ページが見つかりません" }, { status: 404 });
    }

    const { error: publishError } = await admin
      .from("informations")
      .update({
        status: "published",
        publish_at: now,
        unpublish_at: null,
        updated_at: now,
      })
      .eq("id", info.id)
      .eq("hotel_id", ctx.hotelId);
    if (publishError) {
      return NextResponse.json({ error: "ページ公開に失敗しました" }, { status: 500 });
    }

    const { error: approvalError } = await admin
      .from("publish_approval_requests")
      .update({
        status: "approved",
        reviewed_by_user_id: ctx.userId,
        reviewed_at: now,
        review_comment: comment || "approved",
      })
      .eq("id", requestId)
      .eq("hotel_id", ctx.hotelId);
    if (approvalError) {
      return NextResponse.json({ error: "公開申請の承認記録に失敗しました" }, { status: 500 });
    }

    await appendAuditLog(
      ctx.hotelId,
      ctx.userId,
      "information.publish_approved",
      `公開申請を承認して公開しました（${info.title ?? ""}）`,
      "information",
      info.id,
    );

    return NextResponse.json({ ok: true });
  }

  const { error: rejectError } = await admin
    .from("publish_approval_requests")
    .update({
      status: "rejected",
      reviewed_by_user_id: ctx.userId,
      reviewed_at: now,
      review_comment: comment || "rejected",
    })
    .eq("id", requestId)
    .eq("hotel_id", ctx.hotelId);
  if (rejectError) {
    return NextResponse.json({ error: "公開申請の却下記録に失敗しました" }, { status: 500 });
  }

  await appendAuditLog(
    ctx.hotelId,
    ctx.userId,
    "information.publish_rejected",
    "公開申請を却下しました",
    "approval_request",
    requestId,
  );

  return NextResponse.json({ ok: true });
}
