import {
  APIException,
  AppStoreServerAPIClient,
  AutoRenewStatus,
  Environment,
  Order,
  ProductType,
  SignedDataVerifier,
  Status,
  type JWSRenewalInfoDecodedPayload,
  type JWSTransactionDecodedPayload,
} from "@apple/app-store-server-library";
import {
  APPLE_IAP_BUNDLE_ID,
  compareAppleProductTier,
  mapAppleProductIdToPlan,
} from "@/lib/apple-iap-products";
import { loadAppleRootCertificates } from "@/lib/server/apple-root-certificates";

export type AppleStoreEnvironment = "Sandbox" | "Production";

function formatAppleStoreError(error: unknown, context: string): Error {
  if (error instanceof APIException) {
    const detail = error.errorMessage?.trim();
    if (detail) return new Error(detail);
    return new Error(`Apple API error (HTTP ${error.httpStatusCode})`);
  }
  if (error instanceof Error && error.message.trim()) {
    return new Error(`${context}: ${error.message.trim()}`);
  }
  if (typeof error === "string" && error.trim()) {
    return new Error(`${context}: ${error.trim()}`);
  }
  return new Error(context);
}

function environmentOrder(
  preferredEnvironment?: AppleStoreEnvironment,
): AppleStoreEnvironment[] {
  if (preferredEnvironment === "Production") return ["Production", "Sandbox"];
  if (preferredEnvironment === "Sandbox") return ["Sandbox", "Production"];
  return ["Sandbox", "Production"];
}

function readApplePrivateKey(): string {
  const raw = process.env.APPLE_IAP_PRIVATE_KEY?.trim();
  if (!raw) {
    throw new Error("APPLE_IAP_PRIVATE_KEY is not configured");
  }
  return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

function getAppleIssuerId(): string {
  const value = process.env.APPLE_IAP_ISSUER_ID?.trim();
  if (!value) throw new Error("APPLE_IAP_ISSUER_ID is not configured");
  return value;
}

function getAppleKeyId(): string {
  const value = process.env.APPLE_IAP_KEY_ID?.trim();
  if (!value) throw new Error("APPLE_IAP_KEY_ID is not configured");
  return value;
}

function getBundleId(): string {
  return process.env.APPLE_IAP_BUNDLE_ID?.trim() || APPLE_IAP_BUNDLE_ID;
}

let productionClient: AppStoreServerAPIClient | null = null;
let sandboxClient: AppStoreServerAPIClient | null = null;

function getApiClient(environment: AppleStoreEnvironment): AppStoreServerAPIClient {
  if (environment === "Production") {
    if (!productionClient) {
      productionClient = new AppStoreServerAPIClient(
        readApplePrivateKey(),
        getAppleKeyId(),
        getAppleIssuerId(),
        getBundleId(),
        Environment.PRODUCTION,
      );
    }
    return productionClient;
  }

  if (!sandboxClient) {
    sandboxClient = new AppStoreServerAPIClient(
      readApplePrivateKey(),
      getAppleKeyId(),
      getAppleIssuerId(),
      getBundleId(),
      Environment.SANDBOX,
    );
  }
  return sandboxClient;
}

let productionVerifier: SignedDataVerifier | null = null;
let sandboxVerifier: SignedDataVerifier | null = null;

function getSignedDataVerifier(environment: AppleStoreEnvironment): SignedDataVerifier {
  const appAppleId = process.env.APPLE_IAP_APP_APPLE_ID?.trim();
  const appAppleIdNumber = appAppleId ? Number(appAppleId) : undefined;
  const appleRootCAs = loadAppleRootCertificates();

  if (environment === "Production") {
    if (!productionVerifier) {
      productionVerifier = new SignedDataVerifier(
        appleRootCAs,
        true,
        Environment.PRODUCTION,
        getBundleId(),
        appAppleIdNumber,
      );
    }
    return productionVerifier;
  }

  if (!sandboxVerifier) {
    sandboxVerifier = new SignedDataVerifier(
      appleRootCAs,
      true,
      Environment.SANDBOX,
      getBundleId(),
      appAppleIdNumber,
    );
  }
  return sandboxVerifier;
}

export function isAppleIapServerConfigured(): boolean {
  return Boolean(
    process.env.APPLE_IAP_ISSUER_ID?.trim() &&
      process.env.APPLE_IAP_KEY_ID?.trim() &&
      process.env.APPLE_IAP_PRIVATE_KEY?.trim(),
  );
}

export async function decodeAppleTransactionFromSignedInfo(
  signedTransactionInfo: string,
  preferredEnvironment?: AppleStoreEnvironment,
): Promise<{ transaction: JWSTransactionDecodedPayload; environment: AppleStoreEnvironment }> {
  let lastError: unknown = null;

  for (const environment of environmentOrder(preferredEnvironment)) {
    try {
      const verifier = getSignedDataVerifier(environment);
      const transaction = await verifier.verifyAndDecodeTransaction(signedTransactionInfo);
      return { transaction, environment };
    } catch (error) {
      lastError = error;
    }
  }

  throw formatAppleStoreError(lastError, "Apple signed transaction verification failed");
}

export async function resolveAppleTransaction(params: {
  transactionId?: string;
  signedTransactionInfo?: string;
  preferredEnvironment?: AppleStoreEnvironment;
}): Promise<{ transaction: JWSTransactionDecodedPayload; environment: AppleStoreEnvironment }> {
  const transactionId = params.transactionId?.trim() ?? "";
  const signedTransactionInfo = params.signedTransactionInfo?.trim() ?? "";
  const preferredEnvironment = params.preferredEnvironment;

  if (signedTransactionInfo) {
    try {
      return await decodeAppleTransactionFromSignedInfo(signedTransactionInfo, preferredEnvironment);
    } catch (decodeError) {
      if (transactionId && transactionId !== "unknown") {
        try {
          return await fetchAppleTransaction(transactionId, preferredEnvironment);
        } catch {
          throw decodeError;
        }
      }
      throw decodeError;
    }
  }

  if (!transactionId || transactionId === "unknown") {
    throw new Error("App Store から有効な取引情報を取得できませんでした");
  }

  return fetchAppleTransaction(transactionId, preferredEnvironment);
}

const ACTIVE_APPLE_SUBSCRIPTION_STATUSES = new Set<Status>([
  Status.ACTIVE,
  Status.BILLING_GRACE_PERIOD,
  Status.BILLING_RETRY,
]);

type AppleSubscriptionCandidate = {
  transaction: JWSTransactionDecodedPayload;
  effectiveProductId: string;
};

export function resolveEffectiveAppleProductId(
  transaction: JWSTransactionDecodedPayload,
  renewal: JWSRenewalInfoDecodedPayload | null,
): string {
  const current = transaction.productId?.trim() ?? "";
  const autoRenew = renewal?.autoRenewProductId?.trim() ?? "";
  if (!current) return autoRenew;
  if (!autoRenew) return current;
  if (renewal?.autoRenewStatus === AutoRenewStatus.OFF) return current;
  if (compareAppleProductTier(autoRenew, current) > 0) return autoRenew;
  return current;
}

function withEffectiveProductId(
  transaction: JWSTransactionDecodedPayload,
  effectiveProductId: string,
): JWSTransactionDecodedPayload {
  return { ...transaction, productId: effectiveProductId };
}

export function pickHighestTierAppleSubscription(
  candidates: AppleSubscriptionCandidate[],
): AppleSubscriptionCandidate {
  return candidates.reduce((best, current) => {
    const tierDiff = compareAppleProductTier(
      current.effectiveProductId,
      best.effectiveProductId,
    );
    if (tierDiff > 0) return current;
    if (tierDiff < 0) return best;
    const bestExpiry = best.transaction.expiresDate ?? 0;
    const currentExpiry = current.transaction.expiresDate ?? 0;
    return currentExpiry > bestExpiry ? current : best;
  });
}

export function pickHighestTierAppleTransaction(
  transactions: JWSTransactionDecodedPayload[],
): JWSTransactionDecodedPayload {
  const candidates = transactions.map((transaction) => ({
    transaction,
    effectiveProductId: transaction.productId?.trim() ?? "",
  }));
  const best = pickHighestTierAppleSubscription(candidates);
  return withEffectiveProductId(best.transaction, best.effectiveProductId);
}

async function fetchActiveCandidatesFromHistory(
  client: AppStoreServerAPIClient,
  verifier: SignedDataVerifier,
  anyTransactionId: string,
): Promise<AppleSubscriptionCandidate[]> {
  const response = await client.getTransactionHistory(
    anyTransactionId,
    null,
    {
      productTypes: [ProductType.AUTO_RENEWABLE],
      sort: Order.DESCENDING,
    },
  );

  const now = Date.now();
  const candidates: AppleSubscriptionCandidate[] = [];

  for (const signed of response.signedTransactions ?? []) {
    const decoded = await verifier.verifyAndDecodeTransaction(signed);
    if (!mapAppleProductIdToPlan(decoded.productId)) continue;
    if (decoded.revocationDate) continue;
    const expires = decoded.expiresDate ?? 0;
    if (expires && expires <= now) continue;
    candidates.push({
      transaction: decoded,
      effectiveProductId: decoded.productId?.trim() ?? "",
    });
  }

  return candidates;
}

/** Resolves the customer's current active subscription (handles Pro → Business upgrades). */
export async function resolveActiveAppleSubscriptionTransaction(params: {
  anyTransactionId: string;
  preferredEnvironment?: AppleStoreEnvironment;
}): Promise<{ transaction: JWSTransactionDecodedPayload; environment: AppleStoreEnvironment } | null> {
  const anyTransactionId = params.anyTransactionId.trim();
  if (!anyTransactionId) return null;

  let lastError: unknown = null;

  for (const environment of environmentOrder(params.preferredEnvironment)) {
    try {
      const client = getApiClient(environment);
      const statusResponse = await client.getAllSubscriptionStatuses(anyTransactionId);
      const verifier = getSignedDataVerifier(environment);
      const candidates: AppleSubscriptionCandidate[] = [];

      for (const group of statusResponse.data ?? []) {
        for (const item of group.lastTransactions ?? []) {
          if (!item.signedTransactionInfo) continue;
          const status = item.status;
          if (status === undefined || !ACTIVE_APPLE_SUBSCRIPTION_STATUSES.has(status as Status)) {
            continue;
          }
          const decoded = await verifier.verifyAndDecodeTransaction(item.signedTransactionInfo);
          let renewal: JWSRenewalInfoDecodedPayload | null = null;
          if (item.signedRenewalInfo) {
            renewal = await verifier.verifyAndDecodeRenewalInfo(item.signedRenewalInfo);
          }
          const effectiveProductId = resolveEffectiveAppleProductId(decoded, renewal);
          if (!mapAppleProductIdToPlan(effectiveProductId)) continue;
          candidates.push({ transaction: decoded, effectiveProductId });
        }
      }

      if (candidates.length === 0) {
        const historyCandidates = await fetchActiveCandidatesFromHistory(
          client,
          verifier,
          anyTransactionId,
        );
        candidates.push(...historyCandidates);
      }

      if (candidates.length === 0) return null;

      const best = pickHighestTierAppleSubscription(candidates);
      return {
        transaction: withEffectiveProductId(best.transaction, best.effectiveProductId),
        environment,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw formatAppleStoreError(lastError, "Apple subscription status lookup failed");
}

export async function resolveAuthoritativeAppleSubscription(params: {
  transaction: JWSTransactionDecodedPayload;
  environment: AppleStoreEnvironment;
}): Promise<{ transaction: JWSTransactionDecodedPayload; environment: AppleStoreEnvironment }> {
  const originalTransactionId =
    params.transaction.originalTransactionId ?? params.transaction.transactionId ?? "";
  if (!originalTransactionId) {
    return params;
  }

  try {
    const active = await resolveActiveAppleSubscriptionTransaction({
      anyTransactionId: originalTransactionId,
      preferredEnvironment: params.environment,
    });
    if (!active) return params;

    const activeTier = compareAppleProductTier(
      active.transaction.productId,
      params.transaction.productId,
    );
    if (activeTier >= 0) {
      return active;
    }
    return params;
  } catch {
    return params;
  }
}

export async function fetchAppleTransaction(
  transactionId: string,
  preferredEnvironment?: AppleStoreEnvironment,
): Promise<{ transaction: JWSTransactionDecodedPayload; environment: AppleStoreEnvironment }> {
  let lastError: unknown = null;

  for (const environment of environmentOrder(preferredEnvironment)) {
    try {
      const client = getApiClient(environment);
      const response = await client.getTransactionInfo(transactionId);
      if (!response.signedTransactionInfo) {
        throw new Error("signedTransactionInfo is missing");
      }
      const verifier = getSignedDataVerifier(environment);
      const transaction = await verifier.verifyAndDecodeTransaction(response.signedTransactionInfo);
      return { transaction, environment };
    } catch (error) {
      lastError = error;
    }
  }

  throw formatAppleStoreError(lastError, "Apple transaction lookup failed");
}

export async function decodeAppleNotification(
  signedPayload: string,
): Promise<{
  environment: AppleStoreEnvironment;
  notificationType?: string;
  subtype?: string;
  transaction?: JWSTransactionDecodedPayload;
}> {
  for (const environment of ["Production", "Sandbox"] as const) {
    try {
      const verifier = getSignedDataVerifier(environment);
      const notification = await verifier.verifyAndDecodeNotification(signedPayload);
      let transaction: JWSTransactionDecodedPayload | undefined;
      if (notification.data?.signedTransactionInfo) {
        transaction = await verifier.verifyAndDecodeTransaction(notification.data.signedTransactionInfo);
      }
      return {
        environment,
        notificationType: notification.notificationType,
        subtype: notification.subtype,
        transaction,
      };
    } catch {
      /* try other environment */
    }
  }
  throw new Error("Failed to verify Apple notification payload");
}

export function mapAppleTransactionStatus(
  transaction: JWSTransactionDecodedPayload,
): "trialing" | "active" | "past_due" | "canceled" {
  const now = Date.now();
  const expiresMs = transaction.expiresDate ?? null;
  if (transaction.revocationDate) {
    return "canceled";
  }
  if (expiresMs && expiresMs <= now) {
    return "canceled";
  }
  return "active";
}

export function transactionPeriodEndIso(transaction: JWSTransactionDecodedPayload): string | null {
  if (!transaction.expiresDate) return null;
  return new Date(transaction.expiresDate).toISOString();
}
