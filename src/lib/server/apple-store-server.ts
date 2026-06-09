import {
  AppStoreServerAPIClient,
  Environment,
  SignedDataVerifier,
  type JWSTransactionDecodedPayload,
} from "@apple/app-store-server-library";
import { APPLE_IAP_BUNDLE_ID } from "@/lib/apple-iap-products";

export type AppleStoreEnvironment = "Sandbox" | "Production";

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

  if (environment === "Production") {
    if (!productionVerifier) {
      productionVerifier = new SignedDataVerifier(
        [],
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
      [],
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

export async function fetchAppleTransaction(
  transactionId: string,
  preferredEnvironment?: AppleStoreEnvironment,
): Promise<{ transaction: JWSTransactionDecodedPayload; environment: AppleStoreEnvironment }> {
  const environments: AppleStoreEnvironment[] =
    preferredEnvironment === "Production"
      ? ["Production", "Sandbox"]
      : preferredEnvironment === "Sandbox"
        ? ["Sandbox", "Production"]
        : ["Production", "Sandbox"];

  let lastError: unknown = null;

  for (const environment of environments) {
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

  throw lastError instanceof Error ? lastError : new Error("Apple transaction lookup failed");
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
