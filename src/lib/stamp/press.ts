/** Server-side rotating press token (defeats photo-sharing of a static QR). */

import { createHmac } from "crypto";

/** Rotation window in seconds. Accepted range = current + previous bucket. */
export const PRESS_ROTATE_PERIOD_SEC = 90;

function bucketFor(nowMs: number, periodSec: number): number {
  return Math.floor(nowMs / 1000 / periodSec);
}

function tokenForBucket(secret: string, programId: string, bucket: number): string {
  return createHmac("sha256", secret)
    .update(`${programId}:${bucket}`)
    .digest("hex")
    .slice(0, 10);
}

/** Current rotating token + ms remaining until it rotates. */
export function currentPressToken(
  secret: string,
  programId: string,
  nowMs: number = Date.now(),
): { code: string; expiresInMs: number; periodMs: number } {
  const periodMs = PRESS_ROTATE_PERIOD_SEC * 1000;
  const bucket = bucketFor(nowMs, PRESS_ROTATE_PERIOD_SEC);
  const code = tokenForBucket(secret, programId, bucket);
  const nextBoundary = (bucket + 1) * periodMs;
  return { code, expiresInMs: Math.max(0, nextBoundary - nowMs), periodMs };
}

/** Accept the current and previous bucket to tolerate scan delay / minor skew. */
export function validatePressToken(
  secret: string,
  programId: string,
  submitted: string,
  nowMs: number = Date.now(),
): boolean {
  const value = submitted.trim().toLowerCase();
  if (!value) return false;
  const bucket = bucketFor(nowMs, PRESS_ROTATE_PERIOD_SEC);
  for (const b of [bucket, bucket - 1, bucket + 1]) {
    if (tokenForBucket(secret, programId, b) === value) return true;
  }
  return false;
}
