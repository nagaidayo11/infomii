"use client";

import { useEffect } from "react";
import { useClientShell } from "@/components/app-shell/useClientShell";

type NativeWebViewWindow = Window & {
  ReactNativeWebView?: { postMessage: (message: string) => void };
};

export type NativeHapticStyle = "light" | "medium" | "heavy" | "success" | "warning" | "selection";

let readyNotified = false;

export function isNativeAppWebView(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean((window as NativeWebViewWindow).ReactNativeWebView?.postMessage);
}

function postToNativeApp(payload: Record<string, unknown>): void {
  if (!isNativeAppWebView()) return;
  try {
    (window as NativeWebViewWindow).ReactNativeWebView?.postMessage(JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

/** Tell the native shell the first app screen is ready (hides the launch spinner). */
export function notifyNativeAppShellReady(): void {
  if (readyNotified || !isNativeAppWebView()) return;
  readyNotified = true;
  postToNativeApp({ type: "app-shell-ready" });
}

/** Request Expo haptic feedback (no-op outside InfomiiApp WebView). */
export function triggerNativeHaptic(style: NativeHapticStyle = "light"): void {
  postToNativeApp({ type: "app-haptic", style });
}

/** Open the OS share sheet from the native shell (returns false if unavailable). */
export function shareViaNativeApp(payload: { title?: string; url: string; message?: string }): boolean {
  if (!isNativeAppWebView()) return false;
  postToNativeApp({ type: "app-share", ...payload });
  return true;
}

/**
 * Best-effort tap feedback: native haptic in WebView, vibration API elsewhere.
 * Respects reduced motion.
 */
export function appTapHaptic(style: NativeHapticStyle = "light"): void {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (isNativeAppWebView()) {
    triggerNativeHaptic(style);
    return;
  }
  if (typeof navigator.vibrate === "function") {
    navigator.vibrate(style === "success" ? 12 : 8);
  }
}

export function useNotifyNativeAppShellWhenReady(ready: boolean): void {
  const { isAppShell } = useClientShell();
  useEffect(() => {
    if (isAppShell && ready) notifyNativeAppShellReady();
  }, [isAppShell, ready]);
}
