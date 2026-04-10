"use client";

import { useState } from "react";
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
  children,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await trackUpgradeClick(plan === "business" ? "lp-pricing-business" : "lp-pricing-pro");

      const subscription = await getCurrentHotelSubscription().catch(() => null);
      const isPaidPlan = subscription?.plan === "pro" || subscription?.plan === "business";
      const isActive = subscription?.status === "active" || subscription?.status === "trialing";

      const url = isPaidPlan && isActive
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
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "処理中…" : children}
    </Button>
  );
}
