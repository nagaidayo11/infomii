"use client";
import { useCallback, useEffect, useState } from "react";
import {
  createStripeCheckoutSession,
  createStripePortalSession,
  getCurrentHotelSubscription,
  type HotelSubscription,
} from "@/lib/storage";
import { Card } from "@/components/ui/Card";

/**
 * Business プランの特典を設定画面に表示（非 Business にはアップグレード案内）
 */
export function BusinessPlanSection() {
  const [subscription, setSubscription] = useState<HotelSubscription | null | undefined>(undefined);
  const [busyAction, setBusyAction] = useState<"pro" | "business" | "portal" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const plan = subscription?.plan ?? "free";
  const status = subscription?.status ?? null;
  const currentPeriodEnd = subscription?.currentPeriodEnd ?? null;
  const isPaid = plan === "pro" || plan === "business";
  const isActiveLike = status === "active" || status === "trialing";

  const load = useCallback(async () => {
    try {
      const sub = await getCurrentHotelSubscription();
      setSubscription(sub);
    } catch {
      setSubscription(null);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const openCheckout = useCallback(async (targetPlan: "pro" | "business") => {
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
  }, []);

  const openPortal = useCallback(async () => {
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
  }, []);

  const statusLabel =
    status === "active"
      ? "active"
      : status === "trialing"
        ? "trialing"
        : status === "past_due"
          ? "past_due"
          : status === "canceled"
            ? "canceled"
            : null;
  const nextRenewalLabel = (() => {
    if (!currentPeriodEnd) return "なし";
    const date = new Date(currentPeriodEnd);
    if (Number.isNaN(date.getTime())) return "なし";
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(
      date.getDate(),
    ).padStart(2, "0")}`;
  })();

  if (subscription === undefined) {
    return (
      <Card padding="lg">
        <div className="h-20 animate-pulse rounded-lg bg-slate-100" aria-hidden />
      </Card>
    );
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
      <div className="mt-4 flex flex-wrap gap-3">
        {plan === "free" ? (
          <>
            <button
              type="button"
              onClick={() => void openCheckout("pro")}
              disabled={busyAction !== null}
              className="app-button-native inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium !text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busyAction === "pro" ? "処理中…" : "Proを申し込む"}
            </button>
            <button
              type="button"
              onClick={() => void openCheckout("business")}
              disabled={busyAction !== null}
              className="app-button-native inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busyAction === "business" ? "処理中…" : "Businessを申し込む"}
            </button>
          </>
        ) : null}
        {plan === "pro" ? (
          <>
            <button
              type="button"
              onClick={() => void openPortal()}
              disabled={busyAction !== null}
              className="app-button-native inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium !text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busyAction === "portal" ? "処理中…" : "Businessへアップグレード"}
            </button>
            <button
              type="button"
              onClick={() => void openPortal()}
              disabled={busyAction !== null}
              className="app-button-native inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
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
              disabled={busyAction !== null}
              className="app-button-native inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium !text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busyAction === "portal" ? "処理中…" : "請求情報を管理"}
            </button>
            <button
              type="button"
              onClick={() => void openPortal()}
              disabled={busyAction !== null}
              className="app-button-native inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
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
            <span>
              次回更新日: <span className="font-medium text-slate-800">{nextRenewalLabel}</span>
            </span>
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
              <p className="mb-2 inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                現在のプラン
              </p>
            ) : null}
            <p className={`text-sm font-semibold sm:text-base ${plan === "free" ? "text-emerald-700" : "text-slate-500"}`}>Free</p>
            <p className={`mt-1.5 text-xl font-semibold sm:text-2xl ${plan === "free" ? "text-emerald-900" : "text-slate-900"}`}>¥0</p>
            <ul className={`mt-3 space-y-2 text-sm leading-snug sm:text-[15px] ${plan === "free" ? "text-emerald-800" : "text-slate-600"}`}>
              <li>・1ページ公開</li>
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
              <p className="mb-2 inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                現在のプラン
              </p>
            ) : null}
            <p className={`text-sm font-semibold sm:text-base ${plan === "pro" ? "text-emerald-700" : "text-slate-500"}`}>Pro</p>
            <p className={`mt-1.5 text-xl font-semibold sm:text-2xl ${plan === "pro" ? "text-emerald-900" : "text-slate-900"}`}>¥1,980 / 月</p>
            <ul className={`mt-3 space-y-2 text-sm leading-snug sm:text-[15px] ${plan === "pro" ? "text-emerald-800" : "text-slate-600"}`}>
              <li>・最大10ページ公開</li>
              <li>・公開前チェック</li>
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
              <p className="mb-2 inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                現在のプラン
              </p>
            ) : null}
            <p className={`text-sm font-semibold sm:text-base ${plan === "business" ? "text-emerald-700" : "text-slate-500"}`}>Business</p>
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
        <p className="mt-2 text-xs text-slate-500">現在の契約から決済ページでBusinessへ変更できます。</p>
      ) : null}
      {isPaid && isActiveLike ? (
        <p className="mt-2 text-xs text-slate-500">解約はStripeの管理画面でいつでも行えます。</p>
      ) : null}
      {message ? <p className="mt-2 text-xs text-rose-600">{message}</p> : null}
    </Card>
  );
}
