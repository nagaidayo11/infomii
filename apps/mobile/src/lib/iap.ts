import { Platform } from "react-native";
import {
  endConnection,
  finishTransaction,
  getAvailablePurchases,
  getSubscriptions,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestSubscription,
  setup,
  type ProductPurchase,
  type PurchaseError,
  type Subscription,
  type SubscriptionPurchase,
} from "react-native-iap";

export const APPLE_IAP_PRODUCT_IDS = [
  "com.infomii.app.pro.monthly",
  "com.infomii.app.pro.annual",
  "com.infomii.app.business.monthly",
  "com.infomii.app.business.annual",
] as const;

export type IapSuccessPayload = {
  transactionId: string;
  originalTransactionId: string | null;
  productId: string;
  signedTransactionInfo?: string;
  environment?: "Sandbox" | "Production";
};

let connectionReady = false;
let purchaseUpdateSub: { remove: () => void } | null = null;
let purchaseErrorSub: { remove: () => void } | null = null;

let pendingPurchase: {
  productId: string;
  resolve: (value: IapSuccessPayload) => void;
  reject: (error: Error) => void;
} | null = null;

function isUserCancelled(error: PurchaseError): boolean {
  return error.code === "E_USER_CANCELLED";
}

function readSignedTransactionInfo(
  purchase: ProductPurchase | SubscriptionPurchase,
): string | undefined {
  const direct = purchase.verificationResultIOS?.trim();
  if (direct) return direct;

  const raw = purchase as SubscriptionPurchase & {
    verificationResult?: string;
    jwsRepresentationIos?: string;
  };
  const alt = raw.verificationResult?.trim() || raw.jwsRepresentationIos?.trim();
  return alt || undefined;
}

function isOurProductId(productId: string): productId is (typeof APPLE_IAP_PRODUCT_IDS)[number] {
  return APPLE_IAP_PRODUCT_IDS.includes(productId as (typeof APPLE_IAP_PRODUCT_IDS)[number]);
}

function productTierRank(productId: string): number {
  if (productId.includes(".business.")) return 2;
  if (productId.includes(".pro.")) return 1;
  return 0;
}

function shouldAcceptPendingPurchase(requestedProductId: string, receivedProductId: string): boolean {
  if (!isOurProductId(receivedProductId)) return false;
  if (receivedProductId === requestedProductId) return true;
  return productTierRank(receivedProductId) >= productTierRank(requestedProductId);
}

function purchaseToPayload(purchase: ProductPurchase | SubscriptionPurchase): IapSuccessPayload {
  const transactionId =
    purchase.transactionId ??
    (purchase as SubscriptionPurchase & { id?: string }).id ??
    "";
  const signedTransactionInfo = readSignedTransactionInfo(purchase);

  if (!transactionId && !signedTransactionInfo) {
    throw new Error("App Store から取引 ID を取得できませんでした");
  }

  return {
    transactionId: transactionId || "unknown",
    originalTransactionId:
      (purchase as SubscriptionPurchase).originalTransactionIdentifierIOS ??
      purchase.transactionId ??
      null,
    productId: purchase.productId,
    signedTransactionInfo,
  };
}

async function ensureConnection(): Promise<void> {
  if (Platform.OS !== "ios") {
    throw new Error("App Store 課金は iOS でのみ利用できます");
  }
  if (connectionReady) return;

  setup({ storekitMode: "STOREKIT_HYBRID_MODE" });
  await initConnection();
  await getSubscriptions({ skus: [...APPLE_IAP_PRODUCT_IDS] });
  connectionReady = true;

  purchaseUpdateSub?.remove();
  purchaseErrorSub?.remove();

  purchaseUpdateSub = purchaseUpdatedListener(async (purchase) => {
    if (
      !pendingPurchase ||
      !shouldAcceptPendingPurchase(pendingPurchase.productId, purchase.productId)
    ) {
      return;
    }

    const current = pendingPurchase;
    pendingPurchase = null;

    try {
      await finishTransaction({ purchase, isConsumable: false });
      current.resolve(purchaseToPayload(purchase));
    } catch (error) {
      current.reject(
        error instanceof Error ? error : new Error("購入の完了処理に失敗しました"),
      );
    }
  });

  purchaseErrorSub = purchaseErrorListener((error) => {
    if (!pendingPurchase) return;
    const current = pendingPurchase;
    pendingPurchase = null;
    if (isUserCancelled(error)) {
      current.reject(Object.assign(new Error("購入がキャンセルされました"), { userCancelled: true }));
      return;
    }
    current.reject(new Error(error.message || "App Store 課金に失敗しました"));
  });
}

export async function purchaseAppleProduct(productId: string): Promise<IapSuccessPayload> {
  await ensureConnection();

  if (pendingPurchase) {
    throw new Error("別の購入処理が進行中です");
  }

  return new Promise((resolve, reject) => {
    pendingPurchase = { productId, resolve, reject };
    void requestSubscription({ sku: productId }).catch((error: Error) => {
      if (pendingPurchase?.productId === productId) {
        pendingPurchase = null;
      }
      reject(error);
    });
  });
}

export async function restoreApplePurchases(): Promise<IapSuccessPayload> {
  await ensureConnection();
  const purchases = await getAvailablePurchases({ onlyIncludeActiveItems: true });
  const latest = purchases
    .filter((purchase) => isOurProductId(purchase.productId))
    .sort((a, b) => {
      const tierDiff = productTierRank(b.productId) - productTierRank(a.productId);
      if (tierDiff !== 0) return tierDiff;
      return Number(b.transactionDate ?? 0) - Number(a.transactionDate ?? 0);
    })[0];

  if (!latest) {
    throw new Error("復元できる App Store の購入が見つかりませんでした");
  }

  return purchaseToPayload(latest);
}

export async function listAppleSubscriptions(): Promise<Subscription[]> {
  await ensureConnection();
  return getSubscriptions({ skus: [...APPLE_IAP_PRODUCT_IDS] });
}

export async function teardownIapConnection(): Promise<void> {
  purchaseUpdateSub?.remove();
  purchaseErrorSub?.remove();
  purchaseUpdateSub = null;
  purchaseErrorSub = null;
  pendingPurchase = null;
  if (!connectionReady) return;
  await endConnection();
  connectionReady = false;
}
