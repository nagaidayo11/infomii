"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createStripeCheckoutSession,
  createStripePortalSession,
  getCurrentHotelSubscription,
  getCurrentUserHotelRole,
  trackUpgradeClick,
} from "@/lib/storage";
import { Button } from "@/components/ui";

type Plan = "pro" | "business";

type CheckoutButtonProps = {
  plan: Plan;
  interval?: "monthly" | "yearly";
  variant?: "primary" | "secondary";
  className?: string;
  adaptiveBusinessCta?: boolean;
  showUpgradeHint?: boolean;
  children: React.ReactNode;
};

const loginHref = "/login?ref=lp-saas&next=%2Flp%2Fsaas%23pricing";

/**
 * LP料金セクション用の申し込みボタン。
 * ログイン済みなら現在プランに応じてCheckout/Portalへ、未ログインならログインへ遷移。
 */
export function CheckoutButton({
  plan,
  interval = "monthly",
  variant = "primary",
  className = "",
  adaptiveBusinessCta = false,
  showUpgradeHint = false,
  children,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<Awaited<ReturnType<typeof getCurrentHotelSubscription>>>(null);
  const [canManageBilling, setCanManageBilling] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void Promise.all([getCurrentHotelSubscription(), getCurrentUserHotelRole()])
      .then(([sub, role]) => {
        if (mounted) setSubscription(sub);
        if (!mounted) return;
        if (role === "admin" || role === "editor" || role === "viewer") {
          setCanManageBilling(false);
        } else {
          setCanManageBilling(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setSubscription(null);
          setCanManageBilling(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const isPaidPlan = subscription?.plan === "pro" || subscription?.plan === "business";
  const isActive = subscription?.status === "active" || subscription?.status === "trialing";
  const shouldOpenPortal = isPaidPlan && isActive;
  const buttonLabel = useMemo(() => {
    if (!adaptiveBusinessCta || plan !== "business") {
      return children;
    }
    if (!shouldOpenPortal) return "チームプランを申し込む";
    if (subscription?.plan === "business") return "請求情報を管理";
    return "チームプランへアップグレード";
  }, [adaptiveBusinessCta, plan, shouldOpenPortal, subscription?.plan, children]);

  const handleClick = async () => {
    if (loading) return;
    if (!canManageBilling) {
      setMessage("課金操作はオーナーのみ可能です。オーナーに依頼してください。");
      return;
    }
    setMessage(null);
    setLoading(true);
    try {
      await trackUpgradeClick(plan === "business" ? "lp-pricing-business" : "lp-pricing-pro");

      const url = shouldOpenPortal
        ? await createStripePortalSession()
        : await createStripeCheckoutSession({
          plan,
          interval,
          successPath: "/dashboard?billing=success",
          cancelPath: "/lp/saas#pricing-plans",
        });
      window.location.href = url;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (
        msg.includes("ログイン") ||
        msg.includes("認証") ||
        msg.includes("セッション")
      ) {
        window.location.href = loginHref;
        return;
      }
      if (msg.includes("すでに有料プランです")) {
        try {
          const portalUrl = await createStripePortalSession();
          window.location.href = portalUrl;
          return;
        } catch (portalError) {
          const portalMsg = portalError instanceof Error ? portalError.message : String(portalError);
          if (portalMsg.includes("ログイン") || portalMsg.includes("認証") || portalMsg.includes("セッション")) {
            window.location.href = loginHref;
            return;
          }
          setLoading(false);
          setMessage(portalMsg || "決済ページの起動に失敗しました");
          return;
        }
      }
      if (msg.includes("Stripe顧客情報")) {
        setLoading(false);
        setMessage("契約情報の同期中です。しばらくしてからもう一度お試しください。");
        return;
      }
      setLoading(false);
      setMessage(msg || "申し込みの開始に失敗しました");
    }
  };

  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        variant={variant}
        className={`ui-pop-tap ${className}`.trim()}
        onClick={handleClick}
        disabled={loading || !canManageBilling}
      >
        {loading ? "処理中…" : buttonLabel}
      </Button>
      {!canManageBilling ? (
        <p className="text-center text-xs text-slate-500">課金操作はオーナーのみ可能です。オーナーに依頼してください。</p>
      ) : null}
      {showUpgradeHint && plan === "business" && subscription?.plan === "pro" && isActive ? (
        <p className="text-center text-xs text-slate-500">現在の契約から決済ページでチームプランへ変更できます。</p>
      ) : null}
      {message ? <p className="text-center text-xs text-rose-600">{message}</p> : null}
    </div>
  );
}
