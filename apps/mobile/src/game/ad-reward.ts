export const AD_COOLDOWN_MS = 60_000;
export const AD_BOOST_MS = 30 * 60 * 1000;
export const AD_INSTANT_SECONDS = 60 * 10;

export type AdRewardKind = "boost" | "instant";

export function adMultiplier(adBoostUntil: number, nowTs: number): number {
  return adBoostUntil > nowTs ? 2 : 1;
}

export function adCooldownRemainingSec(lastAdWatchAt: number, nowTs: number): number {
  return Math.max(0, Math.ceil((lastAdWatchAt + AD_COOLDOWN_MS - nowTs) / 1000));
}

export function adBoostRemainingSec(adBoostUntil: number, nowTs: number): number {
  return Math.max(0, Math.ceil((adBoostUntil - nowTs) / 1000));
}
