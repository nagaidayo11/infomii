import { getWebOrigin } from "./config";

function hostMatchesOrigin(hostname: string, origin: URL): boolean {
  if (hostname === origin.hostname) return true;
  if (origin.hostname === "localhost" && (hostname === "127.0.0.1" || hostname === "localhost")) {
    return true;
  }
  if (hostname.endsWith(".infomii.com") || hostname === "infomii.com") return true;
  return false;
}

const EXTERNAL_ALLOW_SUFFIXES = [
  "stripe.com",
  "google.com",
  "google.co.jp",
  "gstatic.com",
  "supabase.co",
  "github.com",
];

function isAllowedExternalHost(hostname: string): boolean {
  return EXTERNAL_ALLOW_SUFFIXES.some(
    (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`),
  );
}

/**
 * Keep OAuth, Stripe Checkout, and Supabase inside the WebView.
 * Block arbitrary external sites (open in system browser later if needed).
 */
export function isAllowedNavigationUrl(url: string): boolean {
  try {
    const target = new URL(url);
    if (target.protocol !== "http:" && target.protocol !== "https:") {
      return false;
    }
    const origin = new URL(getWebOrigin());
    if (hostMatchesOrigin(target.hostname, origin)) return true;
    return isAllowedExternalHost(target.hostname);
  } catch {
    return false;
  }
}
