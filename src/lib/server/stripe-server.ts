import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

let cached: Stripe | null = null;

export function getStripeServerClient(): Stripe {
  if (!STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY が未設定です");
  }

  if (!cached) {
    cached = new Stripe(STRIPE_SECRET_KEY);
  }

  return cached;
}

export function getStripeWebhookSecret(): string {
  const value = process.env.STRIPE_WEBHOOK_SECRET;
  if (!value) {
    throw new Error("STRIPE_WEBHOOK_SECRET が未設定です");
  }
  return value;
}

export function getStripeProPriceId(): string {
  const value = process.env.STRIPE_PRO_PRICE_ID;
  if (!value) {
    throw new Error("STRIPE_PRO_PRICE_ID が未設定です");
  }
  return value;
}

export function getAppBaseUrl(fallbackOrigin?: string | null): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (fallbackOrigin) {
    return fallbackOrigin;
  }
  return "http://localhost:3000";
}
