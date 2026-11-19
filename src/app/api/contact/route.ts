import { NextRequest, NextResponse } from "next/server";
import { buildContactMailto, validateContactPayload } from "@/lib/contact";
import { sendContactMessage } from "@/lib/server/send-contact-message";
import { getSupabaseAnonServerClient } from "@/lib/server/supabase-server";

export const runtime = "nodejs";

const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map<string, number[]>();

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

async function optionalUser(request: NextRequest): Promise<{ id: string; email: string | null } | null> {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (!token) return null;
  try {
    const anon = getSupabaseAnonServerClient();
    const {
      data: { user },
    } = await anon.auth.getUser(token);
    if (!user) return null;
    return { id: user.id, email: user.email ?? null };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (rateLimited(clientIp(request))) {
      return NextResponse.json(
        { message: "送信が多すぎます。しばらくしてからもう一度どうぞ。" },
        { status: 429 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    if (typeof body.company === "string" && body.company.trim()) {
      return NextResponse.json({ ok: true });
    }

    const parsed = validateContactPayload(body);
    if (!parsed.ok) {
      return NextResponse.json({ message: parsed.error }, { status: 400 });
    }

    const user = await optionalUser(request);
    const result = await sendContactMessage({
      payload: parsed.value,
      userId: user?.id ?? null,
      userEmail: user?.email ?? null,
    });

    if (result.delivered) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({
      ok: false,
      fallback: true,
      mailto: buildContactMailto(parsed.value),
      message: "メール送信に失敗したので、メールアプリから送ってください。",
    });
  } catch {
    return NextResponse.json({ message: "送信に失敗しました。時間をおいて再度お試しください。" }, { status: 500 });
  }
}
