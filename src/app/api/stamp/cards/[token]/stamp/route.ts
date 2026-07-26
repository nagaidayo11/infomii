import { NextResponse } from "next/server";
import { applyStamp, requireStampService } from "@/lib/stamp/server";

type Ctx = { params: Promise<{ token: string }> };

/** Guest scan: apply stamp with facility stamp_code. */
export async function POST(request: Request, ctx: Ctx) {
  const svc = requireStampService();
  if (!svc.ok) return NextResponse.json({ error: svc.message }, { status: svc.status });

  const { token } = await ctx.params;
  let body: { stampCode?: string } = {};
  try {
    body = (await request.json()) as { stampCode?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const stampCode = typeof body.stampCode === "string" ? body.stampCode.trim() : "";
  if (!stampCode) {
    return NextResponse.json({ error: "押印コードが必要です" }, { status: 400 });
  }

  const result = await applyStamp({
    cardToken: decodeURIComponent(token),
    stampCode,
    source: "guest_scan",
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
  return NextResponse.json(result);
}
