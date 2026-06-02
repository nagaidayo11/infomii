/**
 * Shared layout metrics for fixed bottom tab bar + FAB (Expo WebView safe area).
 */

/** Home-indicator padding inside tab bar (single source; native WebView injects --infomii-safe-bottom). */
export const APP_TAB_BAR_SAFE_INSET =
  "var(--infomii-safe-bottom-fallback, env(safe-area-inset-bottom, 0px))";

/** Tab row: icon + label + vertical padding (excludes safe inset). */
export const APP_TAB_BAR_ROW_HEIGHT = "3.25rem";

/** Main scroll area padding so content clears the tab bar. */
export const APP_TAB_BAR_OFFSET = `calc(${APP_TAB_BAR_ROW_HEIGHT} + ${APP_TAB_BAR_SAFE_INSET})`;

/** FAB (h-14) sits above tab bar with gap. */
export const APP_FAB_SIZE = "3.5rem";
export const APP_FAB_GAP = "0.75rem";
export const APP_FAB_BOTTOM_OFFSET = `calc(${APP_TAB_BAR_ROW_HEIGHT} + ${APP_TAB_BAR_SAFE_INSET} + ${APP_FAB_GAP})`;

/** Pages list bottom padding: tab bar + FAB + extra scroll room. */
export const APP_SCROLL_WITH_FAB_PADDING = `calc(${APP_TAB_BAR_OFFSET} + ${APP_FAB_SIZE} + ${APP_FAB_GAP})`;
