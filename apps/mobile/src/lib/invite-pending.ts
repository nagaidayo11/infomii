import AsyncStorage from "@react-native-async-storage/async-storage";

/** ログイン前に入力した施設招待コード（ログイン直後の redeem 用） */
export const PENDING_HOTEL_INVITE_KEY = "infomii_pending_hotel_invite_code";
/** 二重の redeem 呼び出しを防ぐ */
export const INVITE_REDEEM_LOCK_KEY = "infomii_invite_redeem_lock";
/** 新規登録後、初回ログイン時に個人施設を作るフラグ（Web と同キー） */
export const ONBOARDING_SCOPE_BOOTSTRAP_KEY = "infomii_onboarding_scope_bootstrap";
export const HOME_INVITE_SUCCESS_KEY = "infomii_flash_invite_success";
export const HOME_INVITE_ERROR_KEY = "infomii_flash_invite_error";

export async function readPendingInviteCode(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_HOTEL_INVITE_KEY);
    const trimmed = raw?.trim() ?? "";
    return trimmed ? trimmed.toUpperCase() : null;
  } catch {
    return null;
  }
}

export async function writePendingInviteCode(code: string): Promise<void> {
  const c = code.trim().toUpperCase();
  if (!c) return;
  await AsyncStorage.setItem(PENDING_HOTEL_INVITE_KEY, c);
}

export async function clearPendingInviteCode(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_HOTEL_INVITE_KEY);
}

export async function tryAcquireInviteRedeemLock(): Promise<boolean> {
  const v = await AsyncStorage.getItem(INVITE_REDEEM_LOCK_KEY);
  if (v === "1") return false;
  await AsyncStorage.setItem(INVITE_REDEEM_LOCK_KEY, "1");
  return true;
}

export async function releaseInviteRedeemLock(): Promise<void> {
  await AsyncStorage.removeItem(INVITE_REDEEM_LOCK_KEY);
}

export async function setOnboardingScopeBootstrap(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_SCOPE_BOOTSTRAP_KEY, "1");
}

export async function consumeOnboardingScopeBootstrap(): Promise<boolean> {
  const v = await AsyncStorage.getItem(ONBOARDING_SCOPE_BOOTSTRAP_KEY);
  if (v !== "1") return false;
  await AsyncStorage.removeItem(ONBOARDING_SCOPE_BOOTSTRAP_KEY);
  return true;
}

export async function setHomeInviteSuccessFlash(): Promise<void> {
  await AsyncStorage.setItem(HOME_INVITE_SUCCESS_KEY, "1");
}

export async function setHomeInviteErrorFlash(message: string): Promise<void> {
  await AsyncStorage.setItem(HOME_INVITE_ERROR_KEY, message);
}

export async function readAndClearHomeInviteError(): Promise<string | null> {
  const m = await AsyncStorage.getItem(HOME_INVITE_ERROR_KEY);
  await AsyncStorage.removeItem(HOME_INVITE_ERROR_KEY);
  return m;
}

export async function readAndClearHomeInviteSuccess(): Promise<boolean> {
  const v = await AsyncStorage.getItem(HOME_INVITE_SUCCESS_KEY);
  await AsyncStorage.removeItem(HOME_INVITE_SUCCESS_KEY);
  return v === "1";
}
