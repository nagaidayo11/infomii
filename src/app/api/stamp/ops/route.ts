import { NextResponse } from "next/server";
import {
  applyStamp,
  assertHotelHasStampAccess,
  confirmRedeem,
  reissueCard,
  requireHotelMemberFromRequest,
  requireStampService,
} from "@/lib/stamp/server";

/** Staff ops: manual stamp / confirm redeem / reissue. */
export async function POST(request: Request) {
  const svc = requireStampService();
  if (!svc.ok) return NextResponse.json({ error: svc.message }, { status: svc.status });

  const member = await requireHotelMemberFromRequest(request);
  if (!member.ok) {
    return NextResponse.json({ error: member.message }, { status: member.status });
  }

  const access = await assertHotelHasStampAccess(member.hotelId, member.user);
  if (!access.ok) {
    return NextResponse.json({ error: access.message }, { status: access.status });
  }

  let body: { action?: string; cardToken?: string; stampCode?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = body.action;
  const cardToken = typeof body.cardToken === "string" ? body.cardToken.trim() : "";
  if (!cardToken) {
    return NextResponse.json({ error: "cardToken が必要です" }, { status: 400 });
  }

  if (action === "manual_stamp") {
    const result = await applyStamp({
      cardToken,
      stampCode: body.stampCode ?? "",
      source: "staff_manual",
      staffUserId: member.user.id,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }
    return NextResponse.json(result);
  }

  if (action === "confirm_redeem") {
    const result = await confirmRedeem({
      cardToken,
      staffUserId: member.user.id,
      hotelId: member.hotelId,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }
    return NextResponse.json(result);
  }

  if (action === "reissue") {
    const result = await reissueCard({ cardToken, hotelId: member.hotelId });
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "不明な action です" }, { status: 400 });
}
