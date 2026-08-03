/**
 * Guest / preview pages must use full document navigation.
 * Next.js client-side routing can show tap feedback without completing in WebView (iOS app).
 */

import { appTapHaptic, openUrlViaNativeApp } from "@/lib/native-app-bridge";
import { resolveGuestPageHref } from "@/lib/guest-page-link";

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

function isInfomiiGuestHost(hostname: string): boolean {
  return hostname === "infomii.com" || hostname.endsWith(".infomii.com");
}

function isInternalGuestHref(href: string): boolean {
  const target = resolveHref(href);
  if (!target) return false;
  if (!/^\/(?:v|p)\//.test(target.pathname)) return false;
  return target.origin === window.location.origin || isInfomiiGuestHost(target.hostname);
}

function resolveHref(href: string): URL | null {
  if (typeof window === "undefined") return null;
  try {
    return new URL(href, window.location.href);
  } catch {
    return null;
  }
}

function isExternalHttpHref(href: string): boolean {
  const target = resolveHref(href);
  if (!target) return false;
  if (isInternalGuestHref(href)) return false;
  return (target.protocol === "http:" || target.protocol === "https:") && target.origin !== window.location.origin;
}

function isNativeOpenableHref(href: string): boolean {
  const target = resolveHref(href);
  if (!target) return false;
  if (target.protocol === "tel:" || target.protocol === "mailto:") return true;
  return isExternalHttpHref(href);
}

export function assignGuestPageUrl(href: string) {
  const guestHref = resolveGuestPageHref(href, {
    pathname: window.location.pathname,
    searchParams: new URLSearchParams(window.location.search),
  });
  const resolved = new URL(guestHref, window.location.href).href;
  window.location.assign(resolved);
}

export function openGuestNavigationHref(href: string) {
  const nativeOpenable = isNativeOpenableHref(href);
  if (nativeOpenable) {
    const resolved = resolveHref(href);
    if (resolved && openUrlViaNativeApp(resolved.href)) {
      appTapHaptic("selection");
      return;
    }
  }
  appTapHaptic("selection");
  assignGuestPageUrl(href);
}

export function shouldForceGuestHardNavigation(
  event: NavigableMouseEvent,
  anchor: HTMLAnchorElement,
): boolean {
  if (event.defaultPrevented) return false;
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.hasAttribute("download")) return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) return false;
  const internalGuest = isInternalGuestHref(href);
  const nativeOpenable = isNativeOpenableHref(href);
  if (anchor.target && anchor.target !== "_self" && !nativeOpenable && !internalGuest) return false;
  return isSameOriginHref(href) || nativeOpenable || internalGuest;
}

/** Capture-phase handler: bypass Next.js soft navigation and WebView-blocked external loads. */
export function interceptGuestAnchorHardNavigation(event: NavigableMouseEvent) {
  const target = event.target as HTMLElement | null;
  const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
  if (!anchor || !shouldForceGuestHardNavigation(event, anchor)) return;
  const href = anchor.getAttribute("href");
  if (!href) return;
  event.preventDefault();
  event.stopPropagation();
  openGuestNavigationHref(href);
}
