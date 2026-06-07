"use client";

import { useEffect } from "react";
import { useClientShell } from "@/components/app-shell/useClientShell";

type NativeWebViewWindow = Window & {
  ReactNativeWebView?: { postMessage: (message: string) => void };
};

let readyNotified = false;

export function isNativeAppWebView(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean((window as NativeWebViewWindow).ReactNativeWebView?.postMessage);
}

/** Tell the native shell the first app screen is ready (hides the launch spinner). */
export function notifyNativeAppShellReady(): void {
  if (readyNotified || !isNativeAppWebView()) return;
  readyNotified = true;
  try {
    (window as NativeWebViewWindow).ReactNativeWebView?.postMessage(
      JSON.stringify({ type: "app-shell-ready" }),
    );
  } catch {
    /* ignore */
  }
}

export function useNotifyNativeAppShellWhenReady(ready: boolean): void {
  const { isAppShell } = useClientShell();
  useEffect(() => {
    if (isAppShell && ready) notifyNativeAppShellReady();
  }, [isAppShell, ready]);
}
