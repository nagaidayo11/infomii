"use client";

import {
  getAppleProductId,
  mapAppleProductIdToPlan,
  type AppleIapInterval,
  type AppleIapPlan,
} from "@/lib/apple-iap-products";
import {
  isNativeIapAvailable,
  requestNativeIapPurchase,
  requestNativeIapRestore,
  type NativeIapPurchaseResult,
} from "@/lib/native-iap";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

export type VerifyAppleIapResult = {
  ok: true;
  plan: "free" | "pro" | "business";
  status: "trialing" | "active" | "past_due" | "canceled";
  productId: string | null;
  originalTransactionId: string | null;
  currentPeriodEnd: string | null;
};

const SERVER_SYNC_TIMEOUT_MS = 12_000;
const RESTORE_SYNC_TIMEOUT_MS = 8_000;

function planRank(value: VerifyAppleIapResult["plan"] | AppleIapPlan): number {
  if (value === "business") return 2;
  if (value === "pro") return 1;
  return 0;
}

function promiseWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallback: T,
): Promise<T> {
  return new Promise((resolve) => {
    let settled = false;
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve(fallback);
    }, timeoutMs);
    promise
      .then((value) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve(fallback);
      });
  });
}

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

export function buildOptimisticAppleIapResult(
  purchase: Pick<NativeIapPurchaseResult, "productId" | "originalTransactionId">,
  expectedPlan?: AppleIapPlan,
): VerifyAppleIapResult {
  const plan = mapAppleProductIdToPlan(purchase.productId) ?? expectedPlan ?? "pro";
  return {
    ok: true,
    plan,
    status: "active",
    productId: purchase.productId,
    originalTransactionId: purchase.originalTransactionId ?? null,
    currentPeriodEnd: null,
  };
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
  purchase: NativeIapPurchaseResult,
): Promise<VerifyAppleIapResult> {
  return verifyAppleIapTransaction({
    transactionId: purchase.transactionId,
    signedTransactionInfo: purchase.signedTransactionInfo,
    environment: purchase.environment,
    productId: purchase.productId,
  });
}

/** Re-sync App Store entitlements to the signed-in Infomii account (plan tab / restore). */
export async function syncAppleSubscriptionToAccount(params?: {
  transactionId?: string;
  signedTransactionInfo?: string;
  environment?: "Sandbox" | "Production";
  productId?: string;
}): Promise<VerifyAppleIapResult> {
  const token = await getAccessToken();
  const response = await fetch("/api/apple/iap/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params ?? {}),
  });
  const payload = (await response.json()) as VerifyAppleIapResult & { message?: string };
  if (!response.ok || !payload.ok) {
    throw new Error(payload.message || "Apple IAP の同期に失敗しました");
  }
  return payload;
}

async function syncAppleSubscriptionFromStore(): Promise<VerifyAppleIapResult> {
  const purchase = await requestNativeIapRestore();
  return syncAppleSubscriptionToAccount({
    transactionId: purchase.transactionId,
    signedTransactionInfo: purchase.signedTransactionInfo,
    environment: purchase.environment,
    productId: purchase.productId,
  });
}

/** Server sync after native purchase. Never blocks on restore longer than RESTORE_SYNC_TIMEOUT_MS. */
export async function syncApplePurchaseAfterNative(
  purchase: NativeIapPurchaseResult,
  expectedPlan: AppleIapPlan,
): Promise<VerifyAppleIapResult> {
  const fallback = buildOptimisticAppleIapResult(purchase, expectedPlan);
  const expectedRank = planRank(expectedPlan);

  let result = fallback;
  try {
    result = await promiseWithTimeout(
      syncApplePurchaseToServer(purchase),
      SERVER_SYNC_TIMEOUT_MS,
      fallback,
    );
  } catch {
    result = fallback;
  }

  if (planRank(result.plan) >= expectedRank) {
    return result;
  }

  try {
    result = await promiseWithTimeout(
      syncAppleSubscriptionToAccount({
        transactionId: purchase.transactionId,
        signedTransactionInfo: purchase.signedTransactionInfo,
        environment: purchase.environment,
        productId: purchase.productId,
      }),
      SERVER_SYNC_TIMEOUT_MS,
      fallback,
    );
  } catch {
    result = fallback;
  }

  if (planRank(result.plan) >= expectedRank) {
    return result;
  }

  try {
    result = await promiseWithTimeout(
      syncAppleSubscriptionFromStore(),
      RESTORE_SYNC_TIMEOUT_MS,
      fallback,
    );
  } catch {
    result = fallback;
  }

  return planRank(result.plan) >= expectedRank ? result : fallback;
}

export async function requestAppleStorePurchase(
  plan: AppleIapPlan,
  interval: AppleIapInterval = "monthly",
): Promise<NativeIapPurchaseResult> {
  if (!isNativeIapAvailable()) {
    throw new Error("App Store 課金は iOS アプリ内でのみ利用できます");
  }
  return requestNativeIapPurchase(getAppleProductId(plan, interval));
}

export async function purchaseAppleSubscription(
  plan: AppleIapPlan,
  interval: AppleIapInterval = "monthly",
): Promise<VerifyAppleIapResult> {
  const purchase = await requestAppleStorePurchase(plan, interval);
  return syncApplePurchaseAfterNative(purchase, plan);
}

/** Settings → Restore purchases (App Store Guideline 3.1.1). */
export async function restoreAppleSubscriptions(): Promise<VerifyAppleIapResult> {
  if (!isNativeIapAvailable()) {
    throw new Error("購入の復元は iOS アプリ内でのみ利用できます");
  }
  const purchase = await requestNativeIapRestore();
  const plan = mapAppleProductIdToPlan(purchase.productId) ?? "pro";
  return syncApplePurchaseAfterNative(purchase, plan);
}
