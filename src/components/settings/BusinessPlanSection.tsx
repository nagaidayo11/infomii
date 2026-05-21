"use client";
import { useCallback, useEffect, useState } from "react";
import {
  createStripeCheckoutSession,
  createStripePortalSession,
  getCurrentHotelSubscription,
  getCurrentUserHotelRole,
  type HotelSubscription,
} from "@/lib/storage";
import { Card } from "@/components/ui/Card";

/**
 * Businessプランの特典を設定画面に表示（未加入にはアップグレード案内）
 */
export function BusinessPlanSection() {
  const [subscription, setSubscription] = useState<HotelSubscription | null | undefined>(undefined);
  const [busyAction, setBusyAction] = useState<"pro" | "business" | "portal" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [canManageBilling, setCanManageBilling] = useState(false);
  const [roleLoaded, setRoleLoaded] = useState(false);

  const plan = subscription?.plan ?? "free";
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

  const openCheckout = useCallback(async (targetPlan: "pro" | "business") => {
    if (!canManageBilling) {
      setMessage("課金操作はオーナーのみ可能です。オーナーに依頼してください。");
      return;
    }
    setMessage(null);
    setBusyAction(targetPlan);
    try {
      const url = await createStripeCheckoutSession({
        plan: targetPlan,
        successPath: "/dashboard?billing=success",
        cancelPath: "/settings",
      });
      window.location.href = url;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes("ログイン") || msg.includes("認証") || msg.includes("セッション")) {
        window.location.href = "/login?ref=lp-saas&next=%2Fsettings";
        return;
      }
      setMessage(msg || "決済ページの起動に失敗しました。");
      setBusyAction(null);
    }
  }, [canManageBilling]);

  const openPortal = useCallback(async () => {
    if (!canManageBilling) {
      setMessage("課金操作はオーナーのみ可能です。オーナーに依頼してください。");
      return;
    }
    setMessage(null);
    setBusyAction("portal");
    try {
      const url = await createStripePortalSession();
      window.location.href = url;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes("ログイン") || msg.includes("認証") || msg.includes("セッション")) {
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
  }, [canManageBilling]);

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
    return (
      <Card padding="lg">
        <div className="h-20 animate-pulse rounded-lg bg-slate-100" aria-hidden />
      </Card>
    );
  }

  // 招待ユーザーには課金情報（料金表・請求導線）を表示しない
  if (!canManageBilling) {
    return null;
  }

  return (
    <Card padding="lg" className="border-slate-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900">プランと請求</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            多言語翻訳の自動補助、分析の CSV ダウンロード、公開ページ数の拡張など、運用が大きくなった施設向けのプランです。
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {plan === "free" ? (
          <>
            <button
              type="button"
              onClick={() => void openCheckout("pro")}
              disabled={busyAction !== null || !canManageBilling}
              className="app-button-native ui-pop-tap inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busyAction === "pro" ? "処理中…" : "Proを申し込む"}
            </button>
            <button
              type="button"
              onClick={() => void openCheckout("business")}
              disabled={busyAction !== null || !canManageBilling}
              className="app-button-native ui-pop-tap inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busyAction === "business" ? "処理中…" : "Businessプランを申し込む"}
            </button>
          </>
        ) : null}
        {plan === "pro" ? (
          <>
            <button
              type="button"
              onClick={() => void openPortal()}
              disabled={busyAction !== null || !canManageBilling}
              className="app-button-native ui-pop-tap inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busyAction === "portal" ? "処理中…" : "Businessプランへアップグレード"}
            </button>
            <button
              type="button"
              onClick={() => void openPortal()}
              disabled={busyAction !== null || !canManageBilling}
              className="app-button-native ui-pop-tap inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              サブスクリプションを管理 / 解約する
            </button>
          </>
        ) : null}
        {plan === "business" ? (
          <>
            <button
              type="button"
              onClick={() => void openPortal()}
              disabled={busyAction !== null || !canManageBilling}
              className="app-button-native ui-pop-tap inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busyAction === "portal" ? "処理中…" : "請求情報を管理"}
            </button>
            <button
              type="button"
              onClick={() => void openPortal()}
              disabled={busyAction !== null || !canManageBilling}
              className="app-button-native ui-pop-tap inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              サブスクリプションを管理 / 解約する
            </button>
          </>
        ) : null}
      </div>
      <div className="mt-4 rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/40 to-slate-50/60 p-5 sm:p-7">
        <div className="flex flex-col gap-2 border-b border-emerald-100/80 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800/90 sm:text-base">料金表</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 sm:text-[15px]">
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
        <div className="mx-auto mt-5 grid w-full max-w-none gap-4 sm:grid-cols-3 lg:gap-6">
          <div
            className={`rounded-xl border px-4 py-4 sm:px-5 sm:py-5 ${
              plan === "free" ? "border-emerald-300 bg-emerald-50/70" : "border-slate-200 bg-white"
            }`}
          >
            {plan === "free" ? (
              <p className="mb-2 inline-flex rounded-full border border-emerald-700 bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">
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
            className={`rounded-xl border px-4 py-4 sm:px-5 sm:py-5 ${
              plan === "pro" ? "border-emerald-300 bg-emerald-50/70" : "border-slate-200 bg-white"
            }`}
          >
            {plan === "pro" ? (
              <p className="mb-2 inline-flex rounded-full border border-emerald-700 bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">
                現在のプラン
              </p>
            ) : null}
            <p className={`text-sm font-semibold sm:text-base ${plan === "pro" ? "text-emerald-700" : "text-slate-500"}`}>Pro</p>
            <p className={`mt-1.5 text-xl font-semibold sm:text-2xl ${plan === "pro" ? "text-emerald-900" : "text-slate-900"}`}>¥1,980 / 月</p>
            <ul className={`mt-3 space-y-2 text-sm leading-snug sm:text-[15px] ${plan === "pro" ? "text-emerald-800" : "text-slate-600"}`}>
              <li>・最大10ページ公開</li>
              <li>・閲覧分析</li>
              <li>・用途別にページを分けて運用</li>
            </ul>
          </div>
          <div
            className={`rounded-xl border px-4 py-4 sm:px-5 sm:py-5 ${
              plan === "business" ? "border-emerald-300 bg-emerald-50/70" : "border-slate-200 bg-white"
            }`}
          >
            {plan === "business" ? (
              <p className="mb-2 inline-flex rounded-full border border-emerald-700 bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">
                現在のプラン
              </p>
            ) : null}
            <div className="flex items-center gap-2">
              <p className={`text-sm font-semibold sm:text-base ${plan === "business" ? "text-emerald-700" : "text-slate-500"}`}>Business</p>
              <span className="ui-pop-badge inline-flex rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-sky-700">
                人気
              </span>
            </div>
            <p className={`mt-1.5 text-xl font-semibold sm:text-2xl ${plan === "business" ? "text-emerald-900" : "text-slate-900"}`}>¥4,980 / 月</p>
            <ul className={`mt-3 space-y-2 text-sm leading-snug sm:text-[15px] ${plan === "business" ? "text-emerald-800" : "text-slate-600"}`}>
              <li>・公開ページ無制限</li>
              <li>・公開時の多言語自動翻訳</li>
              <li>・チーム招待（引き継ぎしやすい）</li>
              <li>・動的ブロック</li>
            </ul>
          </div>
        </div>
      </div>
      {plan === "pro" ? (
        <p className="mt-2 text-xs text-slate-500">現在の契約から決済ページでBusinessプランへ変更できます。</p>
      ) : null}
      {isPaid && isActiveLike ? (
        <p className="mt-2 text-xs text-slate-500">解約はStripeの管理画面でいつでも行えます。</p>
      ) : null}
      {message ? <p className="mt-2 text-xs text-rose-600">{message}</p> : null}
    </Card>
  );
}
