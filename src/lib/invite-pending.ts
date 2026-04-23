/**
 * ログイン前に入力した施設招待コード（ログイン直後の redeem 用）
 */
export const PENDING_HOTEL_INVITE_KEY = "infomii_pending_hotel_invite_code";
/** 二重の redeem 呼び出しを防ぐ（短時間のみ） */
export const INVITE_REDEEM_LOCK_KEY = "infomii_invite_redeem_lock";

function safeRead(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(PENDING_HOTEL_INVITE_KEY);
  } catch {
    return null;
  }
}

export function readPendingInviteCode(): string | null {
  const raw = safeRead()?.trim() ?? "";
  return raw ? raw.toUpperCase() : null;
}

export function writePendingInviteCode(code: string): void {
  if (typeof window === "undefined") return;
  const c = code.trim().toUpperCase();
  if (!c) {
    return;
  }
  try {
    window.sessionStorage.setItem(PENDING_HOTEL_INVITE_KEY, c);
  } catch {
    // ignore
  }
}

export function clearPendingInviteCode(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PENDING_HOTEL_INVITE_KEY);
  } catch {
    // ignore
  }
}

export const DASHBOARD_INVITE_SUCCESS_KEY = "infomii_flash_invite_success";
export const DASHBOARD_INVITE_ERROR_KEY = "infomii_flash_invite_error";

export function setDashboardInviteSuccessFlash(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DASHBOARD_INVITE_SUCCESS_KEY, "1");
  } catch {
    // ignore
  }
}

export function setDashboardInviteErrorFlash(message: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DASHBOARD_INVITE_ERROR_KEY, message);
  } catch {
    // ignore
  }
}

export function readAndClearDashboardInviteError(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const m = window.sessionStorage.getItem(DASHBOARD_INVITE_ERROR_KEY);
    window.sessionStorage.removeItem(DASHBOARD_INVITE_ERROR_KEY);
    return m;
  } catch {
    return null;
  }
}

export function readAndClearDashboardInviteSuccess(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const v = window.sessionStorage.getItem(DASHBOARD_INVITE_SUCCESS_KEY);
    window.sessionStorage.removeItem(DASHBOARD_INVITE_SUCCESS_KEY);
    return v === "1";
  } catch {
    return false;
  }
}
