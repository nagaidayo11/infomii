import type { RefObject } from "react";
import type WebView from "react-native-webview";
import { purchaseAppleProduct, restoreApplePurchases } from "./iap";

type IapBridgeMessage =
  | { type: "iap-purchase"; requestId: string; productId: string }
  | { type: "iap-restore"; requestId: string };

type IapBridgeResult = {
  type: "iap-result";
  requestId: string;
  ok: boolean;
  transactionId?: string;
  originalTransactionId?: string | null;
  productId?: string;
  signedTransactionInfo?: string;
  environment?: "Sandbox" | "Production";
  error?: string;
  userCancelled?: boolean;
};

function dispatchResult(webViewRef: RefObject<WebView | null>, result: IapBridgeResult): void {
  const script = `
    (function () {
      try {
        if (window.dispatchNativeIapResult) {
          window.dispatchNativeIapResult(${JSON.stringify(result)});
          return;
        }
        window.dispatchEvent(new CustomEvent("infomii-iap-result", { detail: ${JSON.stringify(result)} }));
      } catch (e) {}
    })();
    true;
  `;
  webViewRef.current?.injectJavaScript(script);
}

function isUserCancelled(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "userCancelled" in error &&
      (error as { userCancelled?: boolean }).userCancelled,
  );
}

export async function handleIapBridgeMessage(
  raw: string,
  webViewRef: RefObject<WebView | null>,
): Promise<void> {
  let message: IapBridgeMessage;
  try {
    message = JSON.parse(raw) as IapBridgeMessage;
  } catch {
    return;
  }

  if (!message.requestId) return;

  if (message.type === "iap-purchase") {
    try {
      const purchase = await purchaseAppleProduct(message.productId);
      dispatchResult(webViewRef, {
        type: "iap-result",
        requestId: message.requestId,
        ok: true,
        transactionId: purchase.transactionId,
        originalTransactionId: purchase.originalTransactionId,
        productId: purchase.productId,
        signedTransactionInfo: purchase.signedTransactionInfo,
        environment: purchase.environment,
      });
    } catch (error) {
      dispatchResult(webViewRef, {
        type: "iap-result",
        requestId: message.requestId,
        ok: false,
        error: error instanceof Error ? error.message : "App Store 課金に失敗しました",
        userCancelled: isUserCancelled(error),
      });
    }
    return;
  }

  if (message.type === "iap-restore") {
    try {
      const purchase = await restoreApplePurchases();
      dispatchResult(webViewRef, {
        type: "iap-result",
        requestId: message.requestId,
        ok: true,
        transactionId: purchase.transactionId,
        originalTransactionId: purchase.originalTransactionId,
        productId: purchase.productId,
        signedTransactionInfo: purchase.signedTransactionInfo,
        environment: purchase.environment,
      });
    } catch (error) {
      dispatchResult(webViewRef, {
        type: "iap-result",
        requestId: message.requestId,
        ok: false,
        error: error instanceof Error ? error.message : "App Store の契約情報の取得に失敗しました",
        userCancelled: isUserCancelled(error),
      });
    }
  }
}
