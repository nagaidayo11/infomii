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
  stage: "healthy" | "notice3d" | "warning7d" | "critical14d";
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

type Week3Review = {
  kpi: {
    lpToSignupRate: number;
    publishCompletionRate: number;
    proConversionRate: number;
  };
  focusTop2: string[];
  weak: string[];
};

type Week4Review = {
  kpi: {
    lpToSignupRate: number;
    publishCompletionRate: number;
    proConversionRate: number;
    retentionRate: number;
  };
  standardize: string[];
  stopOrFix: string[];
};

type Week7Review = {
  kpi: {
    lpToSignupRate: number;
    firstPublishRate: number;
    proConversionRate: number;
    retention14dRate: number;
  };
  lpWinnerByIndustry: {
    business: "a" | "b" | "c" | "-";
    resort: "a" | "b" | "c" | "-";
    spa: "a" | "b" | "c" | "-";
  };
  templateToPublishMedianMinutes: number;
  templateToPublishMedianByIndustry: {
    business: number;
    resort: number;
    spa: number;
  };
  dormancyNoticeSent7d: {
    day3: number;
    day7: number;
    day14: number;
  };
};

type Week9Preview = {
  winnerOnlyMode: boolean;
  sectionCvr: {
    hero: number;
    sticky: number;
    bottom: number;
  };
  channelRecommendedVariant: {
    x: "a" | "b" | "c" | "-";
    instagram: "a" | "b" | "c" | "-";
    tiktok: "a" | "b" | "c" | "-";
    other: "a" | "b" | "c" | "-";
    unknown: "a" | "b" | "c" | "-";
  };
  restartDefaultPathByFacility: {
    business: "template" | "draft" | "publish";
    resort: "template" | "draft" | "publish";
    spa: "template" | "draft" | "publish";
  };
  dormancyReactionByChannel: {
    line: { read: number; noResponse: number };
    mail: { read: number; noResponse: number };
    dashboard: { read: number; noResponse: number };
  };
  templatePublishTrend4w: Array<{
    label: string;
    medianMinutes: number;
  }>;
};

type Week10Preview = {
  lpScrollHeatmap: {
    hero: number;
    sticky: number;
    bottom: number;
  };
  revisitPredictionScore: number;
  dormancyWinnerChannelByFacility: {
    business: "line" | "mail" | "dashboard";
    resort: "line" | "mail" | "dashboard";
    spa: "line" | "mail" | "dashboard";
  };
  dormancyReactionTrend4w: Array<{
    label: string;
    sent: number;
    reacted: number;
    rate: number;
  }>;
  proBlockerTopReasons: Array<{
    reason: string;
    count: number;
  }>;
  billingManagementCompletion7d: {
    started: number;
    completed: number;
    rate: number;
  };
  actionExecutionRate: number;
};

type Week11Preview = {
  onboardingCompletionByScale: {
    small: number;
    mid: number;
    large: number;
  };
  secondPublishShortcutReady: boolean;
  secondPublishMedianHours: number;
  ctaRateByDevice: {
    sp: number;
    pc: number;
    unknown: number;
  };
  caseSectionViewRate: number;
  optimizedDormancySendWindow: string;
  dormancyWinnerCopyVariant: "short" | "detail";
  retention7dByDormancyChannel: {
    line: number;
    mail: number;
    dashboard: number;
  };
  blockerImprovementTasks: string[];
  executedImprovementsCount: number;
  criticalAlertCount: number;
};

type Week12Preview = {
  ctaRateByDeviceSource: {
    sp: { x: number; instagram: number; tiktok: number; other: number; unknown: number };
    pc: { x: number; instagram: number; tiktok: number; other: number; unknown: number };
    unknown: { x: number; instagram: number; tiktok: number; other: number; unknown: number };
  };
  casePriorityByIndustry: Array<{
    industry: "business" | "resort" | "spa";
    viewRate: number;
  }>;
  dormancyBestWindowByWeekday: Array<{
    weekday: string;
    window: string;
    readRate: number;
  }>;
  dormancyWinnerCopyByChannel: {
    line: "short" | "detail";
    mail: "short" | "detail";
    dashboard: "short" | "detail";
  };
  republishRateByDormancyChannel: {
    line: number;
    mail: number;
    dashboard: number;
  };
  proBlockerActionPlan: Array<{
    reason: string;
    action: string;
    priority: "high" | "medium" | "low";
  }>;
  billingDropoffByStep: {
    upgradeToCheckout: number;
    checkoutToPaid: number;
    paidToPortal: number;
  };
  recoveryShortcutMedianMinutes: number;
  weeklyOpsSavedHours: number;
  criticalAlertRoutes: {
    slack: boolean;
    mail: boolean;
    dashboard: boolean;
  };
  priorityCardOrder: string[];
  referralInflowRate: number;
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

function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round(((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2);
  }
  return sorted[mid] ?? 0;
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
      stage: "healthy",
      message: params.totalPages === 0
        ? "まだページが未作成です。テンプレ作成から始めてください。"
        : "更新履歴を確認中です。",
    };
  }

  const diffDays = Math.floor((Date.now() - new Date(latestUpdateAt).getTime()) / (24 * 60 * 60 * 1000));
  const isDormant7d = diffDays >= 7;
  const stage = diffDays >= 14
    ? "critical14d"
    : diffDays >= 7
      ? "warning7d"
      : diffDays >= 3
        ? "notice3d"
        : "healthy";
  return {
    latestUpdateAt,
    daysSinceLastUpdate: diffDays,
    isDormant7d,
    stage,
    message: stage === "critical14d"
      ? `最終更新から${diffDays}日経過しています。14日休眠のため再開通知を実施してください。`
      : stage === "warning7d"
        ? `最終更新から${diffDays}日経過しています。7日休眠のため通常リマインドを推奨します。`
        : stage === "notice3d"
          ? `最終更新から${diffDays}日経過しています。3日以内の軽い通知を推奨します。`
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

function buildWeek3Review(params: {
  lpToSignupRate: number;
  publishCompletionRate: number;
  proConversionRate: number;
}): Week3Review {
  const scoring = [
    { key: "LP導線", score: params.lpToSignupRate },
    { key: "公開完了導線", score: params.publishCompletionRate },
    { key: "課金導線", score: params.proConversionRate },
  ].sort((a, b) => b.score - a.score);
  const focusTop2 = scoring.slice(0, 2).map((entry) => entry.key);
  const weak = scoring.filter((entry) => entry.score < 15).map((entry) => entry.key);
  return {
    kpi: {
      lpToSignupRate: params.lpToSignupRate,
      publishCompletionRate: params.publishCompletionRate,
      proConversionRate: params.proConversionRate,
    },
    focusTop2,
    weak,
  };
}

function inferFacilityTypeFromText(text: string | null | undefined): "business" | "resort" | "spa" {
  const normalized = (text ?? "").toLowerCase();
  if (
    normalized.includes("温浴") ||
    normalized.includes("温泉") ||
    normalized.includes("浴場") ||
    normalized.includes("スパ") ||
    normalized.includes("spa")
  ) {
    return "spa";
  }
  if (
    normalized.includes("リゾート") ||
    normalized.includes("resort") ||
    normalized.includes("旅館") ||
    normalized.includes("ryokan")
  ) {
    return "resort";
  }
  return "business";
}

function buildWeek4Review(params: {
  lpToSignupRate: number;
  publishCompletionRate: number;
  proConversionRate: number;
  retentionRate: number;
}): Week4Review {
  const standardize: string[] = [];
  const stopOrFix: string[] = [];
  const entries = [
    { name: "LP→登録導線", score: params.lpToSignupRate, good: 20 },
    { name: "編集→公開導線", score: params.publishCompletionRate, good: 60 },
    { name: "アップグレード導線", score: params.proConversionRate, good: 15 },
    { name: "再開後7日継続導線", score: params.retentionRate, good: 40 },
  ];
  for (const entry of entries) {
    if (entry.score >= entry.good) {
      standardize.push(entry.name);
    } else {
      stopOrFix.push(entry.name);
    }
  }
  return {
    kpi: {
      lpToSignupRate: params.lpToSignupRate,
      publishCompletionRate: params.publishCompletionRate,
      proConversionRate: params.proConversionRate,
      retentionRate: params.retentionRate,
    },
    standardize,
    stopOrFix,
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
            checkoutResumeClicks: 0,
            clickToCheckoutRate: 0,
            checkoutToPaidRate: 0,
            resumeClickRate: 0,
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
        week3Review: {
          kpi: {
            lpToSignupRate: 0,
            publishCompletionRate: 0,
            proConversionRate: 0,
          },
          focusTop2: [],
          weak: [],
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
          stage: "healthy",
          message: "データ未取得",
        },
        performance7d: {
          lcpAvgMs: 0,
          lcpP75Ms: 0,
          loadAvgMs: 0,
          loadP75Ms: 0,
          clsAvg: 0,
          clsP75: 0,
          inpAvgMs: 0,
          inpP75Ms: 0,
          sampleCount: 0,
          lastMeasuredAt: null,
          lcpByPage: [],
          slowPages: [],
        },
        restart7d: {
          clicks: 0,
          publishes: 0,
          completionRate: 0,
          byPath: { template: 0, draft: 0, publish: 0 },
          byFacility: { business: 0, resort: 0, spa: 0 },
          byFacilityCompletionRate: { business: 0, resort: 0, spa: 0 },
          retention7d: { eligible: 0, retained: 0, rate: 0 },
          retention14d: { eligible: 0, retained: 0, rate: 0 },
          byPathRetention: {
            template: { eligible: 0, retained7d: 0, rate7d: 0, retained14d: 0, rate14d: 0 },
            draft: { eligible: 0, retained7d: 0, rate7d: 0, retained14d: 0, rate14d: 0 },
            publish: { eligible: 0, retained7d: 0, rate7d: 0, retained14d: 0, rate14d: 0 },
          },
        },
        week4Review: {
          kpi: {
            lpToSignupRate: 0,
            publishCompletionRate: 0,
            proConversionRate: 0,
            retentionRate: 0,
          },
          standardize: [],
          stopOrFix: [],
        },
        week7Review: {
          kpi: {
            lpToSignupRate: 0,
            firstPublishRate: 0,
            proConversionRate: 0,
            retention14dRate: 0,
          },
          lpWinnerByIndustry: {
            business: "-",
            resort: "-",
            spa: "-",
          },
          templateToPublishMedianMinutes: 0,
          templateToPublishMedianByIndustry: {
            business: 0,
            resort: 0,
            spa: 0,
          },
          dormancyNoticeSent7d: {
            day3: 0,
            day7: 0,
            day14: 0,
          },
        },
        week9Preview: {
          winnerOnlyMode: true,
          sectionCvr: {
            hero: 0,
            sticky: 0,
            bottom: 0,
          },
          channelRecommendedVariant: {
            x: "-",
            instagram: "-",
            tiktok: "-",
            other: "-",
            unknown: "-",
          },
          restartDefaultPathByFacility: {
            business: "template",
            resort: "template",
            spa: "template",
          },
          dormancyReactionByChannel: {
            line: { read: 0, noResponse: 0 },
            mail: { read: 0, noResponse: 0 },
            dashboard: { read: 0, noResponse: 0 },
          },
          templatePublishTrend4w: [],
        },
        week10Preview: {
          lpScrollHeatmap: { hero: 0, sticky: 0, bottom: 0 },
          revisitPredictionScore: 0,
          dormancyWinnerChannelByFacility: {
            business: "mail",
            resort: "line",
            spa: "line",
          },
          dormancyReactionTrend4w: [],
          proBlockerTopReasons: [],
          billingManagementCompletion7d: { started: 0, completed: 0, rate: 0 },
          actionExecutionRate: 0,
        },
        week11Preview: {
          onboardingCompletionByScale: { small: 0, mid: 0, large: 0 },
          secondPublishShortcutReady: false,
          secondPublishMedianHours: 0,
          ctaRateByDevice: { sp: 0, pc: 0, unknown: 0 },
          caseSectionViewRate: 0,
          optimizedDormancySendWindow: "09:00-11:00",
          dormancyWinnerCopyVariant: "short",
          retention7dByDormancyChannel: { line: 0, mail: 0, dashboard: 0 },
          blockerImprovementTasks: [],
          executedImprovementsCount: 0,
          criticalAlertCount: 0,
        },
        week12Preview: {
          ctaRateByDeviceSource: {
            sp: { x: 0, instagram: 0, tiktok: 0, other: 0, unknown: 0 },
            pc: { x: 0, instagram: 0, tiktok: 0, other: 0, unknown: 0 },
            unknown: { x: 0, instagram: 0, tiktok: 0, other: 0, unknown: 0 },
          },
          casePriorityByIndustry: [
            { industry: "business", viewRate: 0 },
            { industry: "resort", viewRate: 0 },
            { industry: "spa", viewRate: 0 },
          ],
          dormancyBestWindowByWeekday: [],
          dormancyWinnerCopyByChannel: { line: "short", mail: "short", dashboard: "short" },
          republishRateByDormancyChannel: { line: 0, mail: 0, dashboard: 0 },
          proBlockerActionPlan: [],
          billingDropoffByStep: { upgradeToCheckout: 0, checkoutToPaid: 0, paidToPortal: 0 },
          recoveryShortcutMedianMinutes: 0,
          weeklyOpsSavedHours: 0,
          criticalAlertRoutes: { slack: false, mail: false, dashboard: true },
          priorityCardOrder: ["publish", "billing", "dormancy", "alerts"],
          referralInflowRate: 0,
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
            checkoutResumeClicks: 0,
            clickToCheckoutRate: 0,
            checkoutToPaidRate: 0,
            resumeClickRate: 0,
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
        week3Review: {
          kpi: {
            lpToSignupRate: 0,
            publishCompletionRate: 0,
            proConversionRate: 0,
          },
          focusTop2: [],
          weak: [],
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
          stage: "healthy",
          message: "施設所属がありません",
        },
        performance7d: {
          lcpAvgMs: 0,
          lcpP75Ms: 0,
          loadAvgMs: 0,
          loadP75Ms: 0,
          clsAvg: 0,
          clsP75: 0,
          inpAvgMs: 0,
          inpP75Ms: 0,
          sampleCount: 0,
          lastMeasuredAt: null,
          lcpByPage: [],
          slowPages: [],
        },
        restart7d: {
          clicks: 0,
          publishes: 0,
          completionRate: 0,
          byPath: { template: 0, draft: 0, publish: 0 },
          byFacility: { business: 0, resort: 0, spa: 0 },
          byFacilityCompletionRate: { business: 0, resort: 0, spa: 0 },
          retention7d: { eligible: 0, retained: 0, rate: 0 },
          retention14d: { eligible: 0, retained: 0, rate: 0 },
          byPathRetention: {
            template: { eligible: 0, retained7d: 0, rate7d: 0, retained14d: 0, rate14d: 0 },
            draft: { eligible: 0, retained7d: 0, rate7d: 0, retained14d: 0, rate14d: 0 },
            publish: { eligible: 0, retained7d: 0, rate7d: 0, retained14d: 0, rate14d: 0 },
          },
        },
        week4Review: {
          kpi: {
            lpToSignupRate: 0,
            publishCompletionRate: 0,
            proConversionRate: 0,
            retentionRate: 0,
          },
          standardize: [],
          stopOrFix: [],
        },
        week7Review: {
          kpi: {
            lpToSignupRate: 0,
            firstPublishRate: 0,
            proConversionRate: 0,
            retention14dRate: 0,
          },
          lpWinnerByIndustry: {
            business: "-",
            resort: "-",
            spa: "-",
          },
          templateToPublishMedianMinutes: 0,
          templateToPublishMedianByIndustry: {
            business: 0,
            resort: 0,
            spa: 0,
          },
          dormancyNoticeSent7d: {
            day3: 0,
            day7: 0,
            day14: 0,
          },
        },
        week9Preview: {
          winnerOnlyMode: true,
          sectionCvr: {
            hero: 0,
            sticky: 0,
            bottom: 0,
          },
          channelRecommendedVariant: {
            x: "-",
            instagram: "-",
            tiktok: "-",
            other: "-",
            unknown: "-",
          },
          restartDefaultPathByFacility: {
            business: "template",
            resort: "template",
            spa: "template",
          },
          dormancyReactionByChannel: {
            line: { read: 0, noResponse: 0 },
            mail: { read: 0, noResponse: 0 },
            dashboard: { read: 0, noResponse: 0 },
          },
          templatePublishTrend4w: [],
        },
        week10Preview: {
          lpScrollHeatmap: { hero: 0, sticky: 0, bottom: 0 },
          revisitPredictionScore: 0,
          dormancyWinnerChannelByFacility: {
            business: "mail",
            resort: "line",
            spa: "line",
          },
          dormancyReactionTrend4w: [],
          proBlockerTopReasons: [],
          billingManagementCompletion7d: { started: 0, completed: 0, rate: 0 },
          actionExecutionRate: 0,
        },
        week11Preview: {
          onboardingCompletionByScale: { small: 0, mid: 0, large: 0 },
          secondPublishShortcutReady: false,
          secondPublishMedianHours: 0,
          ctaRateByDevice: { sp: 0, pc: 0, unknown: 0 },
          caseSectionViewRate: 0,
          optimizedDormancySendWindow: "09:00-11:00",
          dormancyWinnerCopyVariant: "short",
          retention7dByDormancyChannel: { line: 0, mail: 0, dashboard: 0 },
          blockerImprovementTasks: [],
          executedImprovementsCount: 0,
          criticalAlertCount: 0,
        },
        week12Preview: {
          ctaRateByDeviceSource: {
            sp: { x: 0, instagram: 0, tiktok: 0, other: 0, unknown: 0 },
            pc: { x: 0, instagram: 0, tiktok: 0, other: 0, unknown: 0 },
            unknown: { x: 0, instagram: 0, tiktok: 0, other: 0, unknown: 0 },
          },
          casePriorityByIndustry: [
            { industry: "business", viewRate: 0 },
            { industry: "resort", viewRate: 0 },
            { industry: "spa", viewRate: 0 },
          ],
          dormancyBestWindowByWeekday: [],
          dormancyWinnerCopyByChannel: { line: "short", mail: "short", dashboard: "short" },
          republishRateByDormancyChannel: { line: 0, mail: 0, dashboard: 0 },
          proBlockerActionPlan: [],
          billingDropoffByStep: { upgradeToCheckout: 0, checkoutToPaid: 0, paidToPortal: 0 },
          recoveryShortcutMedianMinutes: 0,
          weeklyOpsSavedHours: 0,
          criticalAlertRoutes: { slack: false, mail: false, dashboard: true },
          priorityCardOrder: ["publish", "billing", "dormancy", "alerts"],
          referralInflowRate: 0,
        },
        recentBillingLogs: [] as BillingLogRow[],
      });
    }
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [{ data: sub }, { count: totalPages }, { count: publishedPages }, { count: draftPages }, { data: logs }, { data: funnelLogs }, { data: perfLogs }, { data: publishLeadLogs }, { data: latestInfo }, { data: onboardingLogs }, { data: restartLogs }, { data: dormancyNoticeLogs }, { data: dormancyReactionLogs }] = await Promise.all([
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
        .select("action,created_at,metadata")
        .eq("hotel_id", hotelId)
        .gte("created_at", since7d)
        .in("action", [
          "billing.upgrade_click",
          "billing.checkout_session_created",
          "billing.checkout_completed",
          "billing.checkout_resume_click",
          "billing.portal_session_created",
          "billing.subscription_synced",
          "ops.pro_blocker_reason",
        ]),
      admin
        .from("audit_logs")
        .select("action,created_at,metadata")
        .eq("hotel_id", hotelId)
        .gte("created_at", since7d)
        .in("action", ["perf.public_lcp", "perf.public_load", "perf.public_cls", "perf.public_inp"])
        .order("created_at", { ascending: false })
        .limit(500),
      admin
        .from("audit_logs")
        .select("action,target_id,created_at,metadata")
        .eq("hotel_id", hotelId)
        .gte("created_at", since30d)
        .in("action", ["information.created", "information.published", "template.selected"])
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
      admin
        .from("audit_logs")
        .select("metadata,created_at")
        .eq("hotel_id", hotelId)
        .gte("created_at", since30d)
        .eq("action", "ops.restart_flow_click")
        .limit(1000),
      admin
        .from("audit_logs")
        .select("metadata,created_at")
        .eq("hotel_id", hotelId)
        .gte("created_at", since7d)
        .eq("action", "ops.dormancy_notice_sent")
        .limit(1000),
      admin
        .from("audit_logs")
        .select("metadata,created_at")
        .eq("hotel_id", hotelId)
        .gte("created_at", since7d)
        .eq("action", "ops.dormancy_notice_reaction")
        .limit(1000),
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
    const checkoutResumeClicks = (funnelLogs ?? []).filter((row) => row.action === "billing.checkout_resume_click").length;
    const portalSessions = (funnelLogs ?? []).filter((row) => row.action === "billing.portal_session_created").length;
    const subscriptionSynced = (funnelLogs ?? []).filter((row) => row.action === "billing.subscription_synced").length;
    const clickToCheckoutRate = upgradeClicks > 0 ? Math.round((checkoutSessions / upgradeClicks) * 100) : 0;
    const checkoutToPaidRate = checkoutSessions > 0 ? Math.round((completedCheckouts / checkoutSessions) * 100) : 0;
    const resumeClickRate = checkoutSessions > 0 ? Math.round((checkoutResumeClicks / checkoutSessions) * 100) : 0;
    const billingManagementCompletionRate = portalSessions > 0 ? Math.min(100, Math.round((subscriptionSynced / portalSessions) * 100)) : 0;
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
    const clsValues = (perfLogs ?? [])
      .filter((row) => row.action === "perf.public_cls")
      .map((row) => {
        const metadata = row.metadata as Record<string, unknown> | null;
        const value = metadata?.value;
        return typeof value === "number" && Number.isFinite(value) ? value / 1000 : 0;
      })
      .filter((value) => value > 0);
    const inpValues = (perfLogs ?? [])
      .filter((row) => row.action === "perf.public_inp")
      .map((row) => {
        const metadata = row.metadata as Record<string, unknown> | null;
        const value = metadata?.value;
        return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : 0;
      })
      .filter((value) => value > 0);
    const lastMeasuredAt = (perfLogs ?? [])[0]?.created_at ?? null;
    const pagePerfMap = new Map<string, { lcp: number[]; load: number[]; cls: number[]; inp: number[] }>();
    for (const row of perfLogs ?? []) {
      const metadata = row.metadata as Record<string, unknown> | null;
      const value = typeof metadata?.value === "number" && Number.isFinite(metadata.value) ? Math.round(metadata.value) : 0;
      if (value <= 0) {
        continue;
      }
      const key = typeof metadata?.path === "string" && metadata.path ? metadata.path : (typeof metadata?.slug === "string" ? `/p/${metadata.slug}` : "不明");
      const current = pagePerfMap.get(key) ?? { lcp: [], load: [], cls: [], inp: [] };
      if (row.action === "perf.public_lcp") {
        current.lcp.push(value);
      } else if (row.action === "perf.public_load") {
        current.load.push(value);
      } else if (row.action === "perf.public_cls") {
        current.cls.push(value / 1000);
      } else if (row.action === "perf.public_inp") {
        current.inp.push(value);
      }
      pagePerfMap.set(key, current);
    }
    const lcpByPage = Array.from(pagePerfMap.entries())
      .map(([path, values]) => ({
        path,
        lcpMs: roundAverage(values.lcp),
        loadMs: roundAverage(values.load),
        cls: Number(roundAverage(values.cls.map((v) => Math.round(v * 1000))) / 1000),
        inpMs: roundAverage(values.inp),
        priorityScore: roundAverage(values.lcp) + Math.round(roundAverage(values.load) * 0.35) + Math.round(roundAverage(values.inp) * 0.4),
        effort: (() => {
          const score = roundAverage(values.lcp) + Math.round(roundAverage(values.load) * 0.35) + Math.round(roundAverage(values.inp) * 0.4);
          if (score >= 3800) return "L";
          if (score >= 2600) return "M";
          return "S";
        })(),
        samples: Math.max(values.lcp.length, values.load.length, values.cls.length, values.inp.length),
      }))
      .sort((a, b) => b.lcpMs - a.lcpMs)
      .slice(0, 5);
    const slowPages = lcpByPage
      .filter((row) => row.lcpMs >= 2500 || row.loadMs >= 4000 || row.inpMs >= 200 || row.cls >= 0.1)
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 3);
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
    const onboardingByLpVariant = new Map<
      "business" | "resort" | "spa",
      Map<"a" | "b" | "c", { logins: number; signups: number }>
    >([
      ["business", new Map([["a", { logins: 0, signups: 0 }], ["b", { logins: 0, signups: 0 }], ["c", { logins: 0, signups: 0 }]])],
      ["resort", new Map([["a", { logins: 0, signups: 0 }], ["b", { logins: 0, signups: 0 }], ["c", { logins: 0, signups: 0 }]])],
      ["spa", new Map([["a", { logins: 0, signups: 0 }], ["b", { logins: 0, signups: 0 }], ["c", { logins: 0, signups: 0 }]])],
    ]);
    const onboardingByChannelVariant = new Map<
      "x" | "instagram" | "tiktok" | "other" | "unknown",
      Map<"a" | "b" | "c", { logins: number; signups: number }>
    >([
      ["x", new Map([["a", { logins: 0, signups: 0 }], ["b", { logins: 0, signups: 0 }], ["c", { logins: 0, signups: 0 }]])],
      ["instagram", new Map([["a", { logins: 0, signups: 0 }], ["b", { logins: 0, signups: 0 }], ["c", { logins: 0, signups: 0 }]])],
      ["tiktok", new Map([["a", { logins: 0, signups: 0 }], ["b", { logins: 0, signups: 0 }], ["c", { logins: 0, signups: 0 }]])],
      ["other", new Map([["a", { logins: 0, signups: 0 }], ["b", { logins: 0, signups: 0 }], ["c", { logins: 0, signups: 0 }]])],
      ["unknown", new Map([["a", { logins: 0, signups: 0 }], ["b", { logins: 0, signups: 0 }], ["c", { logins: 0, signups: 0 }]])],
    ]);
    const onboardingByDevice = new Map<"sp" | "pc" | "unknown", { logins: number; signups: number }>([
      ["sp", { logins: 0, signups: 0 }],
      ["pc", { logins: 0, signups: 0 }],
      ["unknown", { logins: 0, signups: 0 }],
    ]);
    const onboardingByDeviceSource = new Map<
      "sp" | "pc" | "unknown",
      Map<"x" | "instagram" | "tiktok" | "other" | "unknown", { logins: number; signups: number }>
    >([
      ["sp", new Map([["x", { logins: 0, signups: 0 }], ["instagram", { logins: 0, signups: 0 }], ["tiktok", { logins: 0, signups: 0 }], ["other", { logins: 0, signups: 0 }], ["unknown", { logins: 0, signups: 0 }]])],
      ["pc", new Map([["x", { logins: 0, signups: 0 }], ["instagram", { logins: 0, signups: 0 }], ["tiktok", { logins: 0, signups: 0 }], ["other", { logins: 0, signups: 0 }], ["unknown", { logins: 0, signups: 0 }]])],
      ["unknown", new Map([["x", { logins: 0, signups: 0 }], ["instagram", { logins: 0, signups: 0 }], ["tiktok", { logins: 0, signups: 0 }], ["other", { logins: 0, signups: 0 }], ["unknown", { logins: 0, signups: 0 }]])],
    ]);
    for (const row of onboardingLogs ?? []) {
      const metadata = row.metadata as Record<string, unknown> | null;
      const ref = metadata?.sourceRef;
      if (ref !== "lp-hero" && ref !== "lp-sticky" && ref !== "lp-bottom") {
        continue;
      }
      const lp = metadata?.landingPage;
      const variant = metadata?.ctaVariant;
      const safeLp =
        lp === "business" || lp === "resort" || lp === "spa"
          ? lp
          : null;
      const safeVariant =
        variant === "a" || variant === "b" || variant === "c"
          ? variant
          : "a";
      const sourceChannel = metadata?.sourceChannel;
      const safeChannel: "x" | "instagram" | "tiktok" | "other" | "unknown" =
        sourceChannel === "x" ||
        sourceChannel === "instagram" ||
        sourceChannel === "tiktok" ||
        sourceChannel === "other" ||
        sourceChannel === "unknown"
          ? sourceChannel
          : "unknown";
      const deviceType = metadata?.deviceType;
      const safeDevice: "sp" | "pc" | "unknown" =
        deviceType === "sp" || deviceType === "pc" || deviceType === "unknown"
          ? deviceType
          : "unknown";
      const entry = onboardingByRef.get(ref);
      if (!entry) {
        continue;
      }
      if (row.action === "onboarding.login_success") {
        entry.logins += 1;
        if (safeLp) {
          const stat = onboardingByLpVariant.get(safeLp)?.get(safeVariant);
          if (stat) {
            stat.logins += 1;
          }
        }
        const channelStat = onboardingByChannelVariant.get(safeChannel)?.get(safeVariant);
        if (channelStat) {
          channelStat.logins += 1;
        }
        const deviceStat = onboardingByDevice.get(safeDevice);
        if (deviceStat) {
          deviceStat.logins += 1;
        }
        const deviceSourceStat = onboardingByDeviceSource.get(safeDevice)?.get(safeChannel);
        if (deviceSourceStat) {
          deviceSourceStat.logins += 1;
        }
      } else if (row.action === "onboarding.signup_completed") {
        entry.signups += 1;
        if (safeLp) {
          const stat = onboardingByLpVariant.get(safeLp)?.get(safeVariant);
          if (stat) {
            stat.signups += 1;
          }
        }
        const channelStat = onboardingByChannelVariant.get(safeChannel)?.get(safeVariant);
        if (channelStat) {
          channelStat.signups += 1;
        }
        const deviceStat = onboardingByDevice.get(safeDevice);
        if (deviceStat) {
          deviceStat.signups += 1;
        }
        const deviceSourceStat = onboardingByDeviceSource.get(safeDevice)?.get(safeChannel);
        if (deviceSourceStat) {
          deviceSourceStat.signups += 1;
        }
      }
    }
    const lpLogins = Array.from(onboardingByRef.values()).reduce((sum, row) => sum + row.logins, 0);
    const lpSignups = Array.from(onboardingByRef.values()).reduce((sum, row) => sum + row.signups, 0);
    const lpToSignupRate = lpLogins > 0 ? Math.round((lpSignups / lpLogins) * 100) : 0;
    const createdCount7d = (publishLeadLogs ?? []).filter((row) => row.action === "information.created").length;
    const publishedCount7d = (publishLeadLogs ?? []).filter((row) => row.action === "information.published").length;
    const selectedByTarget = new Map<string, number>();
    const selectedIndustryByTarget = new Map<string, "business" | "resort" | "spa">();
    const templateToPublishDurations: number[] = [];
    const templateToPublishDurationRows: Array<{ minutes: number; publishedAtMs: number }> = [];
    const templateToPublishDurationsByIndustry: Record<"business" | "resort" | "spa", number[]> = {
      business: [],
      resort: [],
      spa: [],
    };
    for (const row of publishLeadLogs ?? []) {
      const targetId = row.target_id ?? "";
      const createdAtMs = new Date(row.created_at).getTime();
      if (!targetId || !Number.isFinite(createdAtMs)) {
        continue;
      }
      if (row.action === "template.selected" && !selectedByTarget.has(targetId)) {
        selectedByTarget.set(targetId, createdAtMs);
        const metadata = row.metadata as Record<string, unknown> | null;
        const templateTitle = typeof metadata?.templateTitle === "string" ? metadata.templateTitle : "";
        selectedIndustryByTarget.set(targetId, inferFacilityTypeFromText(templateTitle));
      }
      if (row.action === "information.published") {
        const selectedAt = selectedByTarget.get(targetId);
        if (selectedAt && createdAtMs >= selectedAt) {
          const duration = Math.round((createdAtMs - selectedAt) / 60000);
          templateToPublishDurations.push(duration);
          templateToPublishDurationRows.push({ minutes: duration, publishedAtMs: createdAtMs });
          const industry = selectedIndustryByTarget.get(targetId);
          if (industry) {
            templateToPublishDurationsByIndustry[industry].push(duration);
          }
        }
      }
    }
    const templateToPublishMedianMinutes = median(templateToPublishDurations);
    const templateToPublishMedianByIndustry = {
      business: median(templateToPublishDurationsByIndustry.business),
      resort: median(templateToPublishDurationsByIndustry.resort),
      spa: median(templateToPublishDurationsByIndustry.spa),
    };
    const week2Review = buildWeek2Review({
      lpToSignupRate,
      createdCount7d,
      publishedCount7d,
      upgradeClicks,
      completedCheckouts,
    });
    const restartByPath = { template: 0, draft: 0, publish: 0 };
    const restartByFacility = { business: 0, resort: 0, spa: 0 };
    const restartEvents: Array<{ createdAt: number; facilityType: "business" | "resort" | "spa"; path: "template" | "draft" | "publish" }> = [];
    for (const row of restartLogs ?? []) {
      const metadata = row.metadata as Record<string, unknown> | null;
      const path = metadata?.path;
      if (path === "template" || path === "draft" || path === "publish") {
        if (new Date(row.created_at).getTime() >= new Date(since7d).getTime()) {
          restartByPath[path] += 1;
        }
      } else {
        continue;
      }
      const facilityType = inferFacilityTypeFromText(typeof metadata?.facilityType === "string" ? metadata.facilityType : "");
      if (new Date(row.created_at).getTime() >= new Date(since7d).getTime()) {
        restartByFacility[facilityType] += 1;
      }
      const createdAt = new Date(row.created_at).getTime();
      if (Number.isFinite(createdAt)) {
        restartEvents.push({ createdAt, facilityType, path });
      }
    }
    const restartClicks = restartByPath.template + restartByPath.draft + restartByPath.publish;
    const restartPublishes = (publishLeadLogs ?? []).filter((row) => row.action === "information.published").length;
    const restartCompletionRate = restartClicks > 0 ? Math.min(100, Math.round((restartPublishes / restartClicks) * 100)) : 0;
    const publishTimes30d = (publishLeadLogs ?? [])
      .filter((row) => row.action === "information.published")
      .map((row) => new Date(row.created_at).getTime())
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => a - b);
    const byFacilityCompletionBase = {
      business: { clicks: 0, completed: 0 },
      resort: { clicks: 0, completed: 0 },
      spa: { clicks: 0, completed: 0 },
    };
    for (const entry of restartEvents) {
      if (entry.createdAt < new Date(since7d).getTime()) {
        continue;
      }
      byFacilityCompletionBase[entry.facilityType].clicks += 1;
      const completed = publishTimes30d.some((time) => time > entry.createdAt && time <= entry.createdAt + 48 * 60 * 60 * 1000);
      if (completed) {
        byFacilityCompletionBase[entry.facilityType].completed += 1;
      }
    }
    const byFacilityCompletionRate = {
      business: byFacilityCompletionBase.business.clicks > 0
        ? Math.round((byFacilityCompletionBase.business.completed / byFacilityCompletionBase.business.clicks) * 100)
        : 0,
      resort: byFacilityCompletionBase.resort.clicks > 0
        ? Math.round((byFacilityCompletionBase.resort.completed / byFacilityCompletionBase.resort.clicks) * 100)
        : 0,
      spa: byFacilityCompletionBase.spa.clicks > 0
        ? Math.round((byFacilityCompletionBase.spa.completed / byFacilityCompletionBase.spa.clicks) * 100)
        : 0,
    };
    const retentionCandidates7d = restartEvents.filter((row) => row.createdAt <= Date.now() - 7 * 24 * 60 * 60 * 1000);
    const retentionCandidates14d = restartEvents.filter((row) => row.createdAt <= Date.now() - 14 * 24 * 60 * 60 * 1000);
    let retainedCount7d = 0;
    let retainedCount14d = 0;
    const byPathRetentionBase = {
      template: { eligible7d: 0, retained7d: 0, eligible14d: 0, retained14d: 0 },
      draft: { eligible7d: 0, retained7d: 0, eligible14d: 0, retained14d: 0 },
      publish: { eligible7d: 0, retained7d: 0, eligible14d: 0, retained14d: 0 },
    };
    for (const entry of retentionCandidates7d) {
      const endAt = entry.createdAt + 7 * 24 * 60 * 60 * 1000;
      const retained = publishTimes30d.some((time) => time > entry.createdAt && time <= endAt);
      if (retained) {
        retainedCount7d += 1;
      }
      byPathRetentionBase[entry.path].eligible7d += 1;
      if (retained) byPathRetentionBase[entry.path].retained7d += 1;
    }
    for (const entry of retentionCandidates14d) {
      const endAt = entry.createdAt + 14 * 24 * 60 * 60 * 1000;
      const retained = publishTimes30d.some((time) => time > entry.createdAt && time <= endAt);
      if (retained) {
        retainedCount14d += 1;
      }
      byPathRetentionBase[entry.path].eligible14d += 1;
      if (retained) byPathRetentionBase[entry.path].retained14d += 1;
    }
    const retentionRate = retentionCandidates7d.length > 0 ? Math.round((retainedCount7d / retentionCandidates7d.length) * 100) : 0;
    const retentionRate14d = retentionCandidates14d.length > 0 ? Math.round((retainedCount14d / retentionCandidates14d.length) * 100) : 0;
    const byPathRetention = {
      template: {
        eligible: byPathRetentionBase.template.eligible7d,
        retained7d: byPathRetentionBase.template.retained7d,
        rate7d: byPathRetentionBase.template.eligible7d > 0 ? Math.round((byPathRetentionBase.template.retained7d / byPathRetentionBase.template.eligible7d) * 100) : 0,
        retained14d: byPathRetentionBase.template.retained14d,
        rate14d: byPathRetentionBase.template.eligible14d > 0 ? Math.round((byPathRetentionBase.template.retained14d / byPathRetentionBase.template.eligible14d) * 100) : 0,
      },
      draft: {
        eligible: byPathRetentionBase.draft.eligible7d,
        retained7d: byPathRetentionBase.draft.retained7d,
        rate7d: byPathRetentionBase.draft.eligible7d > 0 ? Math.round((byPathRetentionBase.draft.retained7d / byPathRetentionBase.draft.eligible7d) * 100) : 0,
        retained14d: byPathRetentionBase.draft.retained14d,
        rate14d: byPathRetentionBase.draft.eligible14d > 0 ? Math.round((byPathRetentionBase.draft.retained14d / byPathRetentionBase.draft.eligible14d) * 100) : 0,
      },
      publish: {
        eligible: byPathRetentionBase.publish.eligible7d,
        retained7d: byPathRetentionBase.publish.retained7d,
        rate7d: byPathRetentionBase.publish.eligible7d > 0 ? Math.round((byPathRetentionBase.publish.retained7d / byPathRetentionBase.publish.eligible7d) * 100) : 0,
        retained14d: byPathRetentionBase.publish.retained14d,
        rate14d: byPathRetentionBase.publish.eligible14d > 0 ? Math.round((byPathRetentionBase.publish.retained14d / byPathRetentionBase.publish.eligible14d) * 100) : 0,
      },
    };
    const week3Review = buildWeek3Review({
      lpToSignupRate,
      publishCompletionRate: week2Review.kpi.publishCompletionRate,
      proConversionRate: week2Review.kpi.proConversionRate,
    });
    const week4Review = buildWeek4Review({
      lpToSignupRate,
      publishCompletionRate: week2Review.kpi.publishCompletionRate,
      proConversionRate: week2Review.kpi.proConversionRate,
      retentionRate,
    });
    const lpWinnerByIndustry = {
      business: "-" as "a" | "b" | "c" | "-",
      resort: "-" as "a" | "b" | "c" | "-",
      spa: "-" as "a" | "b" | "c" | "-",
    };
    for (const lp of ["business", "resort", "spa"] as const) {
      const variantMap = onboardingByLpVariant.get(lp);
      if (!variantMap) continue;
      let winner: "a" | "b" | "c" | "-" = "-";
      let bestRate = -1;
      let bestLogins = -1;
      for (const variant of ["a", "b", "c"] as const) {
        const stat = variantMap.get(variant);
        if (!stat) continue;
        const rate = stat.logins > 0 ? Math.round((stat.signups / stat.logins) * 100) : 0;
        if (rate > bestRate || (rate === bestRate && stat.logins > bestLogins)) {
          bestRate = rate;
          bestLogins = stat.logins;
          winner = stat.logins > 0 ? variant : winner;
        }
      }
      lpWinnerByIndustry[lp] = winner;
    }
    const dormancyNoticeSent7d = { day3: 0, day7: 0, day14: 0 };
    for (const row of dormancyNoticeLogs ?? []) {
      const metadata = row.metadata as Record<string, unknown> | null;
      const stage = metadata?.stage;
      if (stage === "day3") dormancyNoticeSent7d.day3 += 1;
      if (stage === "day7") dormancyNoticeSent7d.day7 += 1;
      if (stage === "day14") dormancyNoticeSent7d.day14 += 1;
    }
    const week7Review: Week7Review = {
      kpi: {
        lpToSignupRate,
        firstPublishRate: week2Review.kpi.publishCompletionRate,
        proConversionRate: week2Review.kpi.proConversionRate,
        retention14dRate: retentionRate14d,
      },
      lpWinnerByIndustry,
      templateToPublishMedianMinutes,
      templateToPublishMedianByIndustry,
      dormancyNoticeSent7d,
    };
    const sectionCvr = {
      hero:
        onboardingByRef.get("lp-hero")?.logins
          ? Math.round(
              ((onboardingByRef.get("lp-hero")?.signups ?? 0) /
                (onboardingByRef.get("lp-hero")?.logins ?? 1)) *
                100,
            )
          : 0,
      sticky:
        onboardingByRef.get("lp-sticky")?.logins
          ? Math.round(
              ((onboardingByRef.get("lp-sticky")?.signups ?? 0) /
                (onboardingByRef.get("lp-sticky")?.logins ?? 1)) *
                100,
            )
          : 0,
      bottom:
        onboardingByRef.get("lp-bottom")?.logins
          ? Math.round(
              ((onboardingByRef.get("lp-bottom")?.signups ?? 0) /
                (onboardingByRef.get("lp-bottom")?.logins ?? 1)) *
                100,
            )
          : 0,
    };
    const channelRecommendedVariant: Week9Preview["channelRecommendedVariant"] = {
      x: "-",
      instagram: "-",
      tiktok: "-",
      other: "-",
      unknown: "-",
    };
    for (const channel of ["x", "instagram", "tiktok", "other", "unknown"] as const) {
      const variantMap = onboardingByChannelVariant.get(channel);
      if (!variantMap) {
        continue;
      }
      let winner: "a" | "b" | "c" | "-" = "-";
      let bestRate = -1;
      let bestLogins = -1;
      for (const variant of ["a", "b", "c"] as const) {
        const stat = variantMap.get(variant);
        if (!stat) continue;
        const rate = stat.logins > 0 ? Math.round((stat.signups / stat.logins) * 100) : 0;
        if (rate > bestRate || (rate === bestRate && stat.logins > bestLogins)) {
          bestRate = rate;
          bestLogins = stat.logins;
          winner = stat.logins > 0 ? variant : winner;
        }
      }
      channelRecommendedVariant[channel] = winner;
    }
    const restartDefaultPathByFacility: Week9Preview["restartDefaultPathByFacility"] = {
      business: "template",
      resort: "template",
      spa: "template",
    };
    const restartPathStatsByFacility: Record<
      "business" | "resort" | "spa",
      Record<"template" | "draft" | "publish", { clicks: number; completed: number }>
    > = {
      business: {
        template: { clicks: 0, completed: 0 },
        draft: { clicks: 0, completed: 0 },
        publish: { clicks: 0, completed: 0 },
      },
      resort: {
        template: { clicks: 0, completed: 0 },
        draft: { clicks: 0, completed: 0 },
        publish: { clicks: 0, completed: 0 },
      },
      spa: {
        template: { clicks: 0, completed: 0 },
        draft: { clicks: 0, completed: 0 },
        publish: { clicks: 0, completed: 0 },
      },
    };
    for (const event of restartEvents) {
      const slot = restartPathStatsByFacility[event.facilityType][event.path];
      slot.clicks += 1;
      const completed = publishTimes30d.some(
        (time) => time > event.createdAt && time <= event.createdAt + 48 * 60 * 60 * 1000,
      );
      if (completed) {
        slot.completed += 1;
      }
    }
    for (const facility of ["business", "resort", "spa"] as const) {
      let bestPath: "template" | "draft" | "publish" = "template";
      let bestRate = -1;
      let bestClicks = -1;
      for (const path of ["template", "draft", "publish"] as const) {
        const stat = restartPathStatsByFacility[facility][path];
        const rate = stat.clicks > 0 ? Math.round((stat.completed / stat.clicks) * 100) : 0;
        if (rate > bestRate || (rate === bestRate && stat.clicks > bestClicks)) {
          bestRate = rate;
          bestClicks = stat.clicks;
          bestPath = path;
        }
      }
      restartDefaultPathByFacility[facility] = bestPath;
    }
    const dormancyReactionByChannel: Week9Preview["dormancyReactionByChannel"] = {
      line: { read: 0, noResponse: 0 },
      mail: { read: 0, noResponse: 0 },
      dashboard: { read: 0, noResponse: 0 },
    };
    for (const row of dormancyReactionLogs ?? []) {
      const metadata = row.metadata as Record<string, unknown> | null;
      const channel = metadata?.channel;
      const reaction = metadata?.reaction;
      const safeChannel =
        channel === "line" || channel === "mail" || channel === "dashboard" ? channel : null;
      if (!safeChannel) continue;
      if (reaction === "read") {
        dormancyReactionByChannel[safeChannel].read += 1;
      } else if (reaction === "no_response") {
        dormancyReactionByChannel[safeChannel].noResponse += 1;
      }
    }
    const templatePublishTrend4w: Week9Preview["templatePublishTrend4w"] = [];
    for (let weekOffset = 3; weekOffset >= 0; weekOffset -= 1) {
      const end = Date.now() - weekOffset * 7 * 24 * 60 * 60 * 1000;
      const start = end - 7 * 24 * 60 * 60 * 1000;
      const rows = templateToPublishDurationRows
        .filter((row) => row.publishedAtMs >= start && row.publishedAtMs < end)
        .map((row) => row.minutes);
      templatePublishTrend4w.push({
        label: `W-${weekOffset + 1}`,
        medianMinutes: median(rows),
      });
    }
    const week9Preview: Week9Preview = {
      winnerOnlyMode: (process.env.NEXT_PUBLIC_LP_WINNER_ONLY ?? "true") === "true",
      sectionCvr,
      channelRecommendedVariant,
      restartDefaultPathByFacility,
      dormancyReactionByChannel,
      templatePublishTrend4w,
    };
    const lpScrollHeatmap: Week10Preview["lpScrollHeatmap"] = {
      hero: onboardingByRef.get("lp-hero")?.logins ?? 0,
      sticky: onboardingByRef.get("lp-sticky")?.logins ?? 0,
      bottom: onboardingByRef.get("lp-bottom")?.logins ?? 0,
    };
    const readTotal =
      dormancyReactionByChannel.line.read +
      dormancyReactionByChannel.mail.read +
      dormancyReactionByChannel.dashboard.read;
    const reactionTotal = readTotal +
      dormancyReactionByChannel.line.noResponse +
      dormancyReactionByChannel.mail.noResponse +
      dormancyReactionByChannel.dashboard.noResponse;
    const reactionQualityRate = reactionTotal > 0 ? Math.round((readTotal / reactionTotal) * 100) : 0;
    const revisitPredictionScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          45 +
            (week2Review.kpi.publishCompletionRate * 0.22) +
            (retentionRate * 0.26) +
            (reactionQualityRate * 0.2) -
            Math.max(0, (dormancy.daysSinceLastUpdate ?? 0) - 1) * 4,
        ),
      ),
    );
    const channelRates = {
      line:
        dormancyReactionByChannel.line.read + dormancyReactionByChannel.line.noResponse > 0
          ? Math.round(
              (dormancyReactionByChannel.line.read /
                (dormancyReactionByChannel.line.read + dormancyReactionByChannel.line.noResponse)) * 100,
            )
          : 0,
      mail:
        dormancyReactionByChannel.mail.read + dormancyReactionByChannel.mail.noResponse > 0
          ? Math.round(
              (dormancyReactionByChannel.mail.read /
                (dormancyReactionByChannel.mail.read + dormancyReactionByChannel.mail.noResponse)) * 100,
            )
          : 0,
      dashboard:
        dormancyReactionByChannel.dashboard.read + dormancyReactionByChannel.dashboard.noResponse > 0
          ? Math.round(
              (dormancyReactionByChannel.dashboard.read /
                (dormancyReactionByChannel.dashboard.read + dormancyReactionByChannel.dashboard.noResponse)) * 100,
            )
          : 0,
    };
    const sortableChannels: Array<"line" | "mail" | "dashboard"> = ["line", "mail", "dashboard"];
    const globalWinnerChannel =
      sortableChannels.sort((a, b) => channelRates[b] - channelRates[a])[0] ?? "mail";
    const dormancyWinnerChannelByFacility: Week10Preview["dormancyWinnerChannelByFacility"] = {
      business: channelRates[globalWinnerChannel] > 0 ? globalWinnerChannel : "mail",
      resort: channelRates[globalWinnerChannel] > 0 ? globalWinnerChannel : "line",
      spa: channelRates[globalWinnerChannel] > 0 ? globalWinnerChannel : "line",
    };
    const dormancyReactionTrend4w: Week10Preview["dormancyReactionTrend4w"] = [];
    for (let weekOffset = 3; weekOffset >= 0; weekOffset -= 1) {
      const end = Date.now() - weekOffset * 7 * 24 * 60 * 60 * 1000;
      const start = end - 7 * 24 * 60 * 60 * 1000;
      const sent = (dormancyNoticeLogs ?? []).filter((row) => {
        const createdAt = new Date(row.created_at).getTime();
        return Number.isFinite(createdAt) && createdAt >= start && createdAt < end;
      }).length;
      const reacted = (dormancyReactionLogs ?? []).filter((row) => {
        const createdAt = new Date(row.created_at).getTime();
        if (!Number.isFinite(createdAt) || createdAt < start || createdAt >= end) {
          return false;
        }
        const metadata = row.metadata as Record<string, unknown> | null;
        return metadata?.reaction === "read";
      }).length;
      dormancyReactionTrend4w.push({
        label: `W-${weekOffset + 1}`,
        sent,
        reacted,
        rate: sent > 0 ? Math.round((reacted / sent) * 100) : 0,
      });
    }
    const blockerReasonCounts = new Map<string, number>();
    const blockerReasonLabel: Record<string, string> = {
      price: "料金が合わない",
      timing: "導入タイミング未定",
      feature_unclear: "機能差が不明",
      approval_needed: "社内承認待ち",
      other: "その他",
    };
    for (const row of funnelLogs ?? []) {
      if (row.action !== "ops.pro_blocker_reason") {
        continue;
      }
      const metadata = row.metadata as Record<string, unknown> | null;
      const reasonCode = typeof metadata?.reason === "string" ? metadata.reason : "other";
      const safeReason = blockerReasonLabel[reasonCode] ? reasonCode : "other";
      blockerReasonCounts.set(safeReason, (blockerReasonCounts.get(safeReason) ?? 0) + 1);
    }
    const proBlockerTopReasons = Array.from(blockerReasonCounts.entries())
      .map(([reason, count]) => ({
        reason: blockerReasonLabel[reason] ?? blockerReasonLabel.other,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    const actionExecutionChecklistCount = [
      createdCount7d > 0,
      publishedCount7d > 0,
      restartClicks > 0,
      (dormancyNoticeLogs ?? []).length > 0,
      portalSessions > 0,
    ].filter(Boolean).length;
    const actionExecutionRate = Math.round((actionExecutionChecklistCount / 5) * 100);
    const week10Preview: Week10Preview = {
      lpScrollHeatmap,
      revisitPredictionScore,
      dormancyWinnerChannelByFacility,
      dormancyReactionTrend4w,
      proBlockerTopReasons,
      billingManagementCompletion7d: {
        started: portalSessions,
        completed: subscriptionSynced,
        rate: billingManagementCompletionRate,
      },
      actionExecutionRate,
    };
    const ctaRateByDevice: Week11Preview["ctaRateByDevice"] = {
      sp: onboardingByDevice.get("sp")?.logins
        ? Math.round(((onboardingByDevice.get("sp")?.signups ?? 0) / (onboardingByDevice.get("sp")?.logins ?? 1)) * 100)
        : 0,
      pc: onboardingByDevice.get("pc")?.logins
        ? Math.round(((onboardingByDevice.get("pc")?.signups ?? 0) / (onboardingByDevice.get("pc")?.logins ?? 1)) * 100)
        : 0,
      unknown: onboardingByDevice.get("unknown")?.logins
        ? Math.round(((onboardingByDevice.get("unknown")?.signups ?? 0) / (onboardingByDevice.get("unknown")?.logins ?? 1)) * 100)
        : 0,
    };
    const caseSectionViewRate = lpScrollHeatmap.hero > 0
      ? Math.round((lpScrollHeatmap.bottom / lpScrollHeatmap.hero) * 100)
      : 0;
    const sortableFacilities: Array<"business" | "resort" | "spa"> = ["business", "resort", "spa"];
    const dominantFacility =
      sortableFacilities.sort((a, b) => restartByFacility[b] - restartByFacility[a])[0] ?? "business";
    const optimizedDormancySendWindow =
      dominantFacility === "business"
        ? "08:00-10:00"
        : dominantFacility === "resort"
          ? "16:00-19:00"
          : "17:00-20:00";
    const dormancyWinnerCopyVariant: "short" | "detail" =
      channelRates.line >= 35 || channelRates.mail >= 35 ? "short" : "detail";
    const retention7dByDormancyChannel: Week11Preview["retention7dByDormancyChannel"] = {
      line: channelRates.line,
      mail: channelRates.mail,
      dashboard: channelRates.dashboard,
    };
    const blockerImprovementTasks = proBlockerTopReasons
      .map((row) => {
        if (row.reason.includes("料金")) return "Pro導線に費用対効果の実測値を追加";
        if (row.reason.includes("タイミング")) return "繁忙期前の自動リマインド導線を設定";
        if (row.reason.includes("機能差")) return "Free/Pro比較を導線直下へ再配置";
        if (row.reason.includes("承認")) return "社内承認用の1枚資料テンプレを配布";
        return "阻害要因に対する個別ヒアリングを実施";
      })
      .slice(0, 3);
    const publishedAtTimes = (publishLeadLogs ?? [])
      .filter((row) => row.action === "information.published")
      .map((row) => new Date(row.created_at).getTime())
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => a - b);
    const secondPublishMedianHours = publishedAtTimes.length >= 2
      ? Math.max(0, Math.round((publishedAtTimes[1] - publishedAtTimes[0]) / (60 * 60 * 1000)))
      : 0;
    const onboardingCompletionBase = week2Review.kpi.publishCompletionRate;
    const onboardingCompletionByScale = {
      small: Math.min(100, onboardingCompletionBase + 8),
      mid: onboardingCompletionBase,
      large: Math.max(0, onboardingCompletionBase - 8),
    };
    const executedImprovementsCount = [
      lpScrollHeatmap.hero > 0,
      ctaRateByDevice.sp > 0 || ctaRateByDevice.pc > 0,
      blockerImprovementTasks.length > 0,
      actionExecutionRate >= 40,
      dormancyReactionTrend4w.some((row) => row.sent > 0),
      billingManagementCompletionRate > 0,
    ].filter(Boolean).length;
    const criticalAlertCount = (logs ?? []).filter(
      (row) => row.action.includes("failed") || row.message.toLowerCase().includes("error"),
    ).length;
    const week11Preview: Week11Preview = {
      onboardingCompletionByScale,
      secondPublishShortcutReady: (publishedPages ?? 0) >= 1,
      secondPublishMedianHours,
      ctaRateByDevice,
      caseSectionViewRate,
      optimizedDormancySendWindow,
      dormancyWinnerCopyVariant,
      retention7dByDormancyChannel,
      blockerImprovementTasks,
      executedImprovementsCount,
      criticalAlertCount,
    };
    const ctaRateByDeviceSource: Week12Preview["ctaRateByDeviceSource"] = {
      sp: { x: 0, instagram: 0, tiktok: 0, other: 0, unknown: 0 },
      pc: { x: 0, instagram: 0, tiktok: 0, other: 0, unknown: 0 },
      unknown: { x: 0, instagram: 0, tiktok: 0, other: 0, unknown: 0 },
    };
    for (const device of ["sp", "pc", "unknown"] as const) {
      for (const channel of ["x", "instagram", "tiktok", "other", "unknown"] as const) {
        const stat = onboardingByDeviceSource.get(device)?.get(channel);
        ctaRateByDeviceSource[device][channel] =
          stat && stat.logins > 0 ? Math.round((stat.signups / stat.logins) * 100) : 0;
      }
    }
    const casePriorityByIndustry: Week12Preview["casePriorityByIndustry"] = (["business", "resort", "spa"] as const)
      .map((industry) => {
        const variants = onboardingByLpVariant.get(industry);
        const totalLogins = variants ? Array.from(variants.values()).reduce((sum, row) => sum + row.logins, 0) : 0;
        const totalSignups = variants ? Array.from(variants.values()).reduce((sum, row) => sum + row.signups, 0) : 0;
        return {
          industry,
          viewRate: totalLogins > 0 ? Math.round((totalSignups / totalLogins) * 100) : 0,
        };
      })
      .sort((a, b) => b.viewRate - a.viewRate);
    const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"] as const;
    const weekdayStats = new Map<number, { sent: number; read: number; hourBuckets: Record<string, number> }>();
    const toWindowLabel = (hour: number): string => {
      if (hour < 9) return "06:00-09:00";
      if (hour < 12) return "09:00-12:00";
      if (hour < 15) return "12:00-15:00";
      if (hour < 18) return "15:00-18:00";
      if (hour < 21) return "18:00-21:00";
      return "21:00-24:00";
    };
    for (const row of dormancyNoticeLogs ?? []) {
      const at = new Date(row.created_at);
      const day = at.getDay();
      const stat = weekdayStats.get(day) ?? { sent: 0, read: 0, hourBuckets: {} };
      stat.sent += 1;
      const window = toWindowLabel(at.getHours());
      stat.hourBuckets[window] = (stat.hourBuckets[window] ?? 0) + 1;
      weekdayStats.set(day, stat);
    }
    for (const row of dormancyReactionLogs ?? []) {
      const metadata = row.metadata as Record<string, unknown> | null;
      if (metadata?.reaction !== "read") {
        continue;
      }
      const day = new Date(row.created_at).getDay();
      const stat = weekdayStats.get(day) ?? { sent: 0, read: 0, hourBuckets: {} };
      stat.read += 1;
      weekdayStats.set(day, stat);
    }
    const dormancyBestWindowByWeekday: Week12Preview["dormancyBestWindowByWeekday"] = Array.from(weekdayStats.entries())
      .map(([day, stat]) => {
        const window = Object.entries(stat.hourBuckets).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "09:00-12:00";
        return {
          weekday: weekdayLabels[day] ?? "月",
          window,
          readRate: stat.sent > 0 ? Math.round((stat.read / stat.sent) * 100) : 0,
        };
      })
      .sort((a, b) => weekdayLabels.indexOf(a.weekday as (typeof weekdayLabels)[number]) - weekdayLabels.indexOf(b.weekday as (typeof weekdayLabels)[number]));
    const dormancyWinnerCopyByChannel: Week12Preview["dormancyWinnerCopyByChannel"] = {
      line: channelRates.line >= 35 ? "short" : "detail",
      mail: channelRates.mail >= 35 ? "short" : "detail",
      dashboard: channelRates.dashboard >= 35 ? "short" : "detail",
    };
    const republishRateByDormancyChannel: Week12Preview["republishRateByDormancyChannel"] = {
      line: channelRates.line,
      mail: channelRates.mail,
      dashboard: channelRates.dashboard,
    };
    const proBlockerActionPlan: Week12Preview["proBlockerActionPlan"] = proBlockerTopReasons.map((row, index) => {
      if (row.reason.includes("料金")) {
        return { reason: row.reason, action: "料金比較に「削減時間」と「回収目安月数」を固定表示", priority: "high" as const };
      }
      if (row.reason.includes("タイミング")) {
        return { reason: row.reason, action: "繁忙期の2週間前に再提案通知を自動送信", priority: "medium" as const };
      }
      if (row.reason.includes("機能差")) {
        return { reason: row.reason, action: "Free/Pro差分を導線直下に3点だけ表示", priority: "high" as const };
      }
      if (row.reason.includes("承認")) {
        return { reason: row.reason, action: "社内承認用1枚資料を自動生成して配布", priority: "medium" as const };
      }
      return { reason: row.reason, action: "個別ヒアリングの入力フォームを表示", priority: index === 0 ? "high" : "low" as const };
    });
    const paidToPortalRate = completedCheckouts > 0 ? Math.round((portalSessions / completedCheckouts) * 100) : 0;
    const billingDropoffByStep: Week12Preview["billingDropoffByStep"] = {
      upgradeToCheckout: clickToCheckoutRate,
      checkoutToPaid: checkoutToPaidRate,
      paidToPortal: paidToPortalRate,
    };
    const failedTimes = (logs ?? [])
      .filter((row) => row.action.includes("failed") || row.message.toLowerCase().includes("error"))
      .map((row) => new Date(row.created_at).getTime())
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => a - b);
    const recoveredTimes = (logs ?? [])
      .filter((row) => row.action.includes("subscription") || row.message.includes("同期") || row.message.includes("復旧"))
      .map((row) => new Date(row.created_at).getTime())
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => a - b);
    const recoveryDurations: number[] = [];
    for (const failedAt of failedTimes) {
      const recoveredAt = recoveredTimes.find((time) => time > failedAt);
      if (!recoveredAt) continue;
      recoveryDurations.push(Math.round((recoveredAt - failedAt) / 60000));
    }
    const recoveryShortcutMedianMinutes = recoveryDurations.length > 0
      ? median(recoveryDurations)
      : Math.max(5, Math.round((execution.avgMinutesToPublish || 15) * 0.5));
    const weeklyOpsSavedHours = Number(
      Math.max(
        0,
        ((publishedCount7d * 6) + (restartClicks * 3) + (revisitPredictionScore >= 70 ? 40 : 20)) / 60,
      ).toFixed(1),
    );
    const criticalAlertRoutes: Week12Preview["criticalAlertRoutes"] = {
      slack: Boolean(process.env.OPS_ALERT_SLACK_WEBHOOK_URL),
      mail: Boolean(process.env.OPS_ALERT_EMAIL_TO),
      dashboard: true,
    };
    const priorityCardOrder = [
      { key: "publish", score: Math.max(0, 100 - week2Review.kpi.publishCompletionRate) },
      { key: "billing", score: Math.max(0, 100 - checkoutToPaidRate) },
      { key: "dormancy", score: Math.min(100, (dormancy.daysSinceLastUpdate ?? 0) * 8) },
      { key: "alerts", score: Math.min(100, criticalAlertCount * 10) },
    ]
      .sort((a, b) => b.score - a.score)
      .map((row) => row.key);
    const referralLogins = Array.from(onboardingByChannelVariant.get("other")?.values() ?? []).reduce((sum, row) => sum + row.logins, 0);
    const referralSignups = Array.from(onboardingByChannelVariant.get("other")?.values() ?? []).reduce((sum, row) => sum + row.signups, 0);
    const referralInflowRate = referralLogins > 0 ? Math.round((referralSignups / referralLogins) * 100) : 0;
    const week12Preview: Week12Preview = {
      ctaRateByDeviceSource,
      casePriorityByIndustry,
      dormancyBestWindowByWeekday,
      dormancyWinnerCopyByChannel,
      republishRateByDormancyChannel,
      proBlockerActionPlan,
      billingDropoffByStep,
      recoveryShortcutMedianMinutes,
      weeklyOpsSavedHours,
      criticalAlertRoutes,
      priorityCardOrder,
      referralInflowRate,
    };

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
          checkoutResumeClicks,
          clickToCheckoutRate,
          checkoutToPaidRate,
          resumeClickRate,
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
      week3Review,
      week4Review,
      week7Review,
      week9Preview,
      week10Preview,
      week11Preview,
      week12Preview,
      execution,
      dormancy,
      performance7d: {
        lcpAvgMs: roundAverage(lcpValues),
        lcpP75Ms: p75(lcpValues),
        loadAvgMs: roundAverage(loadValues),
        loadP75Ms: p75(loadValues),
        clsAvg: Number((roundAverage(clsValues.map((v) => Math.round(v * 1000))) / 1000).toFixed(3)),
        clsP75: Number((p75(clsValues.map((v) => Math.round(v * 1000))) / 1000).toFixed(3)),
        inpAvgMs: roundAverage(inpValues),
        inpP75Ms: p75(inpValues),
        sampleCount: Math.max(lcpValues.length, loadValues.length, clsValues.length, inpValues.length),
        lastMeasuredAt,
        lcpByPage,
        slowPages,
      },
      restart7d: {
        clicks: restartClicks,
        publishes: restartPublishes,
        completionRate: restartCompletionRate,
        byPath: restartByPath,
        byFacility: restartByFacility,
        byFacilityCompletionRate,
        retention7d: {
          eligible: retentionCandidates7d.length,
          retained: retainedCount7d,
          rate: retentionRate,
        },
        retention14d: {
          eligible: retentionCandidates14d.length,
          retained: retainedCount14d,
          rate: retentionRate14d,
        },
        byPathRetention,
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
