/** Open a public guest page inside the native WebView (same tab). */
export function navigateGuestPageUrl(publicUrl: string, opts?: { preview?: boolean }): void {
  if (typeof window === "undefined") return;
  const url = new URL(publicUrl, window.location.origin);
  if (opts?.preview) url.searchParams.set("preview", "1");
  url.searchParams.set("client", "app");
  window.location.assign(`${url.pathname}${url.search}${url.hash}`);
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
