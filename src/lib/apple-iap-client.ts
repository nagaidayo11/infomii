"use client";

import {
  getAppleProductId,
  mapAppleProductIdToPlan,
  type AppleIapInterval,
  type AppleIapPlan,
} from "@/lib/apple-iap-products";
import { isNativeIapAvailable, requestNativeIapPurchase, requestNativeIapRestore } from "@/lib/native-iap";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

export type VerifyAppleIapResult = {
  ok: true;
  plan: "free" | "pro" | "business";
  status: "trialing" | "active" | "past_due" | "canceled";
  productId: string | null;
  originalTransactionId: string | null;
  currentPeriodEnd: string | null;
};

async function getAccessToken(): Promise<string> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) throw new Error("Supabase設定が未完了です");
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session?.access_token) {
    throw new Error("ログインが必要です。サインインしてから再度お試しください。");
  }
  return session.access_token;
}

export async function verifyAppleIapTransaction(params: {
  transactionId: string;
  signedTransactionInfo?: string;
  environment?: "Sandbox" | "Production";
  productId?: string;
}): Promise<VerifyAppleIapResult> {
  const token = await getAccessToken();
  const response = await fetch("/api/apple/iap/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  const payload = (await response.json()) as VerifyAppleIapResult & { message?: string };
  if (!response.ok || !payload.ok) {
    throw new Error(payload.message || "Apple IAP の同期に失敗しました");
  }
  return payload;
}

async function syncApplePurchaseToServer(
  purchase: Awaited<ReturnType<typeof requestNativeIapPurchase>>,
): Promise<VerifyAppleIapResult> {
  return verifyAppleIapTransaction({
    transactionId: purchase.transactionId,
    signedTransactionInfo: purchase.signedTransactionInfo,
    environment: purchase.environment,
    productId: purchase.productId,
  });
}

export async function purchaseAppleSubscription(
  plan: AppleIapPlan,
  interval: AppleIapInterval = "monthly",
): Promise<VerifyAppleIapResult> {
  if (!isNativeIapAvailable()) {
    throw new Error("App Store 課金は iOS アプリ内でのみ利用できます");
  }
  const productId = getAppleProductId(plan, interval);
  const purchase = await requestNativeIapPurchase(productId);
  let result = await syncApplePurchaseToServer(purchase);

  const planRank = (value: VerifyAppleIapResult["plan"] | AppleIapPlan) =>
    value === "business" ? 2 : value === "pro" ? 1 : 0;

  const expectedRank = planRank(plan);
  if (planRank(result.plan) < expectedRank) {
    result = await syncAppleSubscriptionFromStore();
  }

  if (planRank(result.plan) < expectedRank) {
    const purchasedPlan = mapAppleProductIdToPlan(purchase.productId);
    if (purchasedPlan === plan) {
      throw new Error(
        "App Store での購入は完了しましたが、プランの反映に失敗しました。しばらくしてからプラン画面を開き直すか、サポートへお問い合わせください。",
      );
    }
  }

  return result;
}

/** Internal: re-read StoreKit entitlements when post-purchase sync returns a lower tier. */
async function syncAppleSubscriptionFromStore(): Promise<VerifyAppleIapResult> {
  const purchase = await requestNativeIapRestore();
  return syncApplePurchaseToServer(purchase);
}
