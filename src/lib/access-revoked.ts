export const ACCESS_REVOKED_CODE = "ACCESS_REVOKED";
export const ACCESS_REVOKED_MESSAGE = "このアカウントは現在チームに所属していません。オーナーに招待を依頼してください。";

export class AccessRevokedError extends Error {
  code: string;

  constructor(message = ACCESS_REVOKED_MESSAGE) {
    super(message);
    this.name = "AccessRevokedError";
    this.code = ACCESS_REVOKED_CODE;
  }
}

export function isAccessRevokedError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybe = error as { code?: unknown; message?: unknown; name?: unknown };
  if (maybe.code === ACCESS_REVOKED_CODE || maybe.name === "AccessRevokedError") return true;
  if (typeof maybe.message === "string" && maybe.message.includes(ACCESS_REVOKED_CODE)) return true;
  if (typeof maybe.message === "string" && maybe.message.includes("現在チームに所属していません")) return true;
  return false;
}
