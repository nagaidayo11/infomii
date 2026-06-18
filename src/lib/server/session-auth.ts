import { getSupabaseAnonServerClient } from "@/lib/server/supabase-server";

export function readBearerToken(request: Request): string {
  const authHeader = request.headers.get("authorization") ?? "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : "";
}

export async function requireSessionUser(token: string) {
  if (!token) {
    return { ok: false as const, status: 401, message: "認証トークンがありません" };
  }

  const anon = getSupabaseAnonServerClient();
  const {
    data: { user },
    error,
  } = await anon.auth.getUser(token);

  if (error || !user) {
    return { ok: false as const, status: 401, message: "認証に失敗しました" };
  }

  return { ok: true as const, user };
}
