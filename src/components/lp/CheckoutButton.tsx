"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createStripeCheckoutSession,
  createStripePortalSession,
  getCurrentHotelSubscription,
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

  useEffect(() => {
    let mounted = true;
    void getCurrentHotelSubscription()
      .then((sub) => {
        if (mounted) setSubscription(sub);
      })
      .catch(() => {
        if (mounted) setSubscription(null);
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
    if (!shouldOpenPortal) return "Businessを申し込む";
    if (subscription?.plan === "business") return "請求情報を管理";
    return "Businessへアップグレード";
  }, [adaptiveBusinessCta, plan, shouldOpenPortal, subscription?.plan, children]);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await trackUpgradeClick(plan === "business" ? "lp-pricing-business" : "lp-pricing-pro");

      const url = shouldOpenPortal
        ? await createStripePortalSession()
        : await createStripeCheckoutSession({
          plan,
          interval,
          successPath: "/dashboard?billing=success",
          cancelPath: "/lp/saas#pricing",
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
          alert(portalMsg || "決済ページの起動に失敗しました");
          return;
        }
      }
      if (msg.includes("Stripe顧客情報")) {
        setLoading(false);
        alert("契約情報の同期中です。しばらくしてからもう一度お試しください。");
        return;
      }
      setLoading(false);
      alert(msg || "申し込みの開始に失敗しました");
    }
  };

  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        variant={variant}
        className={className}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? "処理中…" : buttonLabel}
      </Button>
      {showUpgradeHint && plan === "business" && subscription?.plan === "pro" && isActive ? (
        <p className="text-center text-xs text-slate-500">現在の契約から決済ページでBusinessへ変更できます。</p>
      ) : null}
    </div>
  );
}
