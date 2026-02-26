"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/auth-gate";
import { useAuth } from "@/components/auth-provider";
import {
  buildPublicUrl,
  createStripePortalSession,
  createStripeCheckoutSession,
  createInformationFromTemplate,
  deleteInformation,
  ensureUserHotelScope,
  getDashboardBootstrapData,
  getInformation,
  getCurrentHotelSubscription,
  getCurrentHotelViewMetrics,
  getOpsHealthSnapshot,
  listCurrentHotelAuditLogs,
  runOpsRecoveryAction,
  runOpsAlertTest,
  trackUpgradeClick,
  type HotelAuditLog,
  type HotelSubscription,
  type HotelViewMetrics,
  type OpsHealthSnapshot,
  type SubscriptionPlan,
  type SubscriptionStatus,
  updateCurrentHotelSubscription,
  updateCurrentHotelName,
  updateInformation,
} from "@/lib/storage";
import type { Information } from "@/types/information";
import { INDUSTRY_PRESET_LABELS, type IndustryPreset, starterTemplates } from "@/lib/templates";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatShortDate(value: string | null): string {
  if (!value) {
    return "未設定";
  }
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function formatAuditDate(value: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusLabel(status: SubscriptionStatus): string {
  if (status === "active") {
    return "有効";
  }
  if (status === "trialing") {
    return "トライアル中";
  }
  if (status === "past_due") {
    return "支払い失敗";
  }
  return "解約済み";
}

function clampPercent(value: number): number {
  if (value < 0) {
    return 0;
  }
  if (value > 100) {
    return 100;
  }
  return value;
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="lux-card rounded-2xl p-4 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </article>
  );
}

function SideNavButton(props: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`group relative flex h-11 w-11 items-center justify-center rounded-xl border text-slate-700 transition duration-200 ${
        props.active
          ? "border-emerald-400 bg-gradient-to-b from-emerald-400 to-emerald-500 text-white shadow-[0_10px_20px_-14px_rgba(16,185,129,0.65)]"
          : "border-slate-300 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700 hover:shadow-md"
      }`}
      title={props.label}
      aria-label={props.label}
    >
      {props.children}
      <span className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm group-hover:block">
        {props.label}
      </span>
    </button>
  );
}

type DashboardTab = "dashboard" | "create" | "project" | "ops";
type OpsActionFilter = "all" | "webhook" | "checkout" | "portal";
type ProjectStatusFilter = "all" | "published" | "draft";
type ProjectFileGroup = {
  hub: Information;
  pages: Information[];
};
type PendingDeleteBatch = {
  id: string;
  label: string;
  items: Information[];
  expiresAt: number;
};
const QUICKSTART_DISMISSED_KEY = "hotel-quickstart-dismissed-v1";

function parseDashboardTab(value: string | null): DashboardTab | null {
  if (value === "dashboard" || value === "create" || value === "project" || value === "ops") {
    return value;
  }
  return null;
}

function normalizeProjectName(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export default function DashboardPage() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [items, setItems] = useState<Information[]>([]);
  const [hotelName, setHotelName] = useState("");
  const [subscription, setSubscription] = useState<HotelSubscription | null>(null);
  const [planDraft, setPlanDraft] = useState<SubscriptionPlan>("free");
  const [statusDraft, setStatusDraft] = useState<SubscriptionStatus>("active");
  const [savingSubscription, setSavingSubscription] = useState(false);
  const [creatingCheckout, setCreatingCheckout] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [viewMetrics, setViewMetrics] = useState<HotelViewMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<HotelAuditLog[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);
  const [loadingOpsHealth, setLoadingOpsHealth] = useState(false);
  const [opsHealth, setOpsHealth] = useState<OpsHealthSnapshot | null>(null);
  const [recoveringAction, setRecoveringAction] = useState<"ensure_scope" | "sync_subscription" | null>(null);
  const [sendingOpsTest, setSendingOpsTest] = useState(false);
  const [pendingDeleteBatches, setPendingDeleteBatches] = useState<PendingDeleteBatch[]>([]);
  const [editingHotelName, setEditingHotelName] = useState(false);
  const [hotelNameDraft, setHotelNameDraft] = useState("");
  const [savingHotelName, setSavingHotelName] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");
  const [quickSearch, setQuickSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] = useState<ProjectStatusFilter>("all");
  const [industryFilter, setIndustryFilter] = useState<IndustryPreset | "all">("all");
  const [opsActionFilter, setOpsActionFilter] = useState<OpsActionFilter>("all");
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdownNow, setCountdownNow] = useState<number>(Date.now());
  const deleteTimersRef = useRef<Map<string, number>>(new Map());
  const autoSyncedRenewalRef = useRef(false);
  const opsAdminEmails = useMemo(
    () =>
      (process.env.NEXT_PUBLIC_OPS_ADMIN_EMAILS ?? "")
        .split(",")
        .map((entry) => entry.trim().toLowerCase())
        .filter((entry) => entry.length > 0),
    [],
  );
  const userEmail = user?.email?.trim().toLowerCase() ?? "";
  const hasAdminRoleClaim =
    user?.app_metadata?.role === "admin" || user?.user_metadata?.role === "admin";
  const canAccessOps = hasAdminRoleClaim || (userEmail.length > 0 && opsAdminEmails.includes(userEmail));

  useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const params = new URLSearchParams(search);
    const requestedTab = parseDashboardTab(params.get("tab"));
    if (requestedTab) {
      setActiveTab(requestedTab);
    }
    const billing = params.get("billing");
    if (billing === "success") {
      setSuccess("決済が完了しました。プラン情報を更新しています。");
    }
    if (billing === "cancel") {
      setError("決済はキャンセルされました。");
    }
    if (billing && typeof window !== "undefined") {
      params.delete("billing");
      const next = params.toString();
      const nextUrl = `${window.location.pathname}${next ? `?${next}` : ""}`;
      window.history.replaceState({}, "", nextUrl);
    }
  }, []);

  useEffect(() => {
    if (canAccessOps || activeTab !== "ops") {
      return;
    }
    setActiveTab("dashboard");
  }, [canAccessOps, activeTab]);

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        const boot = await getDashboardBootstrapData();
        if (mounted) {
          setHotelName(boot.hotelName);
          setHotelNameDraft(boot.hotelName);
          setSubscription(boot.subscription);
          setPlanDraft(boot.subscription?.plan ?? "free");
          setStatusDraft(boot.subscription?.status ?? "active");
          setItems(boot.informations);
        }
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : "一覧取得に失敗しました");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void run();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }
    let mounted = true;
    setLoadingMetrics(true);
    void getCurrentHotelViewMetrics()
      .then((metrics) => {
        if (!mounted) {
          return;
        }
        setViewMetrics(metrics);
      })
      .catch((e) => {
        if (!mounted) {
          return;
        }
        setError(e instanceof Error ? e.message : "分析データ取得に失敗しました");
      })
      .finally(() => {
        if (!mounted) {
          return;
        }
        setLoadingMetrics(false);
      });

    return () => {
      mounted = false;
    };
  }, [loading]);

  useEffect(() => {
    if (loading || autoSyncedRenewalRef.current) {
      return;
    }
    const needsAutoSync =
      subscription?.plan === "pro" &&
      (subscription.status === "active" || subscription.status === "trialing") &&
      !subscription.currentPeriodEnd;
    if (!needsAutoSync) {
      return;
    }
    autoSyncedRenewalRef.current = true;
    void (async () => {
      try {
        await runOpsRecoveryAction("sync_subscription");
        const latest = await getCurrentHotelSubscription();
        setSubscription(latest);
        if (latest) {
          setPlanDraft(latest.plan);
          setStatusDraft(latest.status);
        }
      } catch {
        autoSyncedRenewalRef.current = false;
      }
    })();
  }, [loading, subscription]);

  async function refreshOpsHealth() {
    setLoadingOpsHealth(true);
    try {
      const health = await getOpsHealthSnapshot();
      setOpsHealth(health);
    } catch (e) {
      setError(e instanceof Error ? e.message : "運用ヘルスの取得に失敗しました");
    } finally {
      setLoadingOpsHealth(false);
    }
  }

  useEffect(() => {
    if (loading) {
      return;
    }
    void refreshOpsHealth();
  }, [loading]);

  useEffect(() => {
    if (loading || !opsHealth || typeof window === "undefined") {
      return;
    }
    const dismissed = window.localStorage.getItem(QUICKSTART_DISMISSED_KEY) === "1";
    const shouldShow = !dismissed && opsHealth.onboarding.totalPages === 0;
    setShowQuickStart(shouldShow);
  }, [loading, opsHealth]);

  useEffect(() => {
    if (loading) {
      return;
    }
    let mounted = true;
    setLoadingAuditLogs(true);
    void listCurrentHotelAuditLogs()
      .then((logs) => {
        if (!mounted) {
          return;
        }
        setAuditLogs(logs);
      })
      .catch((e) => {
        if (!mounted) {
          return;
        }
        setError(e instanceof Error ? e.message : "監査ログ取得に失敗しました");
      })
      .finally(() => {
        if (!mounted) {
          return;
        }
        setLoadingAuditLogs(false);
      });

    return () => {
      mounted = false;
    };
  }, [loading]);

  const published = useMemo(
    () => items.filter((item) => item.status === "published"),
    [items],
  );
  const draft = useMemo(
    () => items.filter((item) => item.status === "draft"),
    [items],
  );
  const projectFileGroups = useMemo<ProjectFileGroup[]>(() => {
    const bySlug = new Map(items.map((item) => [item.slug, item]));
    return items
      .map((hub) => {
        const nodeMap = hub.theme.nodeMap;
        if (!nodeMap?.enabled) {
          return null;
        }
        const pageSlugs = Array.from(
          new Set(
            nodeMap.nodes
              .map((node) => (typeof node.targetSlug === "string" ? node.targetSlug.trim() : ""))
              .filter(Boolean),
          ),
        );
        const pages = pageSlugs
          .map((slug) => bySlug.get(slug))
          .filter((entry): entry is Information => Boolean(entry))
          .filter((entry) => entry.id !== hub.id);
        return { hub, pages };
      })
      .filter((group): group is ProjectFileGroup => Boolean(group));
  }, [items]);
  const groupedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const group of projectFileGroups) {
      ids.add(group.hub.id);
      for (const page of group.pages) {
        ids.add(page.id);
      }
    }
    return ids;
  }, [projectFileGroups]);
  const standaloneProjectItems = useMemo(
    () => items.filter((item) => !groupedIds.has(item.id)),
    [items, groupedIds],
  );
  const filteredProjectFileGroups = useMemo(() => {
    const q = projectSearch.trim().toLowerCase();
    const byStatus = (entry: Information) =>
      projectStatusFilter === "all" ? true : entry.status === projectStatusFilter;
    return projectFileGroups
      .map((group) => {
        const pages = group.pages.filter((entry) => byStatus(entry));
        const keywordHit =
          !q ||
          group.hub.title.toLowerCase().includes(q) ||
          pages.some((entry) => entry.title.toLowerCase().includes(q));
        if (!keywordHit) {
          return null;
        }
        if (q && group.hub.title.toLowerCase().includes(q)) {
          return { ...group, pages };
        }
        if (q && pages.length === 0) {
          return null;
        }
        return { ...group, pages };
      })
      .filter((entry): entry is ProjectFileGroup => Boolean(entry));
  }, [projectFileGroups, projectSearch, projectStatusFilter]);
  const filteredStandaloneProjectItems = useMemo(() => {
    const q = projectSearch.trim().toLowerCase();
    return standaloneProjectItems
      .filter((entry) => (projectStatusFilter === "all" ? true : entry.status === projectStatusFilter))
      .filter((entry) => (!q ? true : entry.title.toLowerCase().includes(q)));
  }, [standaloneProjectItems, projectSearch, projectStatusFilter]);
  const groupedPageCount = useMemo(
    () => projectFileGroups.reduce((sum, group) => sum + group.pages.length, 0),
    [projectFileGroups],
  );
  const pendingDeleteIds = useMemo(
    () => new Set(pendingDeleteBatches.flatMap((batch) => batch.items.map((item) => item.id))),
    [pendingDeleteBatches],
  );
  const publishedLimit = subscription?.maxPublishedPages ?? 0;
  const remainingPublishSlots = Math.max(publishedLimit - published.length, 0);
  const usagePercent = publishedLimit > 0
    ? clampPercent((published.length / publishedLimit) * 100)
    : 0;
  const isLimitReached = publishedLimit > 0 && published.length >= publishedLimit;
  const isNearLimit = !isLimitReached && publishedLimit > 0 && usagePercent >= 80;
  const isProActive = subscription?.plan === "pro" && (subscription.status === "active" || subscription.status === "trialing");
  const primaryBillingCtaLabel = isProActive ? "解約する" : "Proにアップグレード";
  const primaryBillingCtaLoading = isProActive ? openingPortal : creatingCheckout;
  const primaryBillingCtaDisabled = isProActive ? openingPortal || !subscription?.hasStripeCustomer : creatingCheckout;
  const nextRenewalLabel = subscription
    ? subscription.currentPeriodEnd
      ? formatShortDate(subscription.currentPeriodEnd)
      : isProActive
        ? "請求ポータルで確認"
        : "未設定"
    : "-";
  const filteredTemplates = useMemo(
    () => {
      const q = quickSearch.trim().toLowerCase();
      return starterTemplates.filter((template) => {
        if (industryFilter !== "all" && template.industry !== industryFilter) {
          return false;
        }
        if (!q) {
          return true;
        }
        return (
          template.title.toLowerCase().includes(q) ||
          template.body.toLowerCase().includes(q)
        );
      });
    },
    [quickSearch, industryFilter],
  );
  const trackedEditActions = useMemo(
    () =>
      auditLogs.filter(
        (log) =>
          log.action === "information.created" ||
          log.action === "information.updated" ||
          log.action === "information.published",
      ).length,
    [auditLogs],
  );
  const estimatedMonthlyEdits = useMemo(
    () => Math.max(12, trackedEditActions * 3, items.length * 4),
    [trackedEditActions, items.length],
  );
  const estimatedSavedMinutesPerMonth = estimatedMonthlyEdits * 7;
  const estimatedSavedHoursPerMonth = (estimatedSavedMinutesPerMonth / 60).toFixed(1);
  const qrShare7d = useMemo(() => {
    const total = viewMetrics?.totalViews7d ?? 0;
    const qr = viewMetrics?.qrViews7d ?? 0;
    if (total <= 0) {
      return 0;
    }
    return Math.round((qr / total) * 100);
  }, [viewMetrics]);
  const proFitSignals = useMemo(
    () =>
      [
        remainingPublishSlots <= 1,
        projectFileGroups.length > 0,
        (viewMetrics?.totalViews7d ?? 0) >= 50,
      ].filter(Boolean).length,
    [projectFileGroups.length, remainingPublishSlots, viewMetrics],
  );
  const opsTimeline = useMemo(
    () =>
      auditLogs
        .filter((log) => log.action.startsWith("billing.") || log.action.startsWith("ops."))
        .filter((log) => {
          if (opsActionFilter === "all") {
            return true;
          }
          if (opsActionFilter === "webhook") {
            return (
              log.action.includes("webhook") ||
              log.action === "billing.subscription_synced" ||
              log.action === "billing.checkout_completed"
            );
          }
          if (opsActionFilter === "checkout") {
            return log.action.startsWith("billing.checkout");
          }
          return log.action.startsWith("billing.portal");
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [auditLogs, opsActionFilter],
  );
  const opsErrorTimeline = useMemo(
    () =>
      opsTimeline.filter(
        (log) =>
          log.action.includes("failed") ||
          log.message.includes("失敗") ||
          log.message.toLowerCase().includes("error"),
      ),
    [opsTimeline],
  );
  const normalizedProjectName = useMemo(() => normalizeProjectName(newProjectName), [newProjectName]);
  const canCreateProject = normalizedProjectName.length >= 2;

  async function onCreate(templateIndex = 0) {
    try {
      await ensureUserHotelScope();
      const id = await createInformationFromTemplate(templateIndex);
      router.push(`/editor/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "新規作成に失敗しました");
    }
  }

  async function onSaveHotelName() {
    const nextName = hotelNameDraft.trim();
    if (!nextName) {
      setError("施設名を入力してください");
      return;
    }
    setSavingHotelName(true);
    setError(null);
    setSuccess(null);
    try {
      await updateCurrentHotelName(nextName);
      setHotelName(nextName);
      setEditingHotelName(false);
      setSuccess("施設名を更新しました");
    } catch (e) {
      setError(e instanceof Error ? e.message : "施設名の更新に失敗しました");
    } finally {
      setSavingHotelName(false);
    }
  }

  async function onSaveSubscription() {
    setSavingSubscription(true);
    setError(null);
    setSuccess(null);
    try {
      await updateCurrentHotelSubscription(planDraft, statusDraft);
      const sub = await getCurrentHotelSubscription();
      setSubscription(sub);
      setSuccess("プラン情報を更新しました");
    } catch (e) {
      setError(e instanceof Error ? e.message : "プラン更新に失敗しました");
    } finally {
      setSavingSubscription(false);
    }
  }

  async function onStartStripeCheckout() {
    setCreatingCheckout(true);
    setError(null);
    setSuccess(null);
    try {
      await trackUpgradeClick("dashboard");
      const url = await createStripeCheckoutSession();
      window.location.assign(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Stripe Checkoutの開始に失敗しました");
      setCreatingCheckout(false);
    }
  }

  async function onOpenBillingPortal() {
    setOpeningPortal(true);
    setError(null);
    setSuccess(null);
    try {
      const url = await createStripePortalSession();
      window.location.assign(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Customer Portalの開始に失敗しました");
      setOpeningPortal(false);
    }
  }

  async function onSignOut() {
    await signOut();
    router.replace("/login");
  }

  function upsertItemsWithSort(nextItems: Information[]) {
    const byId = new Map<string, Information>();
    for (const entry of nextItems) {
      byId.set(entry.id, entry);
    }
    return Array.from(byId.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  async function finalizeDeleteBatch(batchId: string, deletingItems: Information[], label: string) {
    deleteTimersRef.current.delete(batchId);
    setPendingDeleteBatches((prev) => prev.filter((batch) => batch.id !== batchId));
    const results = await Promise.allSettled(
      deletingItems.map((target) => deleteInformation(target.id).then(() => target.id)),
    );
    const failedIds = new Set(
      results
        .filter((result): result is PromiseRejectedResult => result.status === "rejected")
        .map((_, index) => deletingItems[index]?.id)
        .filter(Boolean),
    );
    if (failedIds.size > 0) {
      const failedItems = deletingItems.filter((entry) => failedIds.has(entry.id));
      setItems((prev) => upsertItemsWithSort([...prev, ...failedItems]));
      setError(`「${label}」の削除で一部失敗しました。再試行してください。`);
      return;
    }
    setSuccess(`「${label}」を削除しました`);
  }

  function scheduleDeleteBatch(targets: Information[], label: string) {
    const batchId = crypto.randomUUID();
    const expiresAt = Date.now() + 5000;
    setError(null);
    setSuccess(`「${label}」を削除しました。5秒以内なら取り消せます。`);
    setItems((prev) => prev.filter((entry) => !targets.some((target) => target.id === entry.id)));
    setPendingDeleteBatches((prev) => [...prev, { id: batchId, label, items: targets, expiresAt }]);
    const timerId = window.setTimeout(() => {
      void finalizeDeleteBatch(batchId, targets, label);
    }, 5000);
    deleteTimersRef.current.set(batchId, timerId);
  }

  function onDeleteInformation(item: Information) {
    if (pendingDeleteIds.has(item.id)) {
      return;
    }
    scheduleDeleteBatch([item], item.title);
  }

  function onDeleteProjectGroup(group: ProjectFileGroup) {
    const targets = [group.hub, ...group.pages];
    if (targets.some((target) => pendingDeleteIds.has(target.id))) {
      return;
    }
    scheduleDeleteBatch(targets, `${group.hub.title}（プロジェクト）`);
  }

  function onUndoDeleteBatch(batchId: string) {
    const timerId = deleteTimersRef.current.get(batchId);
    if (typeof timerId === "number") {
      window.clearTimeout(timerId);
      deleteTimersRef.current.delete(batchId);
    }
    setPendingDeleteBatches((prev) => {
      const batch = prev.find((entry) => entry.id === batchId);
      if (batch) {
        setItems((itemsPrev) => upsertItemsWithSort([...itemsPrev, ...batch.items]));
        setSuccess(`「${batch.label}」の削除を取り消しました`);
      }
      return prev.filter((entry) => entry.id !== batchId);
    });
  }

  useEffect(() => {
    const timers = deleteTimersRef.current;
    return () => {
      for (const timerId of timers.values()) {
        window.clearTimeout(timerId);
      }
      timers.clear();
    };
  }, []);

  useEffect(() => {
    if (pendingDeleteBatches.length === 0) {
      return;
    }
    const timerId = window.setInterval(() => {
      setCountdownNow(Date.now());
    }, 250);
    return () => {
      window.clearInterval(timerId);
    };
  }, [pendingDeleteBatches.length]);

  function dismissQuickStart() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(QUICKSTART_DISMISSED_KEY, "1");
    }
    setShowQuickStart(false);
  }

  async function onRunRecovery(action: "ensure_scope" | "sync_subscription") {
    setRecoveringAction(action);
    setError(null);
    setSuccess(null);
    try {
      const message = await runOpsRecoveryAction(action);
      setSuccess(message);
      await Promise.all([
        refreshOpsHealth(),
        listCurrentHotelAuditLogs().then(setAuditLogs),
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "復旧操作に失敗しました");
    } finally {
      setRecoveringAction(null);
    }
  }

  async function onRunOpsAlertTest() {
    setSendingOpsTest(true);
    setError(null);
    setSuccess(null);
    try {
      const message = await runOpsAlertTest();
      setSuccess(message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "通知テストに失敗しました");
    } finally {
      setSendingOpsTest(false);
    }
  }

  async function onCreateProjectWithName() {
    const title = normalizeProjectName(newProjectName);
    if (!title) {
      setError("プロジェクト名を入力してください");
      return;
    }
    if (title.length < 2) {
      setError("プロジェクト名は2文字以上で入力してください");
      return;
    }
    setCreatingProject(true);
    setError(null);
    setSuccess(null);
    try {
      await ensureUserHotelScope();
      const id = await createInformationFromTemplate(0);
      const created = await getInformation(id);
      if (!created) {
        throw new Error("新規プロジェクトの取得に失敗しました");
      }
      const nextTheme = {
        ...created.theme,
        nodeMap: {
          enabled: true,
          nodes: [],
          edges: [],
        },
      };
      await updateInformation(id, {
        title,
        theme: nextTheme,
      });
      const nextItem: Information = {
        ...created,
        title,
        theme: nextTheme,
        updatedAt: new Date().toISOString(),
      };
      setItems((prev) => upsertItemsWithSort([nextItem, ...prev]));
      setShowCreateProjectModal(false);
      setNewProjectName("");
      setSuccess(`プロジェクト「${title}」を作成しました`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "プロジェクト作成に失敗しました");
    } finally {
      setCreatingProject(false);
    }
  }

  return (
    <AuthGate>
      <main
        className={`lux-main min-h-screen bg-[radial-gradient(circle_at_top_right,#86efac33_0%,#34d39926_24%,#ecfdf5_58%,#dcfce7_100%)] px-2 pt-3 pb-6 sm:px-3 sm:pb-7 lg:pl-[82px] lg:pr-6 ${
          activeTab === "dashboard" ? "lg:h-screen lg:overflow-hidden" : ""
        }`}
      >
        <div className="mx-auto w-full max-w-[1820px] space-y-2">
          {activeTab === "dashboard" && (
          <header className="lux-card lux-section-card rounded-3xl p-4 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="lux-kicker text-xs">店舗管理</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {editingHotelName ? (
                    <>
                      <input
                        value={hotelNameDraft}
                        onChange={(e) => setHotelNameDraft(e.target.value)}
                        className="min-w-[220px] rounded-lg border border-slate-300 px-3 py-1.5 text-xl font-semibold text-slate-900"
                        placeholder="施設名"
                      />
                      <button
                        type="button"
                        disabled={savingHotelName}
                        onClick={() => void onSaveHotelName()}
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs hover:bg-slate-50 disabled:opacity-60"
                      >
                        {savingHotelName ? "保存中..." : "保存"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingHotelName(false);
                          setHotelNameDraft(hotelName);
                        }}
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs hover:bg-slate-50"
                      >
                        キャンセル
                      </button>
                    </>
                  ) : (
                    <>
                      <h1 className="text-2xl font-semibold text-slate-900">{hotelName || "Infomii"}</h1>
                      <button
                        type="button"
                        onClick={() => setEditingHotelName(true)}
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                        title="施設名を編集"
                        aria-label="施設名を編集"
                      >
                        ✎
                      </button>
                    </>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  誰でも迷わずページ作成と公開管理ができます。
                </p>
                {canAccessOps && (
                  <p className="mt-1 inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                    管理者モード: 運用センター表示中
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void onCreate(0)}
                  className="lux-btn-primary rounded-xl px-4 py-2 text-sm font-medium"
                >
                  + 新規インフォメーションを作成
                </button>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
                >
                  ログアウト
                </button>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="現在プラン"
                value={subscription?.plan ?? "-"}
                note={`status: ${subscription?.status ?? "-"}`}
              />
              <StatCard
                label="公開中"
                value={`${published.length}`}
                note={`上限 ${subscription?.maxPublishedPages ?? "-"} 件`}
              />
              <StatCard label="下書き" value={`${draft.length}`} note="公開前の下書き件数" />
              <StatCard label="合計ページ" value={`${items.length}`} note="公開中 + 下書き" />
            </div>
          </header>
          )}

          {error && (
            <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900">
              <p>{error}</p>
              {(error.toLowerCase().includes("row-level security") || error.includes("施設所属")) && (
                <button
                  type="button"
                  onClick={() => void onRunRecovery("ensure_scope")}
                  disabled={recoveringAction !== null}
                  className="mt-2 rounded-md border border-rose-300 bg-white px-2 py-1 text-xs text-rose-800 hover:bg-rose-50 disabled:opacity-60"
                >
                  {recoveringAction === "ensure_scope" ? "復旧中..." : "施設所属を再同期する"}
                </button>
              )}
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">{success}</div>
          )}
          {pendingDeleteBatches.length > 0 && (
            <div className="fixed bottom-5 right-5 z-50 space-y-2">
              {pendingDeleteBatches.map((batch) => (
                <div key={batch.id} className="min-w-[260px] rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
                  <p className="text-xs text-slate-700">「{batch.label}」を削除しました</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-[11px] text-slate-500">
                      {Math.max(1, Math.ceil((batch.expiresAt - countdownNow) / 1000))}秒以内なら取り消せます
                    </p>
                    <button
                      type="button"
                      onClick={() => onUndoDeleteBatch(batch.id)}
                      className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs text-emerald-800 hover:bg-emerald-100"
                    >
                      取り消し
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {showCreateProjectModal && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/35 px-4">
              <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
                <h3 className="text-base font-semibold text-slate-900">新規プロジェクトを作成</h3>
                <p className="mt-1 text-xs text-slate-500">
                  プロジェクト名を入力すると、ノードマップ付きの親ページを作成します。
                </p>
                <input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void onCreateProjectWithName();
                    }
                  }}
                  placeholder="例: 館内総合案内"
                  className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <p className="mt-1 text-[11px] text-slate-500">2文字以上で入力してください。</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateProjectModal(false);
                      setNewProjectName("");
                    }}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={() => void onCreateProjectWithName()}
                    disabled={creatingProject || !canCreateProject}
                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                  >
                    {creatingProject ? "作成中..." : "作成する"}
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === "dashboard" && (
            <article className="rounded-2xl lux-section-card border border-emerald-200/80 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900">Free / Pro 比較</h2>
                <button
                  type="button"
                  onClick={() => void onStartStripeCheckout()}
                  disabled={creatingCheckout || isProActive}
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                >
                  {isProActive ? "現在Proプランです" : creatingCheckout ? "遷移中..." : "Proにアップグレード"}
                </button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <p className="font-medium text-slate-500">項目</p>
                <p className="font-medium text-slate-500">Free</p>
                <p className="font-medium text-slate-500">Pro</p>
                <p>公開ページ上限</p>
                <p>3件</p>
                <p>1000件</p>
                <p>請求書・カード管理</p>
                <p>不可</p>
                <p>利用可</p>
                <p>おすすめ用途</p>
                <p>小規模運用</p>
                <p>本番運用 / 複数案件</p>
              </div>
            </article>
          )}
          {activeTab === "dashboard" && showQuickStart && (
            <div className="rounded-2xl lux-section-card border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-[220px]">
                  <p className="text-sm font-semibold text-emerald-900">初回3分セットアップ</p>
                  <p className="mt-1 text-xs text-emerald-800">まずは1ページ作成して公開まで進めます。</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void onCreate(0)}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-500"
                  >
                    + 新規インフォメーションを作成
                  </button>
                  <button
                    type="button"
                    onClick={dismissQuickStart}
                    className="rounded-md border border-transparent px-2 py-1 text-xs text-emerald-700 hover:border-emerald-200 hover:bg-emerald-100/70"
                    aria-label="初回セットアップを閉じる"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="relative">
            <aside className="rounded-3xl border border-emerald-200/70 bg-white p-2 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.7)] backdrop-blur lg:fixed lg:left-0 lg:top-0 lg:z-20 lg:flex lg:h-screen lg:w-[72px] lg:flex-col lg:rounded-none lg:rounded-r-3xl">
              <div className="flex flex-row items-center justify-center gap-2 lg:flex-col lg:gap-3">
                <SideNavButton label="トップページへ" onClick={() => router.push("/")}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 10.5 12 3l9 7.5" />
                    <path d="M5 9.5V21h14V9.5" />
                  </svg>
                </SideNavButton>
                <SideNavButton
                  label="ダッシュボード"
                  active={activeTab === "dashboard"}
                  onClick={() => setActiveTab("dashboard")}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="3" width="8" height="8" rx="1.5" />
                    <rect x="13" y="3" width="8" height="5" rx="1.5" />
                    <rect x="13" y="10" width="8" height="11" rx="1.5" />
                    <rect x="3" y="13" width="8" height="8" rx="1.5" />
                  </svg>
                </SideNavButton>
                <SideNavButton
                  label="作成"
                  active={activeTab === "create"}
                  onClick={() => setActiveTab("create")}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                    <rect x="3" y="3" width="18" height="18" rx="2.5" />
                  </svg>
                </SideNavButton>
                <SideNavButton
                  label="プロジェクト"
                  active={activeTab === "project"}
                  onClick={() => setActiveTab("project")}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 9h18" />
                  </svg>
                </SideNavButton>
                {canAccessOps && (
                  <SideNavButton
                    label="運用センター"
                    active={activeTab === "ops"}
                    onClick={() => setActiveTab("ops")}
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 20h16" />
                      <path d="M7 17v-3" />
                      <path d="M12 17v-6" />
                      <path d="M17 17v-9" />
                      <circle cx="7" cy="10" r="1.2" />
                      <circle cx="12" cy="7" r="1.2" />
                      <circle cx="17" cy="4" r="1.2" />
                    </svg>
                  </SideNavButton>
                )}
              </div>
              <div className="mt-auto hidden lg:flex lg:flex-col lg:items-center lg:gap-3">
                <SideNavButton label="利用規約へ" onClick={() => router.push("/terms")}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 3h9l3 3v15H6z" />
                    <path d="M15 3v4h3" />
                    <path d="M9 12h6M9 16h6" />
                  </svg>
                </SideNavButton>
                <SideNavButton label="ログアウト" onClick={onSignOut}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <path d="M16 17l5-5-5-5" />
                    <path d="M21 12H9" />
                  </svg>
                </SideNavButton>
              </div>
            </aside>

            <div className="space-y-3">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="h-4 w-36 rounded bg-slate-200" />
                <div className="mt-3 h-9 w-72 rounded bg-slate-200" />
                <div className="mt-3 h-4 w-96 rounded bg-slate-200" />
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`sk-stat-${i}`} className="h-24 rounded-2xl bg-slate-200" />
                  ))}
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <div className="h-48 rounded-2xl border border-slate-200/80 bg-white" />
                  <div className="h-48 rounded-2xl border border-slate-200/80 bg-white" />
                </div>
                <div className="space-y-4">
                  <div className="h-40 rounded-2xl border border-slate-200/80 bg-white" />
                  <div className="h-56 rounded-2xl border border-slate-200/80 bg-white" />
                </div>
              </div>
            </div>
          ) : activeTab === "create" ? (
            <section className="space-y-4">
              <div className="lux-card rounded-3xl bg-gradient-to-r from-emerald-100/70 via-teal-100/70 to-cyan-100/60 p-6 shadow-sm">
                <p className="text-center text-4xl font-light tracking-wide text-emerald-800">さあ、何を作成しますか？</p>
                <div className="mx-auto mt-4 max-w-3xl">
                  <input
                    value={quickSearch}
                    onChange={(e) => setQuickSearch(e.target.value)}
                    placeholder="テンプレートを検索（タイトル / 本文）"
                    className="w-full rounded-2xl border border-emerald-300/70 bg-white/95 px-4 py-3 text-sm text-slate-800 shadow-sm outline-none ring-emerald-300 focus:ring"
                  />
                </div>
                <div className="mx-auto mt-3 flex max-w-5xl flex-wrap justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIndustryFilter("all")}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      industryFilter === "all"
                        ? "border-emerald-400 bg-emerald-100 text-emerald-900"
                        : "border-slate-300 bg-white/90 text-slate-700 hover:bg-white"
                    }`}
                  >
                    すべて
                  </button>
                  {(Object.entries(INDUSTRY_PRESET_LABELS) as Array<[IndustryPreset, string]>).map(
                    ([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setIndustryFilter(key)}
                        className={`rounded-full border px-3 py-1 text-xs ${
                          industryFilter === key
                            ? "border-emerald-400 bg-emerald-100 text-emerald-900"
                            : "border-slate-300 bg-white/90 text-slate-700 hover:bg-white"
                        }`}
                      >
                        {label}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <article className="rounded-2xl border border-emerald-200/80 bg-white/90 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-800">最短1クリックで新規作成</p>
                  <button
                    type="button"
                    onClick={() => void onCreate(0)}
                    className="lux-btn-primary rounded-xl px-4 py-2 text-sm font-medium"
                  >
                    + 新規インフォメーションを作成
                  </button>
                </div>
              </article>

              <div className="grid gap-3 lg:grid-cols-3">
                {filteredTemplates.map((template, index) => {
                  const originalIndex = starterTemplates.findIndex(
                    (item) => item.title === template.title && item.body === template.body,
                  );
                  return (
                    <article
                      key={`${template.title}-${index}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => void onCreate(originalIndex)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          void onCreate(originalIndex);
                        }
                      }}
                      aria-label={`${template.title} で作成`}
                      className="cursor-pointer rounded-2xl lux-section-card border border-emerald-100 bg-white p-4 shadow-sm"
                    >
                      <p className="text-[11px] uppercase tracking-[0.12em] text-emerald-700">
                        {INDUSTRY_PRESET_LABELS[template.industry]}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-slate-900">{template.title}</h3>
                      <p className="mt-2 max-h-24 overflow-hidden whitespace-pre-wrap text-xs leading-6 text-slate-600">
                        {template.body}
                      </p>
                      <p className="mt-3 inline-flex rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white">
                        このテンプレで作成
                      </p>
                    </article>
                  );
                })}
                {filteredTemplates.length === 0 && (
                  <article className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                    検索条件に一致するテンプレートがありません。
                  </article>
                )}
              </div>
            </section>
          ) : activeTab === "project" ? (
            <section className="space-y-4">
              <article className="rounded-2xl lux-section-card border border-emerald-200/80 bg-white p-4 shadow-sm">
                <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">ファイル数</p>
                      <p className="mt-1 text-xl font-semibold text-slate-900">{projectFileGroups.length}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">ファイル内ページ</p>
                      <p className="mt-1 text-xl font-semibold text-slate-900">{groupedPageCount}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">単体ページ</p>
                      <p className="mt-1 text-xl font-semibold text-slate-900">{standaloneProjectItems.length}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      placeholder="ページ名で検索"
                      className="w-[220px] rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                    {([
                      ["all", "すべて"],
                      ["published", "公開中"],
                      ["draft", "下書き"],
                    ] as Array<[ProjectStatusFilter, string]>).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setProjectStatusFilter(value)}
                        className={`rounded-md border px-2 py-1 text-xs ${
                          projectStatusFilter === value
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                            : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowCreateProjectModal(true)}
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
                    >
                      + 新規プロジェクト
                    </button>
                  </div>
                </div>
              </article>
              <article className="rounded-2xl lux-section-card border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">プロジェクトファイル（複数ページ）</h2>
                  <p className="text-xs text-slate-500">作成したファイルはここから編集できます（まずは親ページを編集）</p>
                </div>
                <div className="space-y-3">
                  {filteredProjectFileGroups.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                      <p>該当するプロジェクトファイルはありません。</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCreateProjectModal(true)}
                          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
                        >
                          + 新規プロジェクト
                        </button>
                        {projectSearch.trim() || projectStatusFilter !== "all" ? (
                          <button
                            type="button"
                            onClick={() => {
                              setProjectSearch("");
                              setProjectStatusFilter("all");
                            }}
                            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
                          >
                            フィルタをリセット
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )}
                  {filteredProjectFileGroups.map((group) => (
                    <article
                      key={group.hub.id}
                      className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 transition hover:-translate-y-[1px] hover:shadow-sm cursor-pointer"
                      onClick={() => router.push(`/editor/${group.hub.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          router.push(`/editor/${group.hub.id}`);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${group.hub.title} を編集`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">プロジェクトファイル</p>
                          <h3 className="font-medium text-slate-900">{group.hub.title}</h3>
                        </div>
                        <span className="rounded-full border border-emerald-300 bg-white px-2 py-1 text-[11px] text-emerald-800">
                          {group.pages.length}ページ
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">最終更新: {formatDate(group.hub.updatedAt)}</p>
                      <p className="mt-2 rounded-md border border-emerald-200 bg-white/80 px-2 py-1 text-[11px] text-emerald-800">
                        次: 親ページを編集 → ノード接続 → アイコン遷移先を設定
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          href={`/editor/${group.hub.id}`}
                          onClick={(event) => event.stopPropagation()}
                          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium !text-white hover:bg-emerald-500 hover:!text-white"
                        >
                          親ページを編集
                        </Link>
                        <a
                          href={buildPublicUrl(group.hub.slug)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
                        >
                          QR / 公開ページ
                        </a>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            void onDeleteProjectGroup(group);
                          }}
                          disabled={group.pages.concat(group.hub).some((entry) => pendingDeleteIds.has(entry.id))}
                          className="rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                        >
                          {group.pages.concat(group.hub).some((entry) => pendingDeleteIds.has(entry.id)) ? "保留中..." : "プロジェクト削除"}
                        </button>
                      </div>
                      <div className="mt-3">
                        {group.pages.length === 0 ? (
                          <p className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs text-slate-500">
                            関連ページはまだありません。親ページを編集してノード接続を追加してください。
                          </p>
                        ) : (
                          <div className="relative pl-5">
                            <div className="absolute left-1 top-1 bottom-1 w-px bg-emerald-200" />
                            {group.pages.map((page) => (
                              <div key={page.id} className="relative mb-2 pl-4 last:mb-0">
                                <span className="absolute left-0 top-4 h-px w-3 bg-emerald-300" />
                                <span className="absolute -left-[4px] top-[13px] h-2 w-2 rounded-full bg-emerald-400" />
                                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                                  <div className="min-w-0">
                                    <p className="truncate text-sm text-slate-900">{page.title}</p>
                                    <p className="text-xs text-slate-500">最終更新: {formatDate(page.updatedAt)}</p>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className={`rounded-full px-2 py-0.5 text-[11px] ${page.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                                      {page.status === "published" ? "公開中" : "下書き"}
                                    </span>
                                    <Link
                                      href={`/editor/${page.id}`}
                                      onClick={(event) => event.stopPropagation()}
                                      className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                                    >
                                      編集
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        void onDeleteInformation(page);
                                      }}
                                      disabled={pendingDeleteIds.has(page.id)}
                                      className="rounded-md border border-rose-300 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                                    >
                                      {pendingDeleteIds.has(page.id) ? "保留中..." : "削除"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </article>
              <article className="rounded-2xl lux-section-card border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">単体ページ（未グループ）</h2>
                  <p className="text-xs text-slate-500">ファイルに所属していないページ</p>
                </div>
                <div className="space-y-3">
                  {filteredStandaloneProjectItems.length === 0 && (
                    <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                      該当する単体ページはありません。
                    </p>
                  )}
                  {filteredStandaloneProjectItems.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-xl border border-slate-200 p-4 transition hover:-translate-y-[1px] hover:shadow-sm cursor-pointer"
                      onClick={() => router.push(`/editor/${item.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          router.push(`/editor/${item.id}`);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${item.title} を編集`}
                    >
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">最終更新: {formatDate(item.updatedAt)}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] ${item.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                          {item.status === "published" ? "公開中" : "下書き"}
                        </span>
                        <Link
                          href={`/editor/${item.id}`}
                          onClick={(event) => event.stopPropagation()}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50"
                        >
                          編集
                        </Link>
                        <a
                          href={buildPublicUrl(item.slug)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50"
                        >
                          QR / 公開ページ
                        </a>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            void onDeleteInformation(item);
                          }}
                          disabled={pendingDeleteIds.has(item.id)}
                          className="rounded-md border border-rose-300 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                        >
                          {pendingDeleteIds.has(item.id) ? "保留中..." : "削除"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </article>
            </section>
          ) : activeTab === "ops" && canAccessOps ? (
            <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <article className="rounded-2xl lux-section-card border border-emerald-200/70 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">運用センター</h2>
                  <button
                    type="button"
                    onClick={() => void refreshOpsHealth()}
                    disabled={loadingOpsHealth}
                    className="rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs text-emerald-800 hover:bg-emerald-50 disabled:opacity-60"
                  >
                    {loadingOpsHealth ? "更新中..." : "状態更新"}
                  </button>
                </div>
                <p className="mt-1 text-sm text-slate-600">障害の復旧・課金同期・環境確認をここで実行できます。</p>
                <div className="mt-3 rounded-lg border border-emerald-200/70 bg-emerald-50/40 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-emerald-900">運用インパクト（推定）</p>
                    <button
                      type="button"
                      onClick={() => void onStartStripeCheckout()}
                      disabled={creatingCheckout || isProActive}
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                    >
                      {isProActive ? "現在Proプランです" : creatingCheckout ? "遷移中..." : "Proにアップグレード"}
                    </button>
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">推定更新回数 / 月</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{estimatedMonthlyEdits}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">推定削減時間 / 月</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{estimatedSavedHoursPerMonth}h</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">QR導線比率（7日）</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{qrShare7d}%</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    Pro適合シグナル: {proFitSignals}/3（公開枠・複数ページ運用・閲覧規模）
                  </p>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                    <p className="font-medium text-slate-700">環境設定</p>
                    <p className="mt-1">Public Env: {opsHealth?.env.supabasePublic ? "OK" : "NG"}</p>
                    <p>Service Env: {opsHealth?.env.supabaseService ? "OK" : "NG"}</p>
                    <p>Stripe Key: {opsHealth?.env.stripeSecret ? "OK" : "NG"}</p>
                    <p>Webhook Secret: {opsHealth?.env.stripeWebhook ? "OK" : "NG"}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                    <p className="font-medium text-slate-700">課金反映</p>
                    <p className="mt-1">Plan: {opsHealth?.billing.plan ?? "-"}</p>
                    <p>Status: {opsHealth?.billing.status ?? "-"}</p>
                    <p>Stripe Customer: {opsHealth?.billing.hasStripeCustomer ? "あり" : "なし"}</p>
                    <p>最終同期: {opsHealth?.billing.lastSyncAt ? formatDate(opsHealth.billing.lastSyncAt) : "未設定"}</p>
                    <p>Webhook最終受信: {opsHealth?.billing.webhookLastReceivedAt ? formatDate(opsHealth.billing.webhookLastReceivedAt) : "未受信"}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-emerald-200/70 bg-emerald-50/50 p-3">
                  <p className="text-xs font-semibold text-emerald-900">課金CVR（直近7日）</p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <p className="font-medium text-slate-500">指標</p>
                    <p className="font-medium text-slate-500">件数</p>
                    <p className="font-medium text-slate-500">率</p>
                    <p>アップグレードクリック</p>
                    <p>{opsHealth?.billing.funnel7d.upgradeClicks ?? 0}</p>
                    <p>-</p>
                    <p>Checkout到達</p>
                    <p>{opsHealth?.billing.funnel7d.checkoutSessions ?? 0}</p>
                    <p>{opsHealth?.billing.funnel7d.clickToCheckoutRate ?? 0}%</p>
                    <p>Checkout完了</p>
                    <p>{opsHealth?.billing.funnel7d.completedCheckouts ?? 0}</p>
                    <p>{opsHealth?.billing.funnel7d.checkoutToPaidRate ?? 0}%</p>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-sm text-slate-700">{opsHealth?.billing.message ?? "データ取得中..."}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void onRunRecovery("ensure_scope")}
                      disabled={recoveringAction !== null}
                      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-60"
                    >
                      {recoveringAction === "ensure_scope" ? "実行中..." : "施設所属を再同期"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void onRunRecovery("sync_subscription")}
                      disabled={recoveringAction !== null}
                      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-60"
                    >
                      {recoveringAction === "sync_subscription" ? "実行中..." : "Stripeを手動同期"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void onRunOpsAlertTest()}
                      disabled={sendingOpsTest}
                      className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"
                    >
                      {sendingOpsTest ? "送信中..." : "通知テスト送信"}
                    </button>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-700">本番前チェック</p>
                  <div className="mt-2 grid gap-1 text-xs text-slate-600 sm:grid-cols-2">
                    <p>Public/Service Env 設定</p>
                    <p>{opsHealth?.env.supabasePublic && opsHealth?.env.supabaseService ? "OK" : "NG"}</p>
                    <p>Stripe Key / Price / Webhook</p>
                    <p>{opsHealth?.env.stripeSecret && opsHealth?.env.stripePrice && opsHealth?.env.stripeWebhook ? "OK" : "NG"}</p>
                    <p>Webhook受信履歴</p>
                    <p>{opsHealth?.billing.webhookLastReceivedAt ? "OK" : "未確認"}</p>
                    <p>課金反映ステータス</p>
                    <p>{opsHealth?.billing.ok ? "OK" : "要確認"}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                  <p className="text-sm font-medium text-emerald-900">初回3分導線</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => void onCreate(0)}
                      className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-left text-xs hover:bg-emerald-50"
                    >
                      1. テンプレから作成
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("project")}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs hover:bg-slate-50"
                    >
                      2. 編集して下書き
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("dashboard")}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs hover:bg-slate-50"
                    >
                      3. 公開とQR確認
                    </button>
                  </div>
                </div>
              </article>

              <article className="rounded-2xl lux-section-card border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">エラー履歴（時系列）</h2>
                  <div className="flex flex-wrap gap-1">
                    {([
                      ["all", "すべて"],
                      ["webhook", "Webhook"],
                      ["checkout", "Checkout"],
                      ["portal", "Portal"],
                    ] as Array<[OpsActionFilter, string]>).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setOpsActionFilter(value)}
                        className={`rounded-md border px-2 py-1 text-xs ${
                          opsActionFilter === value
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                            : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-600">課金・復旧に関する失敗イベントを新しい順で表示します。</p>
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-700">導入テスト（3〜5施設）チェック</p>
                  <div className="mt-2 space-y-1 text-xs text-slate-600">
                    <p>1. 初回ログインから公開まで 3分以内に完了できるか</p>
                    <p>2. Pro導線クリック率（目安: 20%以上）</p>
                    <p>3. 決済完了後にプラン反映が 1分以内か</p>
                    <p>4. 障害時に運用センターから復旧できるか</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {opsErrorTimeline.length === 0 && (
                    <p className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
                      現在、エラー履歴はありません。
                    </p>
                  )}
                  {opsErrorTimeline.slice(0, 20).map((log) => (
                    <div key={log.id} className="rounded-lg border border-rose-200 bg-rose-50/40 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium text-rose-800">{log.action}</p>
                        <p className="shrink-0 text-xs text-slate-500">{formatDate(log.createdAt)}</p>
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{log.message}</p>
                    </div>
                  ))}
                </div>

                <h3 className="mt-5 text-sm font-semibold text-slate-800">課金イベント（最新20件）</h3>
                <div className="mt-2 max-h-[420px] space-y-2 overflow-y-auto pr-1">
                  {opsTimeline.slice(0, 20).map((log) => (
                    <div key={`${log.id}-timeline`} className="rounded-lg border border-slate-200 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium text-slate-700">{log.action}</p>
                        <p className="shrink-0 text-xs text-slate-500">{formatDate(log.createdAt)}</p>
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{log.message}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          ) : (
            <section className="grid gap-3 lg:h-[calc(100vh-430px)] lg:grid-cols-[1.05fr_0.95fr] lg:overflow-hidden lg:pb-4">
                <article className="min-w-0 rounded-2xl lux-section-card border border-slate-200/80 bg-white p-3 shadow-sm lg:h-full lg:overflow-y-auto lg:pb-4">
                  <h2 className="text-lg font-semibold">契約・請求</h2>
                  <p className="mt-1 text-sm text-slate-600">プラン変更とStripeアップグレードの導線です。</p>
                  <div className="mt-4 grid gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-500">現在プラン</p>
                      <p className="mt-1 font-medium text-slate-900">{subscription?.plan ?? "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">支払い状態</p>
                      <p className="mt-1 font-medium text-slate-900">
                        {subscription ? getStatusLabel(subscription.status) : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">次回更新日</p>
                      <p className="mt-1 font-medium text-slate-900">{nextRenewalLabel}</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>公開枠の使用状況</span>
                      <span>
                        {published.length} / {publishedLimit}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${
                          isLimitReached ? "bg-rose-500" : isNearLimit ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-600">
                      残り公開可能件数: {remainingPublishSlots} 件
                    </p>
                    {isNearLimit && (
                      <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800">
                        公開上限が近づいています。必要ならProプランをご検討ください。
                      </p>
                    )}
                    {isLimitReached && (
                      <p className="mt-2 rounded-md bg-rose-50 px-2 py-1 text-xs text-rose-800">
                        公開上限に到達しています。新規公開にはプラン変更が必要です。
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap items-end gap-2">
                    <div>
                      <label className="mb-1 block text-xs text-slate-600">プラン</label>
                      <select
                        value={planDraft}
                        onChange={(e) => setPlanDraft(e.target.value as SubscriptionPlan)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      >
                        <option value="free">free</option>
                        <option value="pro">pro</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-slate-600">ステータス</label>
                      <select
                        value={statusDraft}
                        onChange={(e) => setStatusDraft(e.target.value as SubscriptionStatus)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      >
                        <option value="active">active</option>
                        <option value="trialing">trialing</option>
                        <option value="past_due">past_due</option>
                        <option value="canceled">canceled</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      disabled={savingSubscription}
                      onClick={onSaveSubscription}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
                    >
                      {savingSubscription ? "保存中..." : "プラン設定を保存"}
                    </button>
                    <button
                      type="button"
                      disabled={primaryBillingCtaDisabled}
                      onClick={isProActive ? onOpenBillingPortal : onStartStripeCheckout}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                    >
                      {primaryBillingCtaLoading ? "遷移中..." : primaryBillingCtaLabel}
                    </button>
                    <button
                      type="button"
                      disabled={openingPortal || !subscription?.hasStripeCustomer}
                      onClick={onOpenBillingPortal}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
                    >
                      {openingPortal ? "遷移中..." : "請求書・カード管理"}
                    </button>
                  </div>
                  {!subscription?.hasStripeCustomer && (
                    <p className="mt-3 text-xs text-slate-500">
                      請求書・カード管理は、初回アップグレード後に利用できます。
                    </p>
                  )}
                </article>

                <div className="min-w-0 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-1 lg:pb-4">
                  <article className="min-w-0 rounded-2xl lux-section-card border border-slate-200/80 bg-white p-4 shadow-sm">
                    <h2 className="text-lg font-semibold">閲覧分析（直近7日）</h2>
                    {loadingMetrics && (
                      <div className="mt-2 animate-pulse space-y-2">
                        <div className="h-4 w-44 rounded bg-slate-200" />
                      </div>
                    )}
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">総閲覧数（7日）</p>
                        <p className="mt-1 text-xl font-semibold text-slate-900">
                          {viewMetrics?.totalViews7d ?? 0}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          QR経由: {viewMetrics?.qrViews7d ?? 0}
                        </p>
                      </div>
                      <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">本日の閲覧数</p>
                        <p className="mt-1 text-xl font-semibold text-slate-900">
                          {viewMetrics?.totalViewsToday ?? 0}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          QR経由: {viewMetrics?.qrViewsToday ?? 0}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Top Pages</p>
                      {viewMetrics?.topPages.length ? (
                        <div className="max-h-36 space-y-2 overflow-y-auto pr-1">
                          {viewMetrics.topPages.map((page) => (
                            <div
                              key={page.informationId}
                              className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                            >
                              <p className="truncate pr-3 text-sm text-slate-800">{page.title}</p>
                              <p className="shrink-0 text-xs text-slate-600">
                                {page.views} view / QR {page.qrViews}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
                          まだ閲覧データがありません。
                        </p>
                      )}
                    </div>
                  </article>

                  <article className="min-w-0 rounded-2xl lux-section-card border border-slate-200/80 bg-white p-4 shadow-sm">
                    <div>
                      <h2 className="text-lg font-semibold">監査ログ</h2>
                      <p className="mt-1 text-sm text-slate-600">
                        主要操作の履歴です（最新10件）。
                      </p>
                    </div>
                    {opsHealth && opsHealth.recentBillingLogs.length > 0 && (
                      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2">
                        <p className="text-xs font-medium text-slate-700">課金イベント（最新）</p>
                        <div className="mt-1 space-y-1">
                          {opsHealth.recentBillingLogs.slice(0, 3).map((log) => (
                            <p key={log.id} className="truncate text-[11px] text-slate-600">
                              {formatAuditDate(log.created_at)} {log.message}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                    {loadingAuditLogs && (
                      <div className="mt-2 animate-pulse space-y-2">
                        <div className="h-4 w-36 rounded bg-slate-200" />
                      </div>
                    )}
                    <div className="mt-3 space-y-2">
                      {auditLogs.length === 0 && (
                        <p className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
                          まだ監査ログはありません。
                        </p>
                      )}
                      {auditLogs.slice(0, 10).map((log) => (
                        <div key={log.id} className="min-w-0 rounded-lg border border-slate-200 px-3 py-2">
                          <div className="flex min-w-0 items-center justify-between gap-3">
                            <p className="min-w-0 flex-1 truncate text-sm text-slate-800">{log.message}</p>
                            <p className="shrink-0 text-right text-sm text-slate-500">
                              {formatAuditDate(log.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                </div>
            </section>
          )}
            </div>
          </div>
        </div>
      </main>
    </AuthGate>
  );
}
