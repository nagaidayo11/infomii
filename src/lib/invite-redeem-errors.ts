import { HOTEL_TEAM_MAX_MEMBERS } from "@/lib/team-constants";

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: unknown }).message ?? "");
  }
  return String(error);
}

/**
 * `redeem_hotel_invite` RPC の失敗をユーザー向け日本語に
 */
export function formatHotelInviteRedeemError(error: unknown): string {
  const m = toErrorMessage(error).toLowerCase();
  if (m.includes("invite_not_found") || m.includes("invalid_invite_code")) {
    return "招待コードが見つかりません。内容をご確認ください。";
  }
  if (m.includes("invite_inactive")) {
    return "この招待コードは無効化されています。";
  }
  if (m.includes("invite_already_used")) {
    return "この招待コードは使用済みです。";
  }
  if (m.includes("invite_expired")) {
    return "この招待コードの有効期限が切れています。";
  }
  if (m.includes("not_authenticated")) {
    return "ログインの状態を確認できませんでした。再度お試しください。";
  }
  if (m.includes("team_member_limit")) {
    return `この施設のメンバー数が上限（${HOTEL_TEAM_MAX_MEMBERS}名）に達しています。オーナーにご確認ください。`;
  }
  return "招待コードの適用に失敗しました。時間をおいて再度お試しください。";
}
