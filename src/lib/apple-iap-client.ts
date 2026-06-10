"use client";

import {
  getAppleProductId,
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

export async function purchaseAppleSubscription(
  plan: AppleIapPlan,
  interval: AppleIapInterval = "monthly",
): Promise<VerifyAppleIapResult> {
  if (!isNativeIapAvailable()) {
    throw new Error("App Store 課金は iOS アプリ内でのみ利用できます");
  }
  const productId = getAppleProductId(plan, interval);
  const purchase = await requestNativeIapPurchase(productId);
  return verifyAppleIapTransaction({
    transactionId: purchase.transactionId,
    signedTransactionInfo: purchase.signedTransactionInfo,
    environment: purchase.environment,
  });
}

export async function restoreAppleSubscriptions(): Promise<VerifyAppleIapResult> {
  if (!isNativeIapAvailable()) {
    throw new Error("購入の復元は iOS アプリ内でのみ利用できます");
  }
  const purchase = await requestNativeIapRestore();
  return verifyAppleIapTransaction({
    transactionId: purchase.transactionId,
    signedTransactionInfo: purchase.signedTransactionInfo,
    environment: purchase.environment,
  });
}
