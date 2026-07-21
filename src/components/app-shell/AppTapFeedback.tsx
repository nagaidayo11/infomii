"use client";

import { useEffect } from "react";
import { appTapHaptic } from "@/lib/native-app-bridge";

const TAP_SELECTOR =
  ".ui-pop-tap, .app-pressable, .app-touch-btn, .app-fab, .app-switch, .app-segmented-item, .app-sheet-action, .app-works-share-btn, .app-works-delete-btn, .editor-topbar-btn, .app-list-row, .app-link-tile";

/**
 * Light haptic on tap — native bridge in InfomiiApp WebView, vibration API elsewhere.
 */
export function AppTapFeedback() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest(TAP_SELECTOR)) return;
      appTapHaptic("light");
    };

    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return null;
}
