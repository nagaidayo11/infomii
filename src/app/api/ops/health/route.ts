import { NextRequest, NextResponse } from "next/server";
import { getStripeServerClient } from "@/lib/server/stripe-server";
import { getSupabaseAdminServerClient, getSupabaseAnonServerClient } from "@/lib/server/supabase-server";
import { isOpsAdminUser } from "@/lib/server/ops-auth";

export const runtime = "nodejs";

type BillingLogRow = {
  id: string;
  action: string;
  message: string;
  created_at: string;
};

type ExecutionSnapshot = {
  avgMinutesToPublish: number;
  samples: number;
  lastPublishedAt: string | null;
};

type DormancySnapshot = {
  latestUpdateAt: string | null;
  daysSinceLastUpdate: number | null;
  isDormant7d: boolean;
  message: string;
};

type Week2Review = {
  kpi: {
    lpToSignupRate: number;
    publishCompletionRate: number;
    proConversionRate: number;
  };
  focus: {
    strong: string[];
    weak: string[];
  };
};

function roundAverage(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function p75(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.75));
  return sorted[index] ?? 0;
}

function buildExecutionSnapshot(logs: Array<{ action: string; target_id: string | null; created_at: string }>): ExecutionSnapshot {
  const createdByTarget = new Map<string, number>();
  const durations: number[] = [];
  let lastPublishedAt: string | null = null;

  for (const log of logs) {
    const targetId = log.target_id;
    const time = new Date(log.created_at).getTime();
    if (!targetId || Number.isNaN(time)) {
      continue;
    }
    if (log.action === "information.created") {
      if (!createdByTarget.has(targetId)) {
        createdByTarget.set(targetId, time);
      }
      continue;
    }
    if (log.action === "information.published") {
      const createdAt = createdByTarget.get(targetId);
      if (createdAt && time >= createdAt) {
        durations.push(Math.round((time - createdAt) / 60000));
      }
      if (!lastPublishedAt || time > new Date(lastPublishedAt).getTime()) {
        lastPublishedAt = log.created_at;
      }
    }
  }

  return {
    avgMinutesToPublish: roundAverage(durations),
    samples: durations.length,
    lastPublishedAt,
  };
}

function buildDormancySnapshot(params: {
  latestInfoUpdateAt: string | null;
  lastPublishedAt: string | null;
  totalPages: number;
}): DormancySnapshot {
  const latestCandidates = [params.latestInfoUpdateAt, params.lastPublishedAt].filter(
    (value): value is string => Boolean(value),
  );
  const latestUpdateAt = latestCandidates.length > 0
    ? latestCandidates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
    : null;

  if (!latestUpdateAt) {
    return {
      latestUpdateAt: null,
      daysSinceLastUpdate: null,
      isDormant7d: false,
      message: params.totalPages === 0
        ? "まだページが未作成です。テンプレ作成から始めてください。"
        : "更新履歴を確認中です。",
    };
  }

  const diffDays = Math.floor((Date.now() - new Date(latestUpdateAt).getTime()) / (24 * 60 * 60 * 1000));
  const isDormant7d = diffDays >= 7;
  return {
    latestUpdateAt,
    daysSinceLastUpdate: diffDays,
    isDormant7d,
    message: isDormant7d
      ? `最終更新から${diffDays}日経過しています。休眠傾向です。`
      : `最終更新は${diffDays}日前です。継続運用できています。`,
  };
}

function buildWeek2Review(params: {
  lpToSignupRate: number;
  createdCount7d: number;
  publishedCount7d: number;
  upgradeClicks: number;
  completedCheckouts: number;
}): Week2Review {
  const publishCompletionRate =
    params.createdCount7d > 0 ? Math.round((params.publishedCount7d / params.createdCount7d) * 100) : 0;
  const proConversionRate =
    params.upgradeClicks > 0 ? Math.round((params.completedCheckouts / params.upgradeClicks) * 100) : 0;

  const strong: string[] = [];
  const weak: string[] = [];

  if (params.lpToSignupRate >= 20) {
    strong.push("LP導線（見出し/CTA）");
  } else {
    weak.push("LP導線（見出し/CTA）");
  }

  if (publishCompletionRate >= 60) {
    strong.push("作成→公開フロー");
  } else {
    weak.push("作成→公開フロー");
  }

  if (proConversionRate >= 15) {
    strong.push("課金導線（アップグレード→決済）");
  } else {
    weak.push("課金導線（アップグレード→決済）");
  }

  return {
    kpi: {
      lpToSignupRate: params.lpToSignupRate,
      publishCompletionRate,
      proConversionRate,
    },
    focus: {
      strong,
      weak,
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : "";

    if (!token) {
      return NextResponse.json({ message: "認証トークンがありません" }, { status: 401 });
    }

    const anon = getSupabaseAnonServerClient();
    const {
      data: { user },
      error: userError,
    } = await anon.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ message: "認証に失敗しました" }, { status: 401 });
    }
    if (!isOpsAdminUser(user)) {
      return NextResponse.json({ message: "運用センターへのアクセス権限がありません" }, { status: 403 });
    }

    const env = {
      supabasePublic: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      supabaseService: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      stripeSecret: Boolean(process.env.STRIPE_SECRET_KEY),
      stripePrice: Boolean(process.env.STRIPE_PRO_PRICE_ID),
      stripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    };

    let stripeOk = false;
    let stripeMessage = "Stripe接続を確認していません";
    if (env.stripeSecret) {
      try {
        const stripe = getStripeServerClient();
        const account = await stripe.accounts.retrieve();
        stripeOk = true;
        stripeMessage = `接続OK (${account.id})`;
      } catch (error) {
        stripeOk = false;
        stripeMessage = error instanceof Error ? error.message : "Stripe接続に失敗しました";
      }
    } else {
      stripeMessage = "STRIPE_SECRET_KEY が未設定です";
    }

    if (!env.supabaseService) {
      return NextResponse.json({
        checkedAt: new Date().toISOString(),
        env,
        stripe: { ok: stripeOk, message: stripeMessage },
        membership: { ok: false, hotelId: null },
        billing: {
          ok: false,
          plan: null,
          status: null,
          hasStripeCustomer: false,
          lastSyncAt: null,
          webhookLastReceivedAt: null,
          funnel7d: {
            upgradeClicks: 0,
            checkoutSessions: 0,
            completedCheckouts: 0,
            clickToCheckoutRate: 0,
            checkoutToPaidRate: 0,
          },
          message: "SUPABASE_SERVICE_ROLE_KEY が未設定です",
        },
        onboarding: {
          totalPages: 0,
          publishedPages: 0,
          draftPages: 0,
          firstPublishedReady: false,
        },
        week2Review: {
          kpi: {
            lpToSignupRate: 0,
            publishCompletionRate: 0,
            proConversionRate: 0,
          },
          focus: {
            strong: [],
            weak: [],
          },
        },
        execution: {
          avgMinutesToPublish: 0,
          samples: 0,
          lastPublishedAt: null,
        },
        dormancy: {
          latestUpdateAt: null,
          daysSinceLastUpdate: null,
          isDormant7d: false,
          message: "データ未取得",
        },
        performance7d: {
          lcpAvgMs: 0,
          lcpP75Ms: 0,
          loadAvgMs: 0,
          loadP75Ms: 0,
          sampleCount: 0,
          lastMeasuredAt: null,
        },
        recentBillingLogs: [] as BillingLogRow[],
      });
    }

    const admin = getSupabaseAdminServerClient();
    const { data: membership } = await admin
      .from("hotel_memberships")
      .select("hotel_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const hotelId = membership?.hotel_id ?? null;
    if (!hotelId) {
      return NextResponse.json({
        checkedAt: new Date().toISOString(),
        env,
        stripe: { ok: stripeOk, message: stripeMessage },
        membership: { ok: false, hotelId: null },
        billing: {
          ok: false,
          plan: null,
          status: null,
          hasStripeCustomer: false,
          lastSyncAt: null,
          webhookLastReceivedAt: null,
          funnel7d: {
            upgradeClicks: 0,
            checkoutSessions: 0,
            completedCheckouts: 0,
            clickToCheckoutRate: 0,
            checkoutToPaidRate: 0,
          },
          message: "施設所属がありません（復旧アクションで再作成可能）",
        },
        onboarding: {
          totalPages: 0,
          publishedPages: 0,
          draftPages: 0,
          firstPublishedReady: false,
        },
        week2Review: {
          kpi: {
            lpToSignupRate: 0,
            publishCompletionRate: 0,
            proConversionRate: 0,
          },
          focus: {
            strong: [],
            weak: [],
          },
        },
        execution: {
          avgMinutesToPublish: 0,
          samples: 0,
          lastPublishedAt: null,
        },
        dormancy: {
          latestUpdateAt: null,
          daysSinceLastUpdate: null,
          isDormant7d: false,
          message: "施設所属がありません",
        },
        performance7d: {
          lcpAvgMs: 0,
          lcpP75Ms: 0,
          loadAvgMs: 0,
          loadP75Ms: 0,
          sampleCount: 0,
          lastMeasuredAt: null,
        },
        recentBillingLogs: [] as BillingLogRow[],
      });
    }
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [{ data: sub }, { count: totalPages }, { count: publishedPages }, { count: draftPages }, { data: logs }, { data: funnelLogs }, { data: perfLogs }, { data: publishLeadLogs }, { data: latestInfo }, { data: onboardingLogs }] = await Promise.all([
      admin
        .from("subscriptions")
        .select("plan,status,stripe_customer_id,updated_at")
        .eq("hotel_id", hotelId)
        .maybeSingle(),
      admin
        .from("informations")
        .select("id", { count: "exact", head: true })
        .eq("hotel_id", hotelId),
      admin
        .from("informations")
        .select("id", { count: "exact", head: true })
        .eq("hotel_id", hotelId)
        .eq("status", "published"),
      admin
        .from("informations")
        .select("id", { count: "exact", head: true })
        .eq("hotel_id", hotelId)
        .eq("status", "draft"),
      admin
        .from("audit_logs")
        .select("id,action,message,created_at")
        .eq("hotel_id", hotelId)
        .ilike("action", "billing.%")
        .order("created_at", { ascending: false })
        .limit(10),
      admin
        .from("audit_logs")
        .select("action,created_at")
        .eq("hotel_id", hotelId)
        .gte("created_at", since7d)
        .in("action", ["billing.upgrade_click", "billing.checkout_session_created", "billing.checkout_completed"]),
      admin
        .from("audit_logs")
        .select("action,created_at,metadata")
        .eq("hotel_id", hotelId)
        .gte("created_at", since7d)
        .in("action", ["perf.public_lcp", "perf.public_load"])
        .order("created_at", { ascending: false })
        .limit(500),
      admin
        .from("audit_logs")
        .select("action,target_id,created_at")
        .eq("hotel_id", hotelId)
        .gte("created_at", since30d)
        .in("action", ["information.created", "information.published"])
        .order("created_at", { ascending: true })
        .limit(2000),
      admin
        .from("informations")
        .select("updated_at")
        .eq("hotel_id", hotelId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("audit_logs")
        .select("action,metadata")
        .eq("hotel_id", hotelId)
        .gte("created_at", since7d)
        .in("action", ["onboarding.login_success", "onboarding.signup_completed"])
        .limit(3000),
    ]);
    const webhookLastReceivedAt = (logs ?? [])
      .filter(
        (row) =>
          row.action === "billing.checkout_completed" ||
          row.action === "billing.subscription_synced",
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
      ?.created_at ?? null;

    const hasStripeCustomer = Boolean(sub?.stripe_customer_id);
    const billingOk = Boolean(
      sub && env.stripeSecret && env.stripeWebhook && (sub.plan !== "pro" || hasStripeCustomer),
    );
    const upgradeClicks = (funnelLogs ?? []).filter((row) => row.action === "billing.upgrade_click").length;
    const checkoutSessions = (funnelLogs ?? []).filter((row) => row.action === "billing.checkout_session_created").length;
    const completedCheckouts = (funnelLogs ?? []).filter((row) => row.action === "billing.checkout_completed").length;
    const clickToCheckoutRate = upgradeClicks > 0 ? Math.round((checkoutSessions / upgradeClicks) * 100) : 0;
    const checkoutToPaidRate = checkoutSessions > 0 ? Math.round((completedCheckouts / checkoutSessions) * 100) : 0;
    const lcpValues = (perfLogs ?? [])
      .filter((row) => row.action === "perf.public_lcp")
      .map((row) => {
        const metadata = row.metadata as Record<string, unknown> | null;
        const value = metadata?.value;
        return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : 0;
      })
      .filter((value) => value > 0);
    const loadValues = (perfLogs ?? [])
      .filter((row) => row.action === "perf.public_load")
      .map((row) => {
        const metadata = row.metadata as Record<string, unknown> | null;
        const value = metadata?.value;
        return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : 0;
      })
      .filter((value) => value > 0);
    const lastMeasuredAt = (perfLogs ?? [])[0]?.created_at ?? null;
    const execution = buildExecutionSnapshot(
      (publishLeadLogs ?? []).map((row) => ({
        action: row.action,
        target_id: row.target_id,
        created_at: row.created_at,
      })),
    );
    const dormancy = buildDormancySnapshot({
      latestInfoUpdateAt: latestInfo?.updated_at ?? null,
      lastPublishedAt: execution.lastPublishedAt,
      totalPages: totalPages ?? 0,
    });
    const onboardingByRef = new Map<"lp-hero" | "lp-sticky" | "lp-bottom", { logins: number; signups: number }>([
      ["lp-hero", { logins: 0, signups: 0 }],
      ["lp-sticky", { logins: 0, signups: 0 }],
      ["lp-bottom", { logins: 0, signups: 0 }],
    ]);
    for (const row of onboardingLogs ?? []) {
      const metadata = row.metadata as Record<string, unknown> | null;
      const ref = metadata?.sourceRef;
      if (ref !== "lp-hero" && ref !== "lp-sticky" && ref !== "lp-bottom") {
        continue;
      }
      const entry = onboardingByRef.get(ref);
      if (!entry) {
        continue;
      }
      if (row.action === "onboarding.login_success") {
        entry.logins += 1;
      } else if (row.action === "onboarding.signup_completed") {
        entry.signups += 1;
      }
    }
    const lpLogins = Array.from(onboardingByRef.values()).reduce((sum, row) => sum + row.logins, 0);
    const lpSignups = Array.from(onboardingByRef.values()).reduce((sum, row) => sum + row.signups, 0);
    const lpToSignupRate = lpLogins > 0 ? Math.round((lpSignups / lpLogins) * 100) : 0;
    const createdCount7d = (publishLeadLogs ?? []).filter((row) => row.action === "information.created").length;
    const publishedCount7d = (publishLeadLogs ?? []).filter((row) => row.action === "information.published").length;
    const week2Review = buildWeek2Review({
      lpToSignupRate,
      createdCount7d,
      publishedCount7d,
      upgradeClicks,
      completedCheckouts,
    });

    return NextResponse.json({
      checkedAt: new Date().toISOString(),
      env,
      stripe: { ok: stripeOk, message: stripeMessage },
      membership: { ok: true, hotelId },
      billing: {
        ok: billingOk,
        plan: sub?.plan ?? null,
        status: sub?.status ?? null,
        hasStripeCustomer,
        lastSyncAt: sub?.updated_at ?? null,
        webhookLastReceivedAt,
        funnel7d: {
          upgradeClicks,
          checkoutSessions,
          completedCheckouts,
          clickToCheckoutRate,
          checkoutToPaidRate,
        },
        message: billingOk
          ? "課金設定は正常です"
          : "課金設定に不足があります（Webhook / 顧客ID / キーを確認）",
      },
      onboarding: {
        totalPages: totalPages ?? 0,
        publishedPages: publishedPages ?? 0,
        draftPages: draftPages ?? 0,
        firstPublishedReady: (publishedPages ?? 0) > 0,
      },
      week2Review,
      execution,
      dormancy,
      performance7d: {
        lcpAvgMs: roundAverage(lcpValues),
        lcpP75Ms: p75(lcpValues),
        loadAvgMs: roundAverage(loadValues),
        loadP75Ms: p75(loadValues),
        sampleCount: Math.max(lcpValues.length, loadValues.length),
        lastMeasuredAt,
      },
      recentBillingLogs: (logs ?? []) as BillingLogRow[],
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "運用ヘルス取得に失敗しました" },
      { status: 500 },
    );
  }
}
