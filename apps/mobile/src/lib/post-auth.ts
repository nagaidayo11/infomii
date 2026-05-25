import { saveItinerary, targetFromKey } from "@/lib/information-saves-api";
import { redeemHotelInvite } from "@/lib/hotel-invite";
import { ensureUserHotelScope, ensureUserHotelScopeForOnboarding } from "@/lib/hotel-scope";
import { formatHotelInviteRedeemError } from "@/lib/invite-redeem-errors";
import {
  clearPendingInviteCode,
  consumeOnboardingScopeBootstrap,
  readPendingInviteCode,
  releaseInviteRedeemLock,
  setHomeInviteErrorFlash,
  setHomeInviteSuccessFlash,
  tryAcquireInviteRedeemLock,
} from "@/lib/invite-pending";
import {
  consumePendingPublishAfterAuth,
  consumePendingSave,
} from "@/lib/pending-auth";
import type { Href } from "expo-router";

type AuthRouter = {
  replace: (href: Href) => void;
};

async function redeemPendingInviteIfAny(): Promise<boolean> {
  const pending = await readPendingInviteCode();
  if (!pending) return false;

  const acquired = await tryAcquireInviteRedeemLock();
  if (!acquired) return true;

  try {
    await redeemHotelInvite(pending);
    await clearPendingInviteCode();
    await setHomeInviteSuccessFlash();
  } catch (e) {
    await clearPendingInviteCode();
    await setHomeInviteErrorFlash(formatHotelInviteRedeemError(e));
  } finally {
    await releaseInviteRedeemLock();
  }
  return true;
}

async function ensureScopeWhenNoMembership(): Promise<void> {
  const existing = await ensureUserHotelScope();
  if (existing) {
    await consumeOnboardingScopeBootstrap();
    return;
  }

  await consumeOnboardingScopeBootstrap();
  try {
    await ensureUserHotelScopeForOnboarding();
  } catch {
    /* ignore */
  }
}

/** ログイン直後（Web `/login` の post-auth と同順） */
export async function completeAfterLogin(router: AuthRouter): Promise<void> {
  const hadInvite = await redeemPendingInviteIfAny();
  if (hadInvite) {
    router.replace("/(tabs)");
    return;
  }

  await ensureScopeWhenNoMembership();

  const pendingSave = await consumePendingSave();
  if (pendingSave) {
    const target = targetFromKey(pendingSave.saveKey);
    if (target) {
      try {
        await saveItinerary(target);
      } catch {
        /* ignore */
      }
    }
    router.replace(pendingSave.returnPath as Href);
    return;
  }

  if (await consumePendingPublishAfterAuth()) {
    router.replace("/(tabs)/create");
    return;
  }

  router.replace("/(tabs)");
}

/** セッション復元・OAuth 復帰時（招待 redeem のみ、なければ施設スコープ） */
export async function runSessionBootstrap(router: AuthRouter): Promise<void> {
  const hadInvite = await redeemPendingInviteIfAny();
  if (hadInvite) return;

  await ensureScopeWhenNoMembership();
}
