"use client";

import { useState } from "react";
import { createStripeCheckoutSession, trackUpgradeClick } from "@/lib/storage";
import { Button } from "@/components/ui";

type Plan = "pro" | "business";

type CheckoutButtonProps = {
  plan: Plan;
  variant?: "primary" | "secondary";
  className?: string;
  children: React.ReactNode;
};

const loginHref = "/login?ref=lp-saas&next=%2Flp%2Fsaas%23pricing";

/**
 * LP料金セクション用の申し込みボタン。
 * ログイン済みならStripe Checkoutへ、未ログインならログインへ遷移。
 */
export function CheckoutButton({
  plan,
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
      const url = await createStripeCheckoutSession({
        plan,
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
