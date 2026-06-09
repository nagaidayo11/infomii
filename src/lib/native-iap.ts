"use client";

import { isNativeAppWebView } from "@/lib/native-app-bridge";

export type NativeIapPurchaseResult = {
  transactionId: string;
  originalTransactionId: string | null;
  productId: string;
  environment?: "Sandbox" | "Production";
};

type IapBridgeRequest =
  | { type: "iap-purchase"; requestId: string; productId: string }
  | { type: "iap-restore"; requestId: string };

type IapBridgeResponse = {
  type: "iap-result";
  requestId: string;
  ok: boolean;
  transactionId?: string;
  originalTransactionId?: string | null;
  productId?: string;
  environment?: "Sandbox" | "Production";
  error?: string;
  userCancelled?: boolean;
};

type NativeWebViewWindow = Window & {
  ReactNativeWebView?: { postMessage: (message: string) => void };
};

const IAP_RESULT_EVENT = "infomii-iap-result";

let listenerInstalled = false;
const pending = new Map<
  string,
  {
    resolve: (value: NativeIapPurchaseResult) => void;
    reject: (error: Error) => void;
  }
>();

function ensureListener(): void {
  if (listenerInstalled || typeof window === "undefined") return;
  listenerInstalled = true;
  window.addEventListener(IAP_RESULT_EVENT, (event) => {
    const detail = (event as CustomEvent<IapBridgeResponse>).detail;
    if (!detail?.requestId) return;
    const entry = pending.get(detail.requestId);
    if (!entry) return;
    pending.delete(detail.requestId);
    if (!detail.ok) {
      if (detail.userCancelled) {
        entry.reject(new Error("購入がキャンセルされました"));
        return;
      }
      entry.reject(new Error(detail.error || "App Store 課金に失敗しました"));
      return;
    }
    if (!detail.transactionId || !detail.productId) {
      entry.reject(new Error("App Store から取引情報を取得できませんでした"));
      return;
    }
    entry.resolve({
      transactionId: detail.transactionId,
      originalTransactionId: detail.originalTransactionId ?? null,
      productId: detail.productId,
      environment: detail.environment,
    });
  });
}

function postNativeRequest(payload: IapBridgeRequest): Promise<NativeIapPurchaseResult> {
  ensureListener();
  if (!isNativeAppWebView()) {
    return Promise.reject(new Error("ネイティブ App Store 課金は iOS アプリ内でのみ利用できます"));
  }

  return new Promise((resolve, reject) => {
    pending.set(payload.requestId, { resolve, reject });
    try {
      (window as NativeWebViewWindow).ReactNativeWebView?.postMessage(JSON.stringify(payload));
    } catch (error) {
      pending.delete(payload.requestId);
      reject(error instanceof Error ? error : new Error("ネイティブ課金の開始に失敗しました"));
      return;
    }

    window.setTimeout(() => {
      if (!pending.has(payload.requestId)) return;
      pending.delete(payload.requestId);
      reject(new Error("App Store 課金がタイムアウトしました。もう一度お試しください。"));
    }, 120_000);
  });
}

export function isNativeIapAvailable(): boolean {
  return isNativeAppWebView();
}

export function requestNativeIapPurchase(productId: string): Promise<NativeIapPurchaseResult> {
  const requestId = crypto.randomUUID();
  return postNativeRequest({ type: "iap-purchase", requestId, productId });
}

export function requestNativeIapRestore(): Promise<NativeIapPurchaseResult> {
  const requestId = crypto.randomUUID();
  return postNativeRequest({ type: "iap-restore", requestId });
}

/** Called from native shell via injected JavaScript. */
export function dispatchNativeIapResult(detail: IapBridgeResponse): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(IAP_RESULT_EVENT, { detail }));
}
