import { NextResponse } from "next/server";
import { resolveAccountDeletion } from "@/lib/server/account-delete";
import {
  getSupabaseAdminServerClient,
  getSupabaseAnonServerClient,
  isSupabaseServiceRoleConfigured,
} from "@/lib/server/supabase-server";

/**
 * POST: Delete the authenticated user's account (App Store Guideline 5.1.1(v)).
 */
export async function POST(request: Request) {
  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json(
      { error: "サーバー設定不足: SUPABASE_SERVICE_ROLE_KEY を設定してください" },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (!token) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const anon = getSupabaseAnonServerClient();
  const {
    data: { user },
    error: userError,
  } = await anon.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  }

  const admin = getSupabaseAdminServerClient();
  const deletion = await resolveAccountDeletion(admin, user.id);
  if (!deletion.ok) {
    return NextResponse.json({ error: deletion.message, reason: deletion.reason }, { status: 409 });
  }

  await admin.from("profiles").delete().eq("user_id", user.id);

  const { error: deleteAuthError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteAuthError) {
    return NextResponse.json(
      { error: deleteAuthError.message || "アカウント削除に失敗しました" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
