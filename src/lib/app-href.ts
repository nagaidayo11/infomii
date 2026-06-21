function buildGuestPageTarget(publicUrl: string, opts?: { preview?: boolean; appClient?: boolean }): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.infomii.com";
  const url = new URL(publicUrl, origin);
  if (opts?.preview) url.searchParams.set("preview", "1");
  if (opts?.appClient) url.searchParams.set("client", "app");
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Open a public guest page inside the native WebView (same tab). */
export function navigateGuestPageUrl(publicUrl: string, opts?: { preview?: boolean }): void {
  if (typeof window === "undefined") return;
  const appClient = new URLSearchParams(window.location.search).get("client") === "app";
  const target = buildGuestPageTarget(publicUrl, { preview: opts?.preview, appClient });
  window.location.assign(target);
}

/** Prefer a new browser tab; fall back to same-tab navigation when popups are blocked. */
export function openGuestPageInNewTab(
  publicUrl: string,
  opts?: { preview?: boolean; appClient?: boolean },
): boolean {
  if (typeof window === "undefined") return false;
  const appClient =
    opts?.appClient ?? new URLSearchParams(window.location.search).get("client") === "app";
  const target = buildGuestPageTarget(publicUrl, { preview: opts?.preview, appClient });
  const opened = window.open(target, "_blank", "noopener,noreferrer");
  if (opened) {
    opened.opener = null;
    return true;
  }
  navigateGuestPageUrl(publicUrl, { preview: opts?.preview });
  return false;
}

/** Preserve ?client=app for browser preview parity with native WebView. */
export function withAppClientQuery(href: string): string {
  if (!href.startsWith("/")) return href;
  const hashIdx = href.indexOf("#");
  const hash = hashIdx >= 0 ? href.slice(hashIdx) : "";
  const pathAndQuery = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
  const qIdx = pathAndQuery.indexOf("?");
  const path = qIdx >= 0 ? pathAndQuery.slice(0, qIdx) : pathAndQuery;
  const params = new URLSearchParams(qIdx >= 0 ? pathAndQuery.slice(qIdx + 1) : "");
  params.set("client", "app");
  const qs = params.toString();
  return `${path}?${qs}${hash}`;
}
