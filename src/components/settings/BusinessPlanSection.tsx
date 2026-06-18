"use client";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  buildOptimisticAppleIapResult,
  requestAppleStorePurchase,
  restoreAppleSubscriptions,
  syncApplePurchaseAfterNative,
  syncAppleSubscriptionToAccount,
  type VerifyAppleIapResult,
} from "@/lib/apple-iap-client";
import { mergeAppleIapResultIntoSubscription } from "@/lib/merge-apple-iap-subscription";
import { shouldUseAppleIapBilling } from "@/lib/app-store-compliance";
import { isNativeIapAvailable } from "@/lib/native-iap";
import { isLoginRequiredMessage } from "@/lib/billing-auth";
import {
  WEB_BILLING_CHANGE_ALERT,
  WEB_BILLING_PRO_UPGRADE_ALERT,
  WEB_BILLING_PRO_UPGRADE_HINT,
} from "@/lib/external-billing-messages";
import {
  createStripeCheckoutSession,
  createStripePortalSession,
  getCurrentHotelSubscription,
  getCurrentUserHotelRole,
  isDevBusinessOverrideActiveForCurrentUser,
  syncStripeSubscriptionFromServer,
  type HotelSubscription,
} from "@/lib/storage";
import { AppSettingsCard } from "@/components/app-shell/AppSettingsCard";
import { AppSegmentedControl } from "@/components/app-shell/primitives/AppSegmentedControl";
import { openAppleSubscriptionManagement, openWebBillingManagement } from "@/lib/app-billing-nav";
import { AppPlanBillingPanel } from "@/components/app-shell/views/AppPlanBillingPanel";
import { AppPlanTiers } from "@/components/app-shell/views/AppPlanTiers";
import { billingIntervalLabel } from "@/lib/billing-interval";
import type { AppleIapInterval } from "@/lib/apple-iap-products";
import { PLAN_ANNUAL_SAVINGS_LABEL, PLAN_PRICE_DISPLAY } from "@/lib/plan-pricing";

const EXTERNAL_PAYMENT_CONFIRM =
  "決済ページ（別ページ）に遷移しますがよろしいですか？";

async function reloadSubscriptionWithRetry(
  load: () => Promise<HotelSubscription | null>,
  expectPlan: VerifyAppleIapResult["plan"],
): Promise<void> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (attempt > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, 600 * attempt));
    }
    const sub = await load();
    if (sub?.plan === expectPlan) return;
  }
}

function resolveOptimisticPlan(
  result: VerifyAppleIapResult,
  targetPlan: VerifyAppleIapResult["plan"],
): VerifyAppleIapResult["plan"] {
  const rank = (value: VerifyAppleIapResult["plan"]) =>
    value === "business" ? 2 : value === "pro" ? 1 : 0;
  return rank(result.plan) >= rank(targetPlan) ? result.plan : targetPlan;
}

type BusinessPlanSectionProps = {
  successPath?: string;
  cancelPath?: string;
  /** Native app shell: stacked tiers, full-width CTAs, shimmer accents */
  layout?: "default" | "app";
};

/**
 * Businessプランの特典を設定画面に表示（未加入にはアップグレード案内）
 */
export function BusinessPlanSection({
  successPath = "/dashboard?billing=success",
  cancelPath = "/settings",
  layout = "default",
}: BusinessPlanSectionProps = {}) {
  const isAppLayout = layout === "app";
  const [subscription, setSubscription] = useState<HotelSubscription | null | undefined>(undefined);
  const [busyAction, setBusyAction] = useState<"pro" | "business" | "portal" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [canManageBilling, setCanManageBilling] = useState(false);
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [nativeIapReady, setNativeIapReady] = useState(false);
  const [billingInterval, setBillingInterval] = useState<AppleIapInterval>("monthly");
  const [planSyncing, setPlanSyncing] = useState(false);
  const didAutoSyncRef = useRef(false);

  const appStoreOnly = isAppLayout;
  const useIosIap = appStoreOnly || (shouldUseAppleIapBilling() && nativeIapReady);

  useEffect(() => {
    setNativeIapReady(isNativeIapAvailable());
  }, []);

  const plan = subscription?.plan ?? "free";
  const billingProvider = subscription?.billingProvider ?? null;
  const isAppleBilling = billingProvider === "apple" || Boolean(subscription?.hasAppleSubscription);
  const isStripeBilling =
    billingProvider === "stripe" || Boolean(subscription?.hasStripeCustomer && billingProvider !== "apple");
  const status = subscription?.status ?? null;
  const currentPeriodEnd = subscription?.currentPeriodEnd ?? null;
  const cancelAtPeriodEnd = subscription?.cancelAtPeriodEnd ?? false;
  const cancelAt = subscription?.cancelAt ?? null;
  const isPaid = plan === "pro" || plan === "business";
  const activeBillingInterval = subscription?.billingInterval ?? null;
  const isActiveLike = status === "active" || status === "trialing";
  const hasActiveWebBilling = isStripeBilling && isPaid && isActiveLike;
  const formatDateYmd = (value: string | null): string | null => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(
      date.getDate(),
    ).padStart(2, "0")}`;
  };
  const currentPeriodEndLabel = formatDateYmd(currentPeriodEnd);
  const cancelAtLabel = formatDateYmd(cancelAt);
  const hasFuturePeriodEnd = (() => {
    if (!currentPeriodEnd) return false;
    const end = new Date(currentPeriodEnd).getTime();
    return Number.isFinite(end) && end > Date.now();
  })();

  const load = useCallback(async (): Promise<HotelSubscription | null> => {
    try {
      const role = await getCurrentUserHotelRole();
      setCanManageBilling(role === "owner");
      let sub = await getCurrentHotelSubscription();
      const devOverride = await isDevBusinessOverrideActiveForCurrentUser();
      const stripeManaged =
        !devOverride &&
        (Boolean(sub?.hasStripeCustomer) || sub?.billingProvider === "stripe");
      if (role === "owner" && stripeManaged) {
        try {
          await syncStripeSubscriptionFromServer();
        } catch {
          /* best-effort: show cached subscription if sync fails */
        }
      }
      sub = await getCurrentHotelSubscription();
      setSubscription(sub);
      return sub;
    } catch {
      setSubscription(null);
      setCanManageBilling(false);
      return null;
    } finally {
      setRoleLoaded(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!isAppLayout || typeof document === "undefined") return;
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void load();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [isAppLayout, load]);

  const syncPlanFromApple = useCallback(async () => {
    if (!canManageBilling) return;
    if (await isDevBusinessOverrideActiveForCurrentUser()) return;
    setPlanSyncing(true);
    try {
      if (isNativeIapAvailable()) {
        try {
          await syncAppleSubscriptionToAccount();
        } catch {
          await restoreAppleSubscriptions();
        }
      } else {
        await syncAppleSubscriptionToAccount();
      }
      await load();
    } catch {
      /* auto-sync is best-effort */
    } finally {
      setPlanSyncing(false);
    }
  }, [canManageBilling, load]);

  useEffect(() => {
    if (didAutoSyncRef.current) return;
    if (!roleLoaded || !canManageBilling || subscription === undefined) return;
    if (!appStoreOnly && !(useIosIap && nativeIapReady)) return;
    didAutoSyncRef.current = true;
    if (isStripeBilling || subscription?.hasStripeCustomer) return;
    void syncPlanFromApple();
  }, [
    appStoreOnly,
    canManageBilling,
    isStripeBilling,
    nativeIapReady,
    roleLoaded,
    subscription,
    syncPlanFromApple,
    useIosIap,
  ]);

  const confirmExternalPayment = useCallback((): boolean => {
    return window.confirm(EXTERNAL_PAYMENT_CONFIRM);
  }, []);

  const openApplePurchase = useCallback(
    async (targetPlan: "pro" | "business", intervalOverride?: AppleIapInterval) => {
      if (!canManageBilling) {
        setMessage("課金操作はオーナーのみ可能です。オーナーに依頼してください。");
        return;
      }
      if (hasActiveWebBilling) {
        const alertMessage =
          plan === "pro" && targetPlan === "business"
            ? WEB_BILLING_PRO_UPGRADE_ALERT
            : WEB_BILLING_CHANGE_ALERT;
        window.alert(alertMessage);
        if (appStoreOnly) {
          openWebBillingManagement();
        }
        return;
      }
      const interval = intervalOverride ?? billingInterval;
      setMessage(null);
      setBusyAction(targetPlan);
      try {
        const purchase = await requestAppleStorePurchase(targetPlan, interval);
        const optimistic = buildOptimisticAppleIapResult(purchase, targetPlan);
        const optimisticPlan = resolveOptimisticPlan(optimistic, targetPlan);
        setSubscription((current) =>
          mergeAppleIapResultIntoSubscription(current, { ...optimistic, plan: optimisticPlan }),
        );
        setBusyAction(null);

        const planLabel =
          optimisticPlan === "business" ? "Business" : optimisticPlan === "pro" ? "Pro" : "Free";
        const intervalLabel = interval === "yearly" ? "年払い" : "月払い";
        setMessage(`App Store でのお申し込みが完了しました。（${planLabel}プラン・${intervalLabel}）`);

        void (async () => {
          try {
            const synced = await syncApplePurchaseAfterNative(purchase, targetPlan);
            const finalPlan = resolveOptimisticPlan(synced, targetPlan);
            setSubscription((current) =>
              mergeAppleIapResultIntoSubscription(current, { ...synced, plan: finalPlan }),
            );
            await reloadSubscriptionWithRetry(load, finalPlan);
          } catch {
            await reloadSubscriptionWithRetry(load, optimisticPlan);
          }
        })();
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (!msg.includes("キャンセル")) {
          setMessage(msg || "App Store 課金に失敗しました。");
        }
      } finally {
        setBusyAction(null);
      }
    },
    [appStoreOnly, billingInterval, canManageBilling, hasActiveWebBilling, load, plan],
  );

  const openCheckout = useCallback(async (targetPlan: "pro" | "business") => {
    if (!canManageBilling) {
      setMessage("課金操作はオーナーのみ可能です。オーナーに依頼してください。");
      return;
    }
    if (useIosIap) {
      await openApplePurchase(targetPlan);
      return;
    }
    if (!confirmExternalPayment()) return;
    setMessage(null);
    setBusyAction(targetPlan);
    try {
      const url = await createStripeCheckoutSession({
        plan: targetPlan,
        interval: billingInterval,
        successPath,
        cancelPath,
      });
      window.location.href = url;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (isLoginRequiredMessage(msg)) {
        window.location.href = `/login?next=${encodeURIComponent(cancelPath)}`;
        return;
      }
      setMessage(msg || "決済ページの起動に失敗しました。");
      setBusyAction(null);
    }
  }, [billingInterval, canManageBilling, cancelPath, confirmExternalPayment, openApplePurchase, successPath, useIosIap]);

  const openPortal = useCallback(async () => {
    if (!canManageBilling) {
      setMessage("課金操作はオーナーのみ可能です。オーナーに依頼してください。");
      return;
    }
    if (appStoreOnly && hasActiveWebBilling) {
      openWebBillingManagement();
      return;
    }
    if (useIosIap && (isAppleBilling || appStoreOnly)) {
      openAppleSubscriptionManagement();
      return;
    }
    if (!confirmExternalPayment()) return;
    setMessage(null);
    setBusyAction("portal");
    try {
      const url = await createStripePortalSession();
      window.location.href = url;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (isLoginRequiredMessage(msg)) {
        window.location.href = "/login?ref=lp-saas&next=%2Fsettings";
        return;
      }
      if (msg.includes("Stripe顧客情報")) {
        setMessage("契約情報の同期中です。しばらくしてから再度お試しください。");
      } else {
        setMessage(msg || "サブスクリプション管理ページの起動に失敗しました。");
      }
      setBusyAction(null);
    }
  }, [appStoreOnly, canManageBilling, confirmExternalPayment, hasActiveWebBilling, isAppleBilling, useIosIap]);

  const openSwitchToAnnual = useCallback(async () => {
    if (plan !== "pro" && plan !== "business") return;
    if (!canManageBilling) {
      setMessage("課金操作はオーナーのみ可能です。オーナーに依頼してください。");
      return;
    }
    if (activeBillingInterval === "yearly") return;

    if (useIosIap && (isAppleBilling || appStoreOnly)) {
      await openApplePurchase(plan, "yearly");
      return;
    }

    if (hasActiveWebBilling) {
      if (appStoreOnly) {
        openWebBillingManagement();
        return;
      }
      if (!confirmExternalPayment()) return;
      setMessage(null);
      setBusyAction("portal");
      try {
        const url = await createStripePortalSession();
        window.location.href = url;
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "請求ポータルの起動に失敗しました。");
        setBusyAction(null);
      }
      return;
    }

    setMessage("お支払い周期の変更は、ご契約中の決済方法から行ってください。");
  }, [
    activeBillingInterval,
    appStoreOnly,
    canManageBilling,
    confirmExternalPayment,
    isAppleBilling,
    hasActiveWebBilling,
    openApplePurchase,
    plan,
    useIosIap,
  ]);

  const scheduledCancel = Boolean(cancelAtPeriodEnd && status !== "canceled");
  const statusLabel =
    status === "active"
      ? scheduledCancel
        ? "解約予約中"
        : "加入中"
      : status === "trialing"
        ? "トライアル中"
        : status === "past_due"
          ? "要お支払い確認"
          : status === "canceled"
            ? "解約済み"
            : null;
  const periodLabel = (() => {
    if (status === "canceled" && currentPeriodEndLabel && hasFuturePeriodEnd) {
      return `${currentPeriodEndLabel}まで有効`;
    }
    if (scheduledCancel && (cancelAtLabel || currentPeriodEndLabel)) {
      return `${cancelAtLabel ?? currentPeriodEndLabel}まで有効`;
    }
    return currentPeriodEndLabel;
  })();
  const showNextRenewal = Boolean(
    isPaid && status !== "canceled" && currentPeriodEndLabel && hasFuturePeriodEnd
  );
  const showValidUntil = Boolean(
    isPaid &&
      periodLabel &&
      hasFuturePeriodEnd &&
      (status === "canceled" || scheduledCancel || !showNextRenewal)
  );

  if (subscription === undefined || !roleLoaded) {
    if (isAppLayout) {
      return <div className="app-shell-skeleton h-40 rounded-2xl" aria-hidden />;
    }
    return (
      <AppSettingsCard>
        <div className="h-20 animate-pulse rounded-lg bg-slate-100" aria-hidden />
      </AppSettingsCard>
    );
  }

  // 招待ユーザーには課金情報（料金表・請求導線）を表示しない
  if (!canManageBilling) {
    return null;
  }

  const tierClass = (active: boolean, selectable = false) =>
    `app-plan-tier rounded-2xl border px-4 py-4 ${active ? "app-plan-tier--current" : "border-slate-200 bg-white"}${
      selectable ? " ui-pop-tap cursor-pointer transition active:scale-[0.98]" : ""
    }`;

  const tierSelectProps = (onSelect?: () => void) => {
    if (!onSelect) return {};
    return {
      role: "button" as const,
      tabIndex: 0,
      onClick: onSelect,
      onKeyDown: (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      },
    };
  };

  const selectProTier = plan === "free" ? () => void openCheckout("pro") : undefined;
  const selectBusinessTier =
    plan === "free"
      ? () => void openCheckout("business")
      : plan === "pro" && useIosIap && isAppleBilling
        ? () => void openApplePurchase("business")
        : plan === "pro" && !appStoreOnly && !(useIosIap && isAppleBilling)
          ? () => void openPortal()
          : undefined;

  const billingIntervalToggle =
    useIosIap ? (
      <AppSegmentedControl
        options={[
          { id: "monthly", label: "月払い" },
          { id: "yearly", label: `年払い（${PLAN_ANNUAL_SAVINGS_LABEL}）` },
        ]}
        value={billingInterval}
        onChange={(id) => setBillingInterval(id as AppleIapInterval)}
        ariaLabel="お支払い周期"
        className={isAppLayout ? "mb-3" : "mt-3"}
      />
    ) : null;

  const currentPlanLabel = plan === "free" ? "Free" : plan === "pro" ? "Pro" : "Business";
  const currentPlanPrice =
    plan === "free"
      ? "¥0"
      : activeBillingInterval === "yearly"
        ? plan === "pro"
          ? `${PLAN_PRICE_DISPLAY.pro.annual}/年`
          : `${PLAN_PRICE_DISPLAY.business.annual}/年`
        : plan === "pro"
          ? PLAN_PRICE_DISPLAY.pro.monthlyPerMonth
          : PLAN_PRICE_DISPLAY.business.monthlyPerMonth;

  if (isAppLayout) {
    return (
      <div className="app-plan-native">
        <div className="app-plan-hero">
          <p className="app-plan-hero-kicker">現在のプラン</p>
          <div className="app-plan-hero-main">
            <p className="app-plan-hero-name">{currentPlanLabel}</p>
            <p className="app-plan-hero-price">{currentPlanPrice}</p>
          </div>
          {(statusLabel || showNextRenewal || showValidUntil || activeBillingInterval || planSyncing) && (
            <div className="app-plan-hero-meta">
              {planSyncing && !isStripeBilling ? <span>App Store と同期中…</span> : null}
              {(!planSyncing || isStripeBilling) && statusLabel ? <span>{statusLabel}</span> : null}
              {(!planSyncing || isStripeBilling) && activeBillingInterval ? (
                <span>{billingIntervalLabel(activeBillingInterval)}</span>
              ) : null}
              {(!planSyncing || isStripeBilling) && showNextRenewal ? (
                <span>次回更新 {currentPeriodEndLabel}</span>
              ) : null}
              {(!planSyncing || isStripeBilling) && showValidUntil && !showNextRenewal ? (
                <span>有効期限 {periodLabel}</span>
              ) : null}
            </div>
          )}
        </div>

        <AppPlanBillingPanel
          plan={plan}
          isPaid={isPaid}
          isAppleBilling={isAppleBilling}
          isStripeBilling={isStripeBilling}
          billingInterval={billingInterval}
          activeBillingInterval={activeBillingInterval}
          billingIntervalToggle={billingIntervalToggle}
          busyAction={busyAction}
          canManageBilling={canManageBilling}
          onSubscribePro={() => void openCheckout("pro")}
          onSubscribeBusiness={() => void openCheckout("business")}
          onUpgradeBusiness={() => {
            if (hasActiveWebBilling && plan === "pro") {
              window.alert(WEB_BILLING_PRO_UPGRADE_ALERT);
              openWebBillingManagement();
              return;
            }
            if (useIosIap && isAppleBilling && !hasActiveWebBilling) {
              void openApplePurchase("business");
              return;
            }
            openWebBillingManagement();
          }}
          onSwitchToAnnual={() => void openSwitchToAnnual()}
          onManageExternalBilling={() => openWebBillingManagement()}
          nextRenewalLabel={showNextRenewal ? currentPeriodEndLabel : null}
          message={message}
        />
      </div>
    );
  }

  return (
    <AppSettingsCard className={isAppLayout ? "app-plan-section" : ""}>
      <div className={isAppLayout ? "" : "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"}>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900">{isAppLayout ? "プラン" : "プランと請求"}</h2>
          {isAppLayout ? null : (
            <p className="app-settings-card-desc mt-1 text-sm leading-relaxed text-slate-600">
              多言語翻訳の自動補助、分析の CSV ダウンロード、公開ページ数の拡張など、運用が大きくなった施設向けのプランです。
            </p>
          )}
        </div>
      </div>
      {appStoreOnly ? (
        <p className="mt-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2.5 text-sm leading-relaxed text-[var(--app-text-muted)]">
          お申し込みは App Store 経由です。同じ Infomii アカウントでログインすれば、プランは端末を問わず共有されます。
        </p>
      ) : useIosIap ? (
        <p className="mt-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2.5 text-sm leading-relaxed text-[var(--app-text-muted)]">
          iOS アプリからのお申し込みは App Store 経由で行います。
        </p>
      ) : null}
      {hasActiveWebBilling && !appStoreOnly ? (
        <p
          className={
            isAppLayout
              ? "mt-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2.5 text-sm leading-relaxed text-[var(--app-text-muted)]"
              : "mt-3 text-sm leading-relaxed text-slate-600"
          }
        >
          Web でお申し込みのご契約です。変更・解約はこの画面から行えます。
        </p>
      ) : null}
      <div
        className={
          isAppLayout
            ? "app-plan-actions mt-4 flex flex-col gap-2.5"
            : "app-settings-billing-actions mt-4 flex flex-col items-start gap-3"
        }
      >
        {plan === "free" ? billingIntervalToggle : null}
        {isPaid && activeBillingInterval ? (
          <p className="text-sm text-slate-600">
            現在のお支払い周期: <span className="font-medium">{billingIntervalLabel(activeBillingInterval)}</span>
          </p>
        ) : null}
        {isPaid && activeBillingInterval !== "yearly" ? (
          <button
            type="button"
            onClick={() => void openSwitchToAnnual()}
            disabled={busyAction !== null || !canManageBilling}
            className="app-button-native app-plan-cta-secondary ui-pop-tap inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busyAction === plan
              ? "処理中…"
              : plan === "pro"
                ? `Pro を年払いに切り替える（${PLAN_PRICE_DISPLAY.pro.annual}・${PLAN_ANNUAL_SAVINGS_LABEL}）`
                : `Business を年払いに切り替える（${PLAN_PRICE_DISPLAY.business.annual}・${PLAN_ANNUAL_SAVINGS_LABEL}）`}
          </button>
        ) : null}
        {plan === "pro" ? (
          <p className="text-sm text-slate-500">Business へのアップグレード時の周期</p>
        ) : null}
        {plan === "pro" ? billingIntervalToggle : null}
        {plan === "free" ? (
          <>
            <button
              type="button"
              onClick={() => void openCheckout("pro")}
              disabled={busyAction !== null || !canManageBilling}
              className={
                "app-button-native ui-pop-tap inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70" +
                (isAppLayout ? " app-touch-btn-primary app-plan-cta-primary w-full max-w-full" : "")
              }
            >
              {busyAction === "pro" ? "処理中…" : appStoreOnly ? "Proを申し込む" : useIosIap ? "Proを申し込む（App Store）" : "Proを申し込む"}
            </button>
            <button
              type="button"
              onClick={() => void openCheckout("business")}
              disabled={busyAction !== null || !canManageBilling}
              className={
                "app-button-native app-plan-cta-secondary ui-pop-tap inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70" +
                (isAppLayout ? " app-plan-cta-secondary w-full max-w-full" : "")
              }
            >
              {busyAction === "business" ? "処理中…" : appStoreOnly ? "Businessを申し込む" : useIosIap ? "Businessを申し込む（App Store）" : "Businessプランを申し込む"}
            </button>
          </>
        ) : null}
        {plan === "pro" ? (
          <>
            <button
              type="button"
              onClick={() =>
                useIosIap && isAppleBilling
                  ? void openApplePurchase("business")
                  : void openPortal()
              }
              disabled={busyAction !== null || !canManageBilling}
              className={
                "app-button-native ui-pop-tap inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70" +
                (isAppLayout ? " app-touch-btn-primary app-plan-cta-primary w-full max-w-full" : "")
              }
            >
              {busyAction === "portal" || busyAction === "business"
                ? "処理中…"
                : "Businessプランへアップグレード"}
            </button>
            <button
              type="button"
              onClick={() => void openPortal()}
              disabled={busyAction !== null || !canManageBilling}
              className={
                "app-button-native app-plan-cta-secondary ui-pop-tap inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70" +
                (isAppLayout ? " app-plan-cta-secondary w-full max-w-full" : "")
              }
            >
              {appStoreOnly ? "サブスクリプションを管理" : "サブスクリプションを管理 / 解約する"}
            </button>
          </>
        ) : null}
        {plan === "business" ? (
          <>
            <button
              type="button"
              onClick={() => void openPortal()}
              disabled={busyAction !== null || !canManageBilling}
              className={
                "app-button-native ui-pop-tap inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70" +
                (isAppLayout ? " app-touch-btn-primary app-plan-cta-primary w-full max-w-full" : "")
              }
            >
              {busyAction === "portal" ? "処理中…" : appStoreOnly ? "サブスクリプションを管理" : "請求情報を管理"}
            </button>
            <button
              type="button"
              onClick={() => void openPortal()}
              disabled={busyAction !== null || !canManageBilling}
              className={
                "app-button-native app-plan-cta-secondary ui-pop-tap inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70" +
                (isAppLayout ? " app-plan-cta-secondary w-full max-w-full" : "")
              }
            >
              {appStoreOnly ? "サブスクリプションを管理" : "サブスクリプションを管理 / 解約する"}
            </button>
          </>
        ) : null}
      </div>
      <div
        className={
          isAppLayout
            ? "app-plan-table mt-5"
            : "app-settings-plan-panel mt-0 rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/40 to-slate-50/60 p-5 sm:p-7"
        }
      >
        <div
          className={
            isAppLayout
              ? "app-plan-table-head flex flex-col gap-2 pb-3"
              : "flex flex-col gap-2 border-b border-emerald-100/80 pb-4 sm:flex-row sm:items-end sm:justify-between"
          }
        >
          <p
            className={
              isAppLayout
                ? "text-sm font-bold text-[var(--app-text)]"
                : "text-sm font-semibold uppercase tracking-wide text-emerald-800/90 sm:text-base"
            }
          >
            料金プラン
          </p>
          <div className="app-plan-meta flex flex-col gap-1 text-sm text-[var(--app-text-muted)]">
            {showNextRenewal ? (
              <span>
                次回更新日: <span className="font-medium text-slate-800">{currentPeriodEndLabel}</span>
              </span>
            ) : null}
            {showValidUntil ? (
              <span>
                有効期限: <span className="font-medium text-slate-800">{periodLabel}</span>
              </span>
            ) : null}
            {statusLabel ? (
              <span>
                ステータス: <span className="font-medium text-slate-800">{statusLabel}</span>
              </span>
            ) : null}
          </div>
        </div>
        <div
          className={
            isAppLayout
              ? "app-plan-tiers mt-3 flex flex-col gap-3"
              : "mx-auto mt-5 grid w-full max-w-none gap-4 sm:grid-cols-3 lg:gap-6"
          }
        >
          <div
            className={
              isAppLayout
                ? tierClass(plan === "free")
                : `rounded-xl border px-4 py-4 sm:px-5 sm:py-5 ${
                    plan === "free" ? "border-emerald-300 bg-emerald-50/70" : "border-slate-200 bg-white"
                  }`
            }
          >
            {plan === "free" ? (
              <p
                className={
                  isAppLayout
                    ? "app-plan-badge mb-2"
                    : "mb-2 inline-flex rounded-full border border-emerald-700 bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white"
                }
              >
                現在のプラン
              </p>
            ) : null}
            <p className={`text-sm font-semibold sm:text-base ${plan === "free" ? "text-emerald-700" : "text-slate-500"}`}>Free</p>
            <p className={`mt-1.5 text-xl font-semibold sm:text-2xl ${plan === "free" ? "text-emerald-900" : "text-slate-900"}`}>¥0</p>
            <ul className={`mt-3 space-y-2 text-sm leading-snug sm:text-[15px] ${plan === "free" ? "text-emerald-800" : "text-slate-600"}`}>
              <li>・3ページ公開</li>
              <li>・基本編集（PC/スマホプレビュー）</li>
              <li>・QR共有 / 下書き公開切替</li>
            </ul>
          </div>
          <div
            {...tierSelectProps(selectProTier)}
            className={
              isAppLayout
                ? tierClass(plan === "pro", Boolean(selectProTier))
                : `rounded-xl border px-4 py-4 sm:px-5 sm:py-5 ${
                    plan === "pro" ? "border-emerald-300 bg-emerald-50/70" : "border-slate-200 bg-white"
                  }${selectProTier ? " ui-pop-tap cursor-pointer" : ""}`
            }
          >
            {plan === "pro" ? (
              <p
                className={
                  isAppLayout
                    ? "app-plan-badge mb-2"
                    : "mb-2 inline-flex rounded-full border border-emerald-700 bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white"
                }
              >
                現在のプラン
              </p>
            ) : null}
            <p className={`text-sm font-semibold sm:text-base ${plan === "pro" ? "text-emerald-700" : "text-slate-500"}`}>Pro</p>
            <p className={`mt-1.5 text-xl font-semibold sm:text-2xl ${plan === "pro" ? "text-emerald-900" : "text-slate-900"}`}>
              {PLAN_PRICE_DISPLAY.pro.monthlyPerMonth}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              年払い {PLAN_PRICE_DISPLAY.pro.annual}（{PLAN_ANNUAL_SAVINGS_LABEL}）
            </p>
            <ul className={`mt-3 space-y-2 text-sm leading-snug sm:text-[15px] ${plan === "pro" ? "text-emerald-800" : "text-slate-600"}`}>
              <li>・最大10ページ公開</li>
              <li>・閲覧分析</li>
              <li>・用途別にページを分けて運用</li>
            </ul>
          </div>
          <div
            {...tierSelectProps(selectBusinessTier)}
            className={
              isAppLayout
                ? tierClass(plan === "business", Boolean(selectBusinessTier))
                : `rounded-xl border px-4 py-4 sm:px-5 sm:py-5 ${
                    plan === "business" ? "border-emerald-300 bg-emerald-50/70" : "border-slate-200 bg-white"
                  }${selectBusinessTier ? " ui-pop-tap cursor-pointer" : ""}`
            }
          >
            {plan === "business" ? (
              <p
                className={
                  isAppLayout
                    ? "app-plan-badge mb-2"
                    : "mb-2 inline-flex rounded-full border border-emerald-700 bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white"
                }
              >
                現在のプラン
              </p>
            ) : null}
            <div className="flex items-center gap-2">
              <p className={`text-sm font-semibold sm:text-base ${plan === "business" ? "text-emerald-700" : "text-slate-500"}`}>Business</p>
              <span className="ui-pop-badge inline-flex rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-sky-700">
                人気
              </span>
            </div>
            <p className={`mt-1.5 text-xl font-semibold sm:text-2xl ${plan === "business" ? "text-emerald-900" : "text-slate-900"}`}>
              {PLAN_PRICE_DISPLAY.business.monthlyPerMonth}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              年払い {PLAN_PRICE_DISPLAY.business.annual}（{PLAN_ANNUAL_SAVINGS_LABEL}）
            </p>
            <ul className={`mt-3 space-y-2 text-sm leading-snug sm:text-[15px] ${plan === "business" ? "text-emerald-800" : "text-slate-600"}`}>
              <li>・公開ページ無制限</li>
              <li>・公開時の多言語自動翻訳</li>
              <li>・チーム招待（引き継ぎしやすい）</li>
              <li>・動的ブロック</li>
            </ul>
          </div>
        </div>
      </div>
      {plan === "pro" && hasActiveWebBilling && !appStoreOnly ? (
        <p className="mt-2 text-xs text-slate-500">{WEB_BILLING_PRO_UPGRADE_HINT}</p>
      ) : null}
      {isPaid && isActiveLike && hasActiveWebBilling && !appStoreOnly ? (
        <p className="mt-2 text-xs text-slate-500">解約もこの画面の「サブスクリプションを管理」から行えます。</p>
      ) : null}
      {isPaid && isActiveLike && isAppleBilling ? (
        <p className="mt-2 text-xs text-slate-500">
          App Store のサブスクリプションは iPhone の「設定」→「Apple ID」→「サブスクリプション」から管理・解約できます。
        </p>
      ) : null}
      {message ? <p className="mt-2 text-xs text-rose-600">{message}</p> : null}
    </AppSettingsCard>
  );
}
