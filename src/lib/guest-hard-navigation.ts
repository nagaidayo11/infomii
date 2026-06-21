/**
 * Guest / preview pages must use full document navigation.
 * Next.js client-side routing can show tap feedback without completing in WebView (iOS app).
 */

type NavigableMouseEvent = Pick<
  MouseEvent,
  | "target"
  | "defaultPrevented"
  | "button"
  | "metaKey"
  | "ctrlKey"
  | "shiftKey"
  | "altKey"
  | "preventDefault"
  | "stopPropagation"
>;

function isSameOriginHref(href: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const target = new URL(href, window.location.href);
    return target.origin === window.location.origin;
  } catch {
    return false;
  }
}

export function assignGuestPageUrl(href: string) {
  const resolved = new URL(href, window.location.href).href;
  window.location.assign(resolved);
}

export function shouldForceGuestHardNavigation(
  event: NavigableMouseEvent,
  anchor: HTMLAnchorElement,
): boolean {
  if (event.defaultPrevented) return false;
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) return false;
  return isSameOriginHref(href);
}

/** Capture-phase handler: bypass Next.js soft navigation for same-origin guest links. */
export function interceptGuestAnchorHardNavigation(event: NavigableMouseEvent) {
  const target = event.target as HTMLElement | null;
  const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
  if (!anchor || !shouldForceGuestHardNavigation(event, anchor)) return;
  const href = anchor.getAttribute("href");
  if (!href) return;
  event.preventDefault();
  event.stopPropagation();
  assignGuestPageUrl(href);
}
