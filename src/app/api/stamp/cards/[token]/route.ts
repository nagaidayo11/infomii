import { NextResponse } from "next/server";
import { loadCardView, requireStampService } from "@/lib/stamp/server";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const svc = requireStampService();
  if (!svc.ok) return NextResponse.json({ error: svc.message }, { status: svc.status });

  const { token } = await ctx.params;
  const view = await loadCardView(decodeURIComponent(token));
  if (!view) return NextResponse.json({ error: "カードが見つかりません" }, { status: 404 });
  return NextResponse.json(view);
}
