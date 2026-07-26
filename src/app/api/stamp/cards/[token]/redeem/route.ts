import { NextResponse } from "next/server";
import { guestRedeem, requireStampService } from "@/lib/stamp/server";

type Ctx = { params: Promise<{ token: string }> };

/** Guest confirms reward use → stamps reset for that cycle. */
export async function POST(request: Request, ctx: Ctx) {
  const svc = requireStampService();
  if (!svc.ok) return NextResponse.json({ error: svc.message }, { status: svc.status });

  const { token } = await ctx.params;
  let body: { tier?: number } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const tier = body.tier === 5 || body.tier === 10 ? body.tier : null;
  if (!tier) {
    return NextResponse.json({ error: "特典は5個または10個を選んでください" }, { status: 400 });
  }

  const result = await guestRedeem(decodeURIComponent(token), tier);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
  if (!result.view) {
    return NextResponse.json({ stampCount: 0 });
  }
  return NextResponse.json(result.view);
}
