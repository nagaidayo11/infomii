const PREVIEW_PLACEHOLDER_HTML =
  "<!DOCTYPE html><html lang=\"ja\"><head><meta charset=\"utf-8\"><title>プレビュー準備中</title></head>" +
  "<body style=\"margin:0;font-family:system-ui,sans-serif;background:#f8fafc;color:#475569;\">" +
  "<div style=\"display:flex;min-height:100vh;align-items:center;justify-content:center;padding:1.5rem;text-align:center;\">" +
  "<div><p style=\"margin:0;font-size:1rem;font-weight:600;color:#334155;\">プレビューを準備しています…</p>" +
  "<p style=\"margin:0.75rem 0 0;font-size:0.875rem;\">このタブはまもなくゲスト表示に切り替わります。</p></div></div></body></html>";

/** Open a placeholder tab synchronously (must run inside the user click/tap handler). */
export function openGuestPreviewPlaceholderTab(): Window | null {
  if (typeof window === "undefined") return null;
  const previewWindow = window.open("about:blank", "_blank");
  if (!previewWindow) return null;
  previewWindow.opener = null;
  try {
    previewWindow.document.open();
    previewWindow.document.write(PREVIEW_PLACEHOLDER_HTML);
    previewWindow.document.close();
  } catch {
    /* location will be set after async prep */
  }
  return previewWindow;
}

export function closeGuestPreviewTab(previewWindow: Window | null | undefined): void {
  if (!previewWindow) return;
  try {
    previewWindow.close();
  } catch {
    /* ignore */
  }
}

/** Navigate an already-open preview tab (prefer replace so back-stack stays clean). */
export function navigatePreviewWindow(previewWindow: Window, url: string): boolean {
  try {
    if (previewWindow.closed) return false;
  } catch {
    return false;
  }
  try {
    previewWindow.location.replace(url);
    return true;
  } catch {
    try {
      previewWindow.location.href = url;
      return true;
    } catch {
      return false;
    }
  }
}

function buildGuestPageTarget(
  publicUrl: string,
  opts?: { preview?: boolean; appClient?: boolean; returnEditorPageId?: string },
): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.infomii.com";
  const url = new URL(publicUrl, origin);
  if (opts?.preview) url.searchParams.set("preview", "1");
  if (opts?.appClient) url.searchParams.set("client", "app");
  if (opts?.returnEditorPageId) url.searchParams.set("returnEditor", opts.returnEditorPageId);
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Open a public guest page inside the native WebView (same tab). */
export function navigateGuestPageUrl(
  publicUrl: string,
  opts?: { preview?: boolean; returnEditorPageId?: string },
): void {
  if (typeof window === "undefined") return;
  const appClient = new URLSearchParams(window.location.search).get("client") === "app";
  const target = buildGuestPageTarget(publicUrl, {
    preview: opts?.preview,
    appClient,
    returnEditorPageId: opts?.returnEditorPageId,
  });
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

/** Back link for guest preview (parent page or editor in app shell). */
export function buildGuestPreviewBackLink(opts: {
  fromSlug?: string;
  returnEditorPageId?: string;
  isPreview: boolean;
  lang?: string;
  isAppClient?: boolean;
}): { href: string; label: string } | null {
  if (opts.fromSlug) {
    const q = new URLSearchParams();
    if (opts.isPreview) q.set("preview", "1");
    if (opts.lang) q.set("lang", opts.lang);
    if (opts.returnEditorPageId) q.set("returnEditor", opts.returnEditorPageId);
    if (opts.isAppClient) q.set("client", "app");
    const qs = q.toString();
    return { href: `/v/${opts.fromSlug}${qs ? `?${qs}` : ""}`, label: "← 戻る" };
  }
  if (opts.returnEditorPageId) {
    return {
      href: withAppClientQuery(`/editor/${opts.returnEditorPageId}`),
      label: "← 編集に戻る",
    };
  }
  return null;
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
