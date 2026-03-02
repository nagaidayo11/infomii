import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminServerClient } from "@/lib/server/supabase-server";

export const runtime = "nodejs";

type PerfMetricInput = {
  name?: unknown;
  value?: unknown;
};

function toMetricName(value: unknown): "lcp" | "load" | "cls" | "inp" | null {
  if (value === "lcp" || value === "load" || value === "cls" || value === "inp") {
    return value;
  }
  return null;
}

function toMetricValue(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  const rounded = Math.round(value);
  if (rounded <= 0 || rounded > 60000) {
    return null;
  }
  return rounded;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      hotelId?: unknown;
      slug?: unknown;
      urlPath?: unknown;
      metrics?: PerfMetricInput[];
    };

    const hotelId = typeof body.hotelId === "string" ? body.hotelId : "";
    const slug = typeof body.slug === "string" ? body.slug : "";
    const urlPath = typeof body.urlPath === "string" ? body.urlPath : "";
    if (!hotelId || !slug) {
      return NextResponse.json({ ok: false, message: "invalid payload" }, { status: 400 });
    }

    const metrics = (Array.isArray(body.metrics) ? body.metrics : [])
      .map((entry) => {
        const name = toMetricName(entry.name);
        const value = toMetricValue(entry.value);
        if (!name || value === null) {
          return null;
        }
        return { name, value };
      })
      .filter((entry): entry is { name: "lcp" | "load" | "cls" | "inp"; value: number } => Boolean(entry))
      .slice(0, 4);

    if (metrics.length === 0) {
      return NextResponse.json({ ok: false, message: "metrics required" }, { status: 400 });
    }

    const admin = getSupabaseAdminServerClient();
    const { data: publishedInfo } = await admin
      .from("informations")
      .select("id")
      .eq("hotel_id", hotelId)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (!publishedInfo) {
      return NextResponse.json({ ok: false, message: "page not found" }, { status: 404 });
    }

    const ua = request.headers.get("user-agent") ?? "";
    const referer = request.headers.get("referer") ?? "";
    const now = new Date().toISOString();
    const rows = metrics.map((metric) => ({
      hotel_id: hotelId,
      actor_user_id: null,
      action:
        metric.name === "lcp"
          ? "perf.public_lcp"
          : metric.name === "load"
            ? "perf.public_load"
            : metric.name === "cls"
              ? "perf.public_cls"
              : "perf.public_inp",
      target_type: "performance",
      target_id: slug,
      message: `公開ページ速度計測: ${metric.name.toUpperCase()} ${metric.value}ms`,
      metadata: {
        slug,
        value: metric.value,
        unit: metric.name === "cls" ? "score_x1000" : "ms",
        path: urlPath,
        ua,
        referer,
      },
      created_at: now,
    }));

    await admin.from("audit_logs").insert(rows);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "failed to collect perf metrics" }, { status: 500 });
  }
}
