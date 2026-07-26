import { NextResponse } from "next/server";
import { currentPressToken } from "@/lib/stamp/press";
import {
  assertHotelHasStampAccess,
  requireHotelMemberFromRequest,
  requireStampService,
} from "@/lib/stamp/server";
import { getSupabaseAdminServerClient } from "@/lib/server/supabase-server";
import { buildStampPressPath } from "@/lib/stamp/types";

type Ctx = { params: Promise<{ pageId: string }> };

/** GET current rotating press token for staff display (hotel member only). */
export async function GET(request: Request, ctx: Ctx) {
  const svc = requireStampService();
  if (!svc.ok) return NextResponse.json({ error: svc.message }, { status: svc.status });

  const member = await requireHotelMemberFromRequest(request);
  if (!member.ok) return NextResponse.json({ error: member.message }, { status: member.status });

  const access = await assertHotelHasStampAccess(member.hotelId, member.user);
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });

  const { pageId } = await ctx.params;
  const admin = getSupabaseAdminServerClient();
  const { data: program } = await admin
    .from("stamp_programs")
    .select("id, hotel_id, stamp_code, rotating_qr")
    .eq("page_id", decodeURIComponent(pageId))
    .maybeSingle();

  if (!program || program.hotel_id !== member.hotelId) {
    return NextResponse.json({ error: "プログラムが見つかりません" }, { status: 404 });
  }

  const { code, expiresInMs, periodMs } = currentPressToken(
    program.stamp_code as string,
    program.id as string,
  );

  return NextResponse.json({
    rotating: Boolean(program.rotating_qr),
    code,
    path: buildStampPressPath(code),
    expiresInMs,
    periodMs,
  });
}
