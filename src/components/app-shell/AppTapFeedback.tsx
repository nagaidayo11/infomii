"use client";

import { useEffect } from "react";

const TAP_SELECTOR =
  ".ui-pop-tap, .app-pressable, .app-touch-btn, .app-fab, .app-switch, .app-segmented-item, .app-sheet-action, .app-works-share-btn, .app-works-delete-btn, .editor-topbar-btn, .app-list-row";

/**
 * Light haptic on tap when the device supports vibration (Android WebView etc.).
 */
export function AppTapFeedback() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || typeof navigator.vibrate !== "function") return;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest(TAP_SELECTOR)) return;
      navigator.vibrate(8);
    };

    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return null;
}
