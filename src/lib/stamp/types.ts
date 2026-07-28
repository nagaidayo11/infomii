/** Shared stamp-card types (loyalty MVP). */

import type { StampRewardTier, StampStyleId } from "@/lib/stamp/styles";
import { STAMP_CAPACITY } from "@/lib/stamp/styles";

export type StampProgramRow = {
  id: string;
  hotel_id: string;
  page_id: string;
  title: string;
  description: string;
  stamps_required: number;
  reward_title: string;
  reward_description: string;
  reward_title_5: string;
  reward_description_5: string;
  reward_title_10: string;
  reward_description_10: string;
  accent_color: string;
  stamp_style: StampStyleId;
  stamp_code: string;
  cooldown_hours: number;
  once_per_day: boolean;
  timezone: string;
  rotating_qr: boolean;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
};

export type StampCardRow = {
  id: string;
  program_id: string;
  hotel_id: string;
  token: string;
  status: "active" | "revoked";
  pending_redeem: boolean;
  pending_redeem_tier: StampRewardTier | null;
  owner_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type StampCardView = {
  token: string;
  stampCount: number;
  stampsRequired: typeof STAMP_CAPACITY;
  pendingRedeem: boolean;
  pendingRedeemTier: StampRewardTier | null;
  isFull: boolean;
  canRedeem5: boolean;
  canRedeem10: boolean;
  /** ISO time when next guest stamp is allowed; null if ready now. */
  nextStampAt: string | null;
  linkedToAccount: boolean;
  program: {
    id: string;
    title: string;
    description: string;
    rewardTitle5: string;
    rewardDescription5: string;
    rewardTitle10: string;
    rewardDescription10: string;
    accentColor: string;
    stampStyle: StampStyleId;
    oncePerDay: boolean;
    timezone: string;
    pageSlug: string;
  };
};

export function createOpaqueToken(bytes = 18): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function buildStampEntryPath(pageSlug: string): string {
  return `/s/p/${encodeURIComponent(pageSlug)}`;
}

export function buildStampCardPath(token: string): string {
  return `/s/${encodeURIComponent(token)}`;
}

/** Full-screen camera scan page that returns to the card after a successful read. */
export function buildStampScanPath(token: string): string {
  return `/s/scan/${encodeURIComponent(token)}`;
}

export function buildStampPressPath(stampCode: string): string {
  return `/s/press/${encodeURIComponent(stampCode)}`;
}

export function extractStampCodeFromScanText(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;
  try {
    const url = new URL(text, "https://infomii.local");
    const pressMatch = url.pathname.match(/\/s\/press\/([^/]+)\/?$/);
    if (pressMatch?.[1]) return decodeURIComponent(pressMatch[1]);
    const codeParam = url.searchParams.get("stampCode") ?? url.searchParams.get("code");
    if (codeParam) return codeParam.trim();
  } catch {
    // not a URL
  }
  if (/^[a-zA-Z0-9_-]{8,64}$/.test(text)) return text;
  return null;
}

export const STAMP_CARD_STORAGE_PREFIX = "infomii_stamp_card:";

/** sessionStorage: card token waiting for a system-camera press QR scan. */
export const STAMP_SCAN_PENDING_TOKEN_KEY = "infomii_stamp_scan_pending";
