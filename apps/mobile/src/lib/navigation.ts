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
  "google.com",
  "google.co.jp",
  "gstatic.com",
  "supabase.co",
  "github.com",
  "apple.com",
  "appleid.apple.com",
  "icloud.com",
];

function isAllowedExternalHost(hostname: string): boolean {
  return EXTERNAL_ALLOW_SUFFIXES.some(
    (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`),
  );
}

/**
 * Keep OAuth and Supabase inside the WebView. App billing uses StoreKit only.
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
