import { NextResponse } from "next/server";
import { getSupabaseAdminServerClient } from "@/lib/server/supabase-server";
import { submitIndexNowUrls } from "@/lib/server/indexnow";

type RequestBody = { slug?: unknown };

/** Notify IndexNow after a guest page is published. */
export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,159}$/.test(slug)) {
    return NextResponse.json({ ok: false, error: "invalid_slug" }, { status: 400 });
  }

  try {
    const admin = getSupabaseAdminServerClient();
    const [{ data: information }, { data: page }] = await Promise.all([
      admin
        .from("informations")
        .select("status")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle(),
      admin.from("pages").select("id").eq("slug", slug).maybeSingle(),
    ]);

    if (!information) {
      return NextResponse.json({ ok: false, error: "not_published" }, { status: 404 });
    }

    const path = page ? `/v/${encodeURIComponent(slug)}` : `/p/${encodeURIComponent(slug)}`;
    const submitted = await submitIndexNowUrls([path]);
    return NextResponse.json({ ok: true, submitted });
  } catch (error) {
    console.error("IndexNow submission failed", error);
    return NextResponse.json({ ok: false, error: "submission_failed" }, { status: 502 });
  }
}
