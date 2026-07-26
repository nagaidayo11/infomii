import { NextResponse } from "next/server";
import { loadProgramByPageSlug, requireStampService } from "@/lib/stamp/server";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const svc = requireStampService();
  if (!svc.ok) return NextResponse.json({ error: svc.message }, { status: svc.status });

  const { slug } = await ctx.params;
  const loaded = await loadProgramByPageSlug(decodeURIComponent(slug));
  if (!loaded) {
    return NextResponse.json({ error: "見つかりません" }, { status: 404 });
  }

  const published =
    loaded.publishStatus === "published" && loaded.program.status === "published";

  return NextResponse.json({
    title: loaded.program.title,
    description: loaded.program.description,
    accentColor: loaded.program.accent_color,
    published,
  });
}
