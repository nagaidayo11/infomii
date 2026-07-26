import { canUseDevBusinessOverride } from "@/lib/dev-business-override";
import { planHasStampCards, resolvePlanTierFromSubscription } from "@/lib/plan-limits";
import { readBearerToken, requireSessionUser } from "@/lib/server/session-auth";
import {
  getSupabaseAdminServerClient,
  isSupabaseServiceRoleConfigured,
} from "@/lib/server/supabase-server";
import {
  DEFAULT_STAMP_TIMEZONE,
  getNextStampResetAt,
  getStampBusinessDayKey,
  normalizeStampTimezone,
} from "@/lib/stamp/day";
import { validatePressToken } from "@/lib/stamp/press";
import {
  STAMP_CAPACITY,
  canRedeemTier,
  normalizeStampCapacity,
  normalizeStampRewardTier,
  normalizeStampStyle,
  type StampRewardTier,
} from "@/lib/stamp/styles";
import type { StampCardView, StampProgramRow } from "@/lib/stamp/types";
import { createOpaqueToken, buildStampCardPath } from "@/lib/stamp/types";
import type { User } from "@supabase/supabase-js";

function programOncePerDay(program: StampProgramRow): boolean {
  if (typeof program.once_per_day === "boolean") return program.once_per_day;
  return (program.cooldown_hours ?? 24) > 0;
}

function programTimezone(program: StampProgramRow): string {
  return normalizeStampTimezone(program.timezone ?? DEFAULT_STAMP_TIMEZONE);
}

function programRewards(program: StampProgramRow) {
  const title5 =
    program.reward_title_5?.trim() ||
    (program.stamps_required <= 5 ? program.reward_title : "") ||
    "5個特典";
  const desc5 =
    program.reward_description_5 ??
    (program.stamps_required <= 5 ? program.reward_description : "") ??
    "";
  const title10 =
    program.reward_title_10?.trim() ||
    (program.stamps_required >= 10 ? program.reward_title : "") ||
    "10個特典";
  const desc10 =
    program.reward_description_10 ??
    (program.stamps_required >= 10 ? program.reward_description : "") ??
    "";
  return {
    rewardTitle5: title5,
    rewardDescription5: desc5,
    rewardTitle10: title10,
    rewardDescription10: desc10,
  };
}

export function requireStampService() {
  if (!isSupabaseServiceRoleConfigured()) {
    return { ok: false as const, status: 503, message: "サーバー設定不足です" };
  }
  return { ok: true as const, admin: getSupabaseAdminServerClient() };
}

export async function requireHotelMemberFromRequest(request: Request) {
  const auth = await requireSessionUser(readBearerToken(request));
  if (!auth.ok) return auth;

  const admin = getSupabaseAdminServerClient();
  const { data: membership } = await admin
    .from("hotel_memberships")
    .select("hotel_id, role")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!membership?.hotel_id) {
    return { ok: false as const, status: 403, message: "施設が選択されていません" };
  }

  return {
    ok: true as const,
    user: auth.user,
    hotelId: membership.hotel_id as string,
    role: membership.role as string,
    admin,
  };
}

export async function assertHotelHasStampAccess(hotelId: string, user: User) {
  const admin = getSupabaseAdminServerClient();
  const { data: sub } = await admin
    .from("subscriptions")
    .select("plan")
    .eq("hotel_id", hotelId)
    .maybeSingle();
  const plan = resolvePlanTierFromSubscription(sub?.plan);
  if (planHasStampCards(plan) || canUseDevBusinessOverride(user)) {
    return { ok: true as const, plan };
  }
  return {
    ok: false as const,
    status: 403,
    message: "スタンプカードはBusinessプランでご利用いただけます",
  };
}

export async function countActiveStamps(cardId: string): Promise<number> {
  const admin = getSupabaseAdminServerClient();
  const { data: lastRedeem } = await admin
    .from("stamp_redemptions")
    .select("created_at")
    .eq("card_id", cardId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let query = admin
    .from("stamp_events")
    .select("id", { count: "exact", head: true })
    .eq("card_id", cardId);

  if (lastRedeem?.created_at) {
    query = query.gt("created_at", lastRedeem.created_at);
  }

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function hasGuestStampOnDay(
  cardId: string,
  stampDay: string,
  timeZone: string = DEFAULT_STAMP_TIMEZONE,
): Promise<boolean> {
  const admin = getSupabaseAdminServerClient();
  const { count, error } = await admin
    .from("stamp_events")
    .select("id", { count: "exact", head: true })
    .eq("card_id", cardId)
    .eq("source", "guest_scan")
    .eq("stamp_day", stampDay);
  if (error) throw error;
  if ((count ?? 0) > 0) return true;

  // Legacy rows without stamp_day: infer business day from created_at.
  const { data: legacy, error: legacyError } = await admin
    .from("stamp_events")
    .select("created_at")
    .eq("card_id", cardId)
    .eq("source", "guest_scan")
    .is("stamp_day", null)
    .order("created_at", { ascending: false })
    .limit(40);
  if (legacyError) throw legacyError;
  return (legacy ?? []).some((row) => {
    const at = row.created_at ? new Date(String(row.created_at)) : null;
    if (!at || Number.isNaN(at.getTime())) return false;
    return getStampBusinessDayKey(at, timeZone) === stampDay;
  });
}

export async function loadProgramByPageSlug(slug: string) {
  const admin = getSupabaseAdminServerClient();
  const { data: page } = await admin
    .from("pages")
    .select("id, slug, title, kind, hotel_id")
    .eq("slug", slug)
    .maybeSingle();
  if (!page || page.kind !== "stamp") return null;

  const { data: info } = await admin
    .from("informations")
    .select("status")
    .eq("slug", slug)
    .maybeSingle();

  const { data: program } = await admin
    .from("stamp_programs")
    .select("*")
    .eq("page_id", page.id)
    .maybeSingle();

  if (!program) return null;
  return {
    page,
    program: program as StampProgramRow,
    publishStatus: (info?.status as "draft" | "published" | undefined) ?? "draft",
  };
}

export async function loadCardView(token: string): Promise<StampCardView | null> {
  const admin = getSupabaseAdminServerClient();
  const { data: card } = await admin
    .from("stamp_cards")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (!card || card.status !== "active") return null;

  const { data: program } = await admin
    .from("stamp_programs")
    .select("*")
    .eq("id", card.program_id)
    .maybeSingle();
  if (!program) return null;

  const { data: page } = await admin
    .from("pages")
    .select("slug")
    .eq("id", program.page_id)
    .maybeSingle();

  const stampCount = await countActiveStamps(card.id);
  const capacity = normalizeStampCapacity(program.stamps_required);
  const prog = program as StampProgramRow;
  const rewards = programRewards(prog);
  const pendingTier = normalizeStampRewardTier(
    (card as { pending_redeem_tier?: number | null }).pending_redeem_tier,
  );

  let nextStampAt: string | null = null;
  const oncePerDay = programOncePerDay(prog);
  const timezone = programTimezone(prog);
  if (oncePerDay) {
    const today = getStampBusinessDayKey(new Date(), timezone);
    if (await hasGuestStampOnDay(card.id, today, timezone)) {
      nextStampAt = getNextStampResetAt(new Date(), timezone).toISOString();
    }
  }

  return {
    token: card.token,
    stampCount,
    stampsRequired: capacity,
    pendingRedeem: Boolean(card.pending_redeem),
    pendingRedeemTier: pendingTier,
    isFull: stampCount >= capacity,
    canRedeem5: canRedeemTier(stampCount, 5),
    canRedeem10: canRedeemTier(stampCount, 10),
    nextStampAt,
    linkedToAccount: Boolean(
      (card as { owner_user_id?: string | null }).owner_user_id,
    ),
    program: {
      id: prog.id,
      title: prog.title,
      description: prog.description,
      ...rewards,
      accentColor: prog.accent_color,
      stampStyle: normalizeStampStyle(prog.stamp_style ?? "seal"),
      oncePerDay,
      timezone,
      pageSlug: page?.slug ?? "",
    },
  };
}

export async function issueCardForProgram(
  program: StampProgramRow,
  opts?: { ownerUserId?: string | null },
) {
  const admin = getSupabaseAdminServerClient();
  const token = createOpaqueToken(18);
  const { data, error } = await admin
    .from("stamp_cards")
    .insert({
      program_id: program.id,
      hotel_id: program.hotel_id,
      token,
      status: "active",
      pending_redeem: false,
      owner_user_id: opts?.ownerUserId ?? null,
    })
    .select("*")
    .single();
  if (error || !data) throw error ?? new Error("カード発行に失敗しました");
  return data;
}

export async function applyStamp(args: {
  cardToken: string;
  stampCode: string;
  source: "guest_scan" | "staff_manual";
  staffUserId?: string | null;
}) {
  const admin = getSupabaseAdminServerClient();
  const { data: card } = await admin
    .from("stamp_cards")
    .select("*")
    .eq("token", args.cardToken)
    .maybeSingle();
  if (!card || card.status !== "active") {
    return { ok: false as const, status: 404, message: "カードが見つかりません" };
  }

  const { data: program } = await admin
    .from("stamp_programs")
    .select("*")
    .eq("id", card.program_id)
    .maybeSingle();
  if (!program || program.status !== "published") {
    return { ok: false as const, status: 403, message: "このスタンプカードは公開されていません" };
  }

  if (args.source === "guest_scan") {
    const rotating = Boolean((program as { rotating_qr?: boolean }).rotating_qr);
    const valid = rotating
      ? validatePressToken(program.stamp_code, program.id, args.stampCode)
      : program.stamp_code === args.stampCode;
    if (!valid) {
      return {
        ok: false as const,
        status: 400,
        message: rotating
          ? "押印QRの有効期限が切れています。スタッフの最新QRを読み取ってください"
          : "押印QRが正しくありません",
      };
    }
  }

  if (card.pending_redeem) {
    return {
      ok: false as const,
      status: 409,
      message: "特典提示中です。スタッフの確認後にまたスタンプできます",
    };
  }

  const stampCount = await countActiveStamps(card.id);
  const capacity = normalizeStampCapacity(program.stamps_required);
  if (stampCount >= capacity) {
    return {
      ok: false as const,
      status: 409,
      message: "スタンプが満タンです。5個または10個の特典を選んでスタッフにご提示ください",
    };
  }

  if (args.source === "guest_scan" && programOncePerDay(program as StampProgramRow)) {
    const timezone = programTimezone(program as StampProgramRow);
    const stampDay = getStampBusinessDayKey(new Date(), timezone);
    if (await hasGuestStampOnDay(card.id, stampDay, timezone)) {
      const nextAt = getNextStampResetAt(new Date(), timezone);
      const label = nextAt.toLocaleString("ja-JP", {
        timeZone: timezone,
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return {
        ok: false as const,
        status: 429,
        message: `本日のスタンプは済みです。次は ${label} 以降にまたどうぞ`,
      };
    }

    const { error } = await admin.from("stamp_events").insert({
      card_id: card.id,
      program_id: program.id,
      hotel_id: program.hotel_id,
      source: args.source,
      created_by: args.staffUserId ?? null,
      stamp_day: stampDay,
    });
    if (error) {
      if (error.code === "23505") {
        return {
          ok: false as const,
          status: 429,
          message: "本日のスタンプは済みです。明日またどうぞ",
        };
      }
      return { ok: false as const, status: 500, message: "スタンプの付与に失敗しました" };
    }
  } else {
    const { error } = await admin.from("stamp_events").insert({
      card_id: card.id,
      program_id: program.id,
      hotel_id: program.hotel_id,
      source: args.source,
      created_by: args.staffUserId ?? null,
    });
    if (error) {
      return { ok: false as const, status: 500, message: "スタンプの付与に失敗しました" };
    }
  }

  const nextCount = stampCount + 1;
  return {
    ok: true as const,
    stampCount: nextCount,
    stampsRequired: capacity,
    isFull: nextCount >= capacity,
    canRedeem5: canRedeemTier(nextCount, 5),
    canRedeem10: canRedeemTier(nextCount, 10),
  };
}

/**
 * Redeem `tier` stamps atomically; keep remainder (e.g. 7→use 5→leave 2).
 * Uses a row-locked DB function so concurrent taps cannot double-redeem.
 */
async function applyRedeemAndCarryover(args: {
  cardId: string;
  tier: StampRewardTier;
  confirmedBy: string | null;
}) {
  const admin = getSupabaseAdminServerClient();

  type RedeemRpc = (
    name: "stamp_redeem_atomic",
    params: { p_card_id: string; p_tier: number; p_confirmed_by: string | null },
  ) => Promise<{ data: number | null; error: { message?: string } | null }>;
  const rpc = admin.rpc as unknown as RedeemRpc;

  const { data, error } = await rpc("stamp_redeem_atomic", {
    p_card_id: args.cardId,
    p_tier: args.tier,
    p_confirmed_by: args.confirmedBy,
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("INSUFFICIENT")) {
      return { ok: false as const, message: "スタンプが不足しています" };
    }
    if (msg.includes("CARD_NOT_FOUND")) {
      return { ok: false as const, message: "カードが見つかりません" };
    }
    return { ok: false as const, message: "特典の使用に失敗しました" };
  }

  return { ok: true as const, stampCount: data ?? 0 };
}

export async function guestRedeem(cardToken: string, tier: StampRewardTier) {
  const admin = getSupabaseAdminServerClient();
  const { data: card } = await admin
    .from("stamp_cards")
    .select("*")
    .eq("token", cardToken)
    .maybeSingle();
  if (!card || card.status !== "active") {
    return { ok: false as const, status: 404, message: "カードが見つかりません" };
  }

  const stampCount = await countActiveStamps(card.id);
  if (!canRedeemTier(stampCount, tier)) {
    return {
      ok: false as const,
      status: 400,
      message: `まだスタンプが足りません（${tier}個必要）`,
    };
  }

  const { data: program } = await admin
    .from("stamp_programs")
    .select("*")
    .eq("id", card.program_id)
    .maybeSingle();
  if (!program || program.status !== "published") {
    return { ok: false as const, status: 403, message: "このスタンプカードは公開されていません" };
  }

  const applied = await applyRedeemAndCarryover({
    cardId: card.id,
    tier,
    confirmedBy: null,
  });
  if (!applied.ok) {
    const status = applied.message === "スタンプが不足しています" ? 400 : 500;
    return { ok: false as const, status, message: applied.message };
  }

  const view = await loadCardView(cardToken);
  if (!view) {
    return { ok: true as const, stampCount: applied.stampCount, view: null };
  }
  return { ok: true as const, stampCount: applied.stampCount, view };
}

export async function requestRedeem(cardToken: string, tier: StampRewardTier) {
  const admin = getSupabaseAdminServerClient();
  const view = await loadCardView(cardToken);
  if (!view) return { ok: false as const, status: 404, message: "カードが見つかりません" };
  if (!canRedeemTier(view.stampCount, tier)) {
    return {
      ok: false as const,
      status: 400,
      message: `まだスタンプが足りません（${tier}個必要）`,
    };
  }

  const { error } = await admin
    .from("stamp_cards")
    .update({
      pending_redeem: true,
      pending_redeem_tier: tier,
      updated_at: new Date().toISOString(),
    })
    .eq("token", cardToken);
  if (error) return { ok: false as const, status: 500, message: "提示状態の更新に失敗しました" };
  return {
    ok: true as const,
    view: { ...view, pendingRedeem: true, pendingRedeemTier: tier },
  };
}

export async function confirmRedeem(args: {
  cardToken: string;
  staffUserId: string;
  hotelId: string;
}) {
  const admin = getSupabaseAdminServerClient();
  const { data: card } = await admin
    .from("stamp_cards")
    .select("*")
    .eq("token", args.cardToken)
    .maybeSingle();
  if (!card || card.hotel_id !== args.hotelId) {
    return { ok: false as const, status: 404, message: "カードが見つかりません" };
  }

  const stampCount = await countActiveStamps(card.id);
  const { data: program } = await admin
    .from("stamp_programs")
    .select("*")
    .eq("id", card.program_id)
    .maybeSingle();
  if (!program) return { ok: false as const, status: 404, message: "プログラムが見つかりません" };

  const tier =
    normalizeStampRewardTier(
      (card as { pending_redeem_tier?: number | null }).pending_redeem_tier,
    ) ?? (stampCount >= 10 ? 10 : stampCount >= 5 ? 5 : null);

  if (!tier || stampCount < tier) {
    return { ok: false as const, status: 400, message: "交換可能なスタンプ数ではありません" };
  }

  const applied = await applyRedeemAndCarryover({
    cardId: card.id,
    tier,
    confirmedBy: args.staffUserId,
  });
  if (!applied.ok) {
    const status = applied.message === "スタンプが不足しています" ? 400 : 500;
    return { ok: false as const, status, message: applied.message };
  }

  return { ok: true as const, stampCount: applied.stampCount };
}

export async function reissueCard(args: { cardToken: string; hotelId: string }) {
  const admin = getSupabaseAdminServerClient();
  const { data: oldCard } = await admin
    .from("stamp_cards")
    .select("*")
    .eq("token", args.cardToken)
    .maybeSingle();
  if (!oldCard || oldCard.hotel_id !== args.hotelId) {
    return { ok: false as const, status: 404, message: "カードが見つかりません" };
  }

  await admin
    .from("stamp_cards")
    .update({ status: "revoked", updated_at: new Date().toISOString() })
    .eq("id", oldCard.id);

  const { data: program } = await admin
    .from("stamp_programs")
    .select("*")
    .eq("id", oldCard.program_id)
    .single();
  if (!program) return { ok: false as const, status: 404, message: "プログラムが見つかりません" };

  const ownerUserId =
    (oldCard as { owner_user_id?: string | null }).owner_user_id ?? null;
  const next = await issueCardForProgram(program as StampProgramRow, {
    ownerUserId,
  });
  return { ok: true as const, token: next.token };
}

/** Find active card linked to this auth user for a program (by page slug). */
export async function findLinkedCardForUser(args: {
  userId: string;
  slug: string;
}) {
  const loaded = await loadProgramByPageSlug(args.slug);
  if (!loaded || loaded.publishStatus !== "published" || loaded.program.status !== "published") {
    return { ok: false as const, status: 404, message: "スタンプカードが見つからないか、未公開です" };
  }

  const admin = getSupabaseAdminServerClient();
  const { data: card } = await admin
    .from("stamp_cards")
    .select("token")
    .eq("program_id", loaded.program.id)
    .eq("owner_user_id", args.userId)
    .eq("status", "active")
    .maybeSingle();

  if (!card?.token) {
    return { ok: true as const, linked: false as const, program: loaded.program };
  }

  return {
    ok: true as const,
    linked: true as const,
    token: card.token as string,
    path: buildStampCardPath(card.token as string),
    program: loaded.program,
  };
}

async function linkCurrentCard(cardId: string, cardToken: string, userId: string) {
  const admin = getSupabaseAdminServerClient();
  const { error } = await admin
    .from("stamp_cards")
    .update({ owner_user_id: userId, updated_at: new Date().toISOString() })
    .eq("id", cardId)
    .is("owner_user_id", null);
  if (error) {
    return { ok: false as const, status: 500, message: "カードの保存に失敗しました" };
  }
  return {
    ok: true as const,
    token: cardToken,
    path: buildStampCardPath(cardToken),
    alreadyLinked: false as const,
    switchedToExisting: false as const,
    view: await loadCardView(cardToken),
  };
}

/**
 * Link current card token to an auth user for restore.
 * If the user already has another active card for the same program, the caller
 * must decide via `resolve` which one to keep (returns a conflict otherwise).
 */
export async function linkCardToUser(args: {
  cardToken: string;
  userId: string;
  resolve?: "current" | "existing";
}) {
  const admin = getSupabaseAdminServerClient();
  const { data: card } = await admin
    .from("stamp_cards")
    .select("*")
    .eq("token", args.cardToken)
    .maybeSingle();
  if (!card || card.status !== "active") {
    return { ok: false as const, status: 404, message: "カードが見つかりません" };
  }

  const existingOwner = (card as { owner_user_id?: string | null }).owner_user_id;
  if (existingOwner && existingOwner === args.userId) {
    return {
      ok: true as const,
      token: args.cardToken,
      path: buildStampCardPath(args.cardToken),
      alreadyLinked: true as const,
      switchedToExisting: false as const,
      view: await loadCardView(args.cardToken),
    };
  }
  if (existingOwner && existingOwner !== args.userId) {
    return {
      ok: false as const,
      status: 409,
      message: "このカードは別のアカウントに保存済みです",
    };
  }

  const { data: other } = await admin
    .from("stamp_cards")
    .select("id, token")
    .eq("program_id", card.program_id)
    .eq("owner_user_id", args.userId)
    .eq("status", "active")
    .maybeSingle();

  if (other?.token && other.token !== args.cardToken) {
    // The user already has a saved card. Ask which one to keep unless resolved.
    if (args.resolve === "existing") {
      return {
        ok: true as const,
        token: other.token as string,
        path: buildStampCardPath(other.token as string),
        alreadyLinked: false as const,
        switchedToExisting: true as const,
        view: await loadCardView(other.token as string),
      };
    }
    if (args.resolve === "current") {
      // Free the unique (program_id, owner) slot by revoking the saved card, then link current.
      await admin
        .from("stamp_cards")
        .update({ status: "revoked", updated_at: new Date().toISOString() })
        .eq("id", other.id as string);
      return linkCurrentCard(card.id, args.cardToken, args.userId);
    }

    const currentCount = await countActiveStamps(card.id);
    const existingCount = await countActiveStamps(other.id as string);
    return {
      ok: true as const,
      conflict: true as const,
      current: {
        token: args.cardToken,
        path: buildStampCardPath(args.cardToken),
        stampCount: currentCount,
      },
      existing: {
        token: other.token as string,
        path: buildStampCardPath(other.token as string),
        stampCount: existingCount,
      },
    };
  }

  const linked = await linkCurrentCard(card.id, args.cardToken, args.userId);
  if (!linked.ok && "status" in linked) {
    // Unique race: someone linked another card meanwhile — fall back to that card.
    const { data: again } = await admin
      .from("stamp_cards")
      .select("token")
      .eq("program_id", card.program_id)
      .eq("owner_user_id", args.userId)
      .eq("status", "active")
      .maybeSingle();
    if (again?.token) {
      return {
        ok: true as const,
        token: again.token as string,
        path: buildStampCardPath(again.token as string),
        alreadyLinked: false as const,
        switchedToExisting: true as const,
        view: await loadCardView(again.token as string),
      };
    }
  }
  return linked;
}

