"use client";
import { useCallback, useEffect, useState, type KeyboardEvent } from "react";
import { purchaseAppleSubscription, restoreAppleSubscriptions } from "@/lib/apple-iap-client";
import { shouldUseAppleIapBilling } from "@/lib/app-store-compliance";
import { isNativeIapAvailable } from "@/lib/native-iap";
import { isLoginRequiredMessage } from "@/lib/billing-auth";
import {
  createStripeCheckoutSession,
  createStripePortalSession,
  getCurrentHotelSubscription,
  getCurrentUserHotelRole,
  type HotelSubscription,
} from "@/lib/storage";
import { AppSettingsCard } from "@/components/app-shell/AppSettingsCard";
import { AppSegmentedControl } from "@/components/app-shell/primitives/AppSegmentedControl";
import { openAppleSubscriptionManagement } from "@/lib/app-billing-nav";
import { AppPlanBillingPanel } from "@/components/app-shell/views/AppPlanBillingPanel";
import { AppPlanTiers } from "@/components/app-shell/views/AppPlanTiers";
import type { AppleIapInterval } from "@/lib/apple-iap-products";
import { PLAN_ANNUAL_SAVINGS_LABEL, PLAN_PRICE_DISPLAY } from "@/lib/plan-pricing";

const EXTERNAL_PAYMENT_CONFIRM =
  "決済ページ（別ページ）に遷移しますがよろしいですか？";

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
  const isActiveLike = status === "active" || status === "trialing";
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

  const load = useCallback(async () => {
    try {
      const [sub, role] = await Promise.all([getCurrentHotelSubscription(), getCurrentUserHotelRole()]);
      setSubscription(sub);
      setCanManageBilling(role === "owner");
    } catch {
      setSubscription(null);
      setCanManageBilling(false);
    } finally {
      setRoleLoaded(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const confirmExternalPayment = useCallback((): boolean => {
    return window.confirm(EXTERNAL_PAYMENT_CONFIRM);
  }, []);

  const openApplePurchase = useCallback(async (targetPlan: "pro" | "business") => {
    if (!canManageBilling) {
      setMessage("課金操作はオーナーのみ可能です。オーナーに依頼してください。");
      return;
    }
    setMessage(null);
    setBusyAction(targetPlan);
    try {
      await purchaseAppleSubscription(targetPlan, billingInterval);
      await load();
      setMessage("App Store でのお申し込みが完了しました。");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (!msg.includes("キャンセル")) {
        setMessage(msg || "App Store 課金に失敗しました。");
      }
    } finally {
      setBusyAction(null);
    }
  }, [billingInterval, canManageBilling, load]);

  const openAppleRestore = useCallback(async () => {
    if (!canManageBilling) {
      setMessage("課金操作はオーナーのみ可能です。オーナーに依頼してください。");
      return;
    }
    setMessage(null);
    setBusyAction("portal");
    try {
      await restoreAppleSubscriptions();
      await load();
      setMessage("購入情報を復元しました。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "購入の復元に失敗しました。");
    } finally {
      setBusyAction(null);
    }
  }, [canManageBilling, load]);

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
    if (appStoreOnly && isStripeBilling) {
      setMessage(
        "Web でご契約中のプランです。プランの変更・解約はブラウザ（infomii.com）の設定から行ってください。",
      );
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
  }, [appStoreOnly, canManageBilling, confirmExternalPayment, isAppleBilling, isStripeBilling, useIosIap]);

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

  const showStripeWebContractNotice = appStoreOnly && isPaid && isStripeBilling;
  const showAppPurchaseActions = !showStripeWebContractNotice;

  const billingIntervalToggle =
    useIosIap && showAppPurchaseActions ? (
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
          {(statusLabel || showNextRenewal || showValidUntil) && (
            <div className="app-plan-hero-meta">
              {statusLabel ? <span>{statusLabel}</span> : null}
              {showNextRenewal ? <span>次回更新 {currentPeriodEndLabel}</span> : null}
              {showValidUntil && !showNextRenewal ? <span>有効期限 {periodLabel}</span> : null}
            </div>
          )}
        </div>

        {showStripeWebContractNotice ? (
          <p className="app-plan-footnote app-plan-footnote--warn">
            Web でご契約中です。変更・解約は infomii.com の設定から行ってください。
          </p>
        ) : null}

        <AppPlanBillingPanel
          plan={plan}
          isPaid={isPaid}
          isAppleBilling={isAppleBilling}
          billingInterval={billingInterval}
          billingIntervalToggle={billingIntervalToggle}
          busyAction={busyAction}
          canManageBilling={canManageBilling}
          showAppPurchaseActions={showAppPurchaseActions}
          onSubscribePro={() => void openCheckout("pro")}
          onSubscribeBusiness={() => void openCheckout("business")}
          onUpgradeBusiness={() =>
            void (useIosIap && isAppleBilling ? openApplePurchase("business") : openCheckout("business"))
          }
          onRestore={() => void openAppleRestore()}
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
          お申し込み・復元は App Store 経由です。同じアカウントでログインしていれば、既存のプランが反映されます。
        </p>
      ) : useIosIap ? (
        <p className="mt-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2.5 text-sm leading-relaxed text-[var(--app-text-muted)]">
          iOS アプリからのお申し込みは App Store 経由で行います。
        </p>
      ) : null}
      {showStripeWebContractNotice ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm leading-relaxed text-amber-900">
          現在 Web でご契約中です。プランの変更・解約はブラウザ（infomii.com）の設定から行ってください。
        </p>
      ) : null}
      {showAppPurchaseActions ? (
      <div
        className={
          isAppLayout
            ? "app-plan-actions mt-4 flex flex-col gap-2.5"
            : "app-settings-billing-actions mt-4 flex flex-col items-start gap-3"
        }
      >
        {billingIntervalToggle}
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
        {plan === "pro" && showAppPurchaseActions ? (
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
        {plan === "business" && showAppPurchaseActions ? (
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
        {useIosIap && showAppPurchaseActions ? (
          <button
            type="button"
            onClick={() => void openAppleRestore()}
            disabled={busyAction !== null || !canManageBilling}
            className={
              "app-button-native ui-pop-tap inline-flex min-h-[44px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 " +
              (isAppLayout ? " w-full max-w-full" : "")
            }
          >
            購入を復元
          </button>
        ) : null}
      </div>
      ) : null}
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
      {plan === "pro" && isStripeBilling && !appStoreOnly ? (
        <p className="mt-2 text-xs text-slate-500">現在の契約から決済ページでBusinessプランへ変更できます。</p>
      ) : null}
      {isPaid && isActiveLike && isStripeBilling && !appStoreOnly ? (
        <p className="mt-2 text-xs text-slate-500">解約は Stripe の管理画面でいつでも行えます。</p>
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
