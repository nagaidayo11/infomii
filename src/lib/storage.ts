import type {
  Information,
  InformationBlock,
  InformationStatus,
  InformationTheme,
} from "@/types/information";
import { createSlug } from "@/lib/slug";
import { starterTemplates, type StarterTemplate } from "@/lib/templates";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

const LOCAL_STORAGE_KEY = "hotel-informations";

function toError(error: unknown, fallback: string): Error {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === "object" && error && "message" in error) {
    const message = String((error as { message?: unknown }).message ?? fallback);
    return new Error(message);
  }
  return new Error(fallback);
}

type SupabaseInformationRow = {
  id: string;
  title: string;
  body: string;
  images: string[] | null;
  content_blocks: unknown;
  theme: unknown;
  status: InformationStatus;
  publish_at: string | null;
  unpublish_at: string | null;
  slug: string;
  updated_at: string;
};

function normalizeBlocks(value: unknown, fallbackBody: string): InformationBlock[] {
  if (Array.isArray(value) && value.length > 0) {
    return value
      .map((item, index) => {
        if (!item || typeof item !== "object") {
          return null;
        }
        const block = item as Partial<InformationBlock>;
        const type = block.type;
        if (
          type !== "title" &&
          type !== "heading" &&
          type !== "paragraph" &&
          type !== "image" &&
          type !== "divider" &&
          type !== "icon" &&
          type !== "space" &&
          type !== "section" &&
          type !== "columns" &&
          type !== "iconRow" &&
          type !== "cta" &&
          type !== "badge" &&
          type !== "hours" &&
          type !== "pricing" &&
          type !== "quote" &&
          type !== "checklist" &&
          type !== "gallery" &&
          type !== "columnGroup"
        ) {
          return null;
        }
        return {
          id: typeof block.id === "string" && block.id ? block.id : `block-${index + 1}`,
          type,
          text: typeof block.text === "string" ? block.text : undefined,
          url: typeof block.url === "string" ? block.url : undefined,
          icon: typeof block.icon === "string" ? block.icon : undefined,
          iconSize:
            block.iconSize === "sm" ||
            block.iconSize === "md" ||
            block.iconSize === "lg" ||
            block.iconSize === "xl"
              ? block.iconSize
              : undefined,
          label: typeof block.label === "string" ? block.label : undefined,
          description:
            typeof block.description === "string" ? block.description : undefined,
          textSize:
            block.textSize === "sm" || block.textSize === "md" || block.textSize === "lg"
              ? block.textSize
              : undefined,
          fontFamily: typeof block.fontFamily === "string" ? block.fontFamily : undefined,
          textColor: typeof block.textColor === "string" ? block.textColor : undefined,
          textWeight:
            block.textWeight === "normal" ||
            block.textWeight === "medium" ||
            block.textWeight === "semibold"
              ? block.textWeight
              : undefined,
          textAlign:
            block.textAlign === "left" ||
            block.textAlign === "center" ||
            block.textAlign === "right"
              ? block.textAlign
              : undefined,
          spacing:
            block.spacing === "sm" || block.spacing === "md" || block.spacing === "lg"
              ? block.spacing
              : undefined,
          dividerThickness:
            block.dividerThickness === "thin" ||
            block.dividerThickness === "medium" ||
            block.dividerThickness === "thick"
              ? block.dividerThickness
              : undefined,
          dividerColor: typeof block.dividerColor === "string" ? block.dividerColor : undefined,
          cardRadius:
            block.cardRadius === "sm" ||
            block.cardRadius === "md" ||
            block.cardRadius === "lg" ||
            block.cardRadius === "xl" ||
            block.cardRadius === "full"
              ? block.cardRadius
              : undefined,
          sectionTitle: typeof block.sectionTitle === "string" ? block.sectionTitle : undefined,
          sectionBody: typeof block.sectionBody === "string" ? block.sectionBody : undefined,
          sectionBackgroundColor:
            typeof block.sectionBackgroundColor === "string" ? block.sectionBackgroundColor : undefined,
          leftTitle: typeof block.leftTitle === "string" ? block.leftTitle : undefined,
          leftText: typeof block.leftText === "string" ? block.leftText : undefined,
          rightTitle: typeof block.rightTitle === "string" ? block.rightTitle : undefined,
          rightText: typeof block.rightText === "string" ? block.rightText : undefined,
          columnsBackgroundColor:
            typeof block.columnsBackgroundColor === "string" ? block.columnsBackgroundColor : undefined,
          iconRowBackgroundColor:
            typeof block.iconRowBackgroundColor === "string" ? block.iconRowBackgroundColor : undefined,
          iconItems: Array.isArray(block.iconItems)
            ? block.iconItems
                .map((entry, itemIndex) => {
                  if (!entry || typeof entry !== "object") {
                    return null;
                  }
                  const item = entry as {
                    id?: unknown;
                    icon?: unknown;
                    label?: unknown;
                    nodeId?: unknown;
                    link?: unknown;
                    backgroundColor?: unknown;
                  };
                  return {
                    id:
                      typeof item.id === "string" && item.id
                        ? item.id
                        : `icon-item-${itemIndex + 1}`,
                    icon: typeof item.icon === "string" ? item.icon : "⭐",
                    label: typeof item.label === "string" ? item.label : "",
                    nodeId: typeof item.nodeId === "string" ? item.nodeId : "",
                    link: typeof item.link === "string" ? item.link : "",
                    backgroundColor:
                      typeof item.backgroundColor === "string" ? item.backgroundColor : "#ffffff",
                  };
                })
                .filter(
                  (entry): entry is {
                    id: string;
                    icon: string;
                    label: string;
                    nodeId: string;
                    link: string;
                    backgroundColor: string;
                  } =>
                    Boolean(entry),
                )
            : undefined,
          ctaLabel: typeof block.ctaLabel === "string" ? block.ctaLabel : undefined,
          ctaUrl: typeof block.ctaUrl === "string" ? block.ctaUrl : undefined,
          badgeText: typeof block.badgeText === "string" ? block.badgeText : undefined,
          badgeColor: typeof block.badgeColor === "string" ? block.badgeColor : undefined,
          badgeTextColor: typeof block.badgeTextColor === "string" ? block.badgeTextColor : undefined,
          hoursItems: Array.isArray(block.hoursItems)
            ? block.hoursItems
                .map((entry, itemIndex) => {
                  if (!entry || typeof entry !== "object") {
                    return null;
                  }
                  const item = entry as { id?: unknown; label?: unknown; value?: unknown };
                  return {
                    id:
                      typeof item.id === "string" && item.id
                        ? item.id
                        : `hours-item-${itemIndex + 1}`,
                    label: typeof item.label === "string" ? item.label : "",
                    value: typeof item.value === "string" ? item.value : "",
                  };
                })
                .filter(
                  (entry): entry is { id: string; label: string; value: string } =>
                    Boolean(entry),
                )
            : undefined,
          pricingItems: Array.isArray(block.pricingItems)
            ? block.pricingItems
                .map((entry, itemIndex) => {
                  if (!entry || typeof entry !== "object") {
                    return null;
                  }
                  const item = entry as { id?: unknown; label?: unknown; value?: unknown };
                  return {
                    id:
                      typeof item.id === "string" && item.id
                        ? item.id
                        : `pricing-item-${itemIndex + 1}`,
                    label: typeof item.label === "string" ? item.label : "",
                    value: typeof item.value === "string" ? item.value : "",
                  };
                })
                .filter(
                  (entry): entry is { id: string; label: string; value: string } =>
                    Boolean(entry),
                )
            : undefined,
          quoteAuthor: typeof block.quoteAuthor === "string" ? block.quoteAuthor : undefined,
          checklistItems: Array.isArray(block.checklistItems)
            ? block.checklistItems
                .map((entry, itemIndex) => {
                  if (!entry || typeof entry !== "object") {
                    return null;
                  }
                  const item = entry as { id?: unknown; text?: unknown };
                  return {
                    id:
                      typeof item.id === "string" && item.id
                        ? item.id
                        : `check-item-${itemIndex + 1}`,
                    text: typeof item.text === "string" ? item.text : "",
                  };
                })
                .filter((entry): entry is { id: string; text: string } => Boolean(entry))
            : undefined,
          galleryItems: Array.isArray(block.galleryItems)
            ? block.galleryItems
                .map((entry, itemIndex) => {
                  if (!entry || typeof entry !== "object") {
                    return null;
                  }
                  const item = entry as { id?: unknown; url?: unknown; caption?: unknown };
                  return {
                    id:
                      typeof item.id === "string" && item.id
                        ? item.id
                        : `gallery-item-${itemIndex + 1}`,
                    url: typeof item.url === "string" ? item.url : "",
                    caption: typeof item.caption === "string" ? item.caption : "",
                  };
                })
                .filter((entry): entry is { id: string; url: string; caption: string } => Boolean(entry))
            : undefined,
          columnGroupItems: Array.isArray(block.columnGroupItems)
            ? block.columnGroupItems
                .map((entry, itemIndex) => {
                  if (!entry || typeof entry !== "object") {
                    return null;
                  }
                  const item = entry as { id?: unknown; title?: unknown; body?: unknown };
                  return {
                    id:
                      typeof item.id === "string" && item.id
                        ? item.id
                        : `column-group-item-${itemIndex + 1}`,
                    title: typeof item.title === "string" ? item.title : "",
                    body: typeof item.body === "string" ? item.body : "",
                  };
                })
                .filter((entry): entry is { id: string; title: string; body: string } => Boolean(entry))
            : undefined,
        } as InformationBlock;
      })
      .filter((block): block is InformationBlock => Boolean(block));
  }

  const body = fallbackBody.trim();
  if (!body) {
    return [
      {
        id: "block-1",
        type: "paragraph",
        text: "",
      },
    ];
  }

  return body.split(/\n{2,}/).map((text, index) => ({
    id: `block-${index + 1}`,
    type: "paragraph",
    text: text.trim(),
  }));
}

function normalizeTheme(value: unknown): InformationTheme {
  if (!value || typeof value !== "object") {
    return {};
  }
  const theme = value as Record<string, unknown>;
  const nodeMapRaw = theme.nodeMap;
  const nodeMap =
    nodeMapRaw && typeof nodeMapRaw === "object"
      ? (() => {
          const map = nodeMapRaw as {
            enabled?: unknown;
            nodes?: unknown;
            edges?: unknown;
          };
          const nodes = Array.isArray(map.nodes)
            ? map.nodes
                .map((entry, index) => {
                  if (!entry || typeof entry !== "object") {
                    return null;
                  }
                  const node = entry as {
                    id?: unknown;
                    title?: unknown;
                    icon?: unknown;
                    x?: unknown;
                    y?: unknown;
                    targetSlug?: unknown;
                  };
                  const x = typeof node.x === "number" ? node.x : 50;
                  const y = typeof node.y === "number" ? node.y : 50;
                  return {
                    id:
                      typeof node.id === "string" && node.id
                        ? node.id
                        : `node-${index + 1}`,
                    title: typeof node.title === "string" ? node.title : "ページ",
                    icon: typeof node.icon === "string" ? node.icon : "📄",
                    x: Math.min(98, Math.max(2, x)),
                    y: Math.min(98, Math.max(2, y)),
                    targetSlug:
                      typeof node.targetSlug === "string" ? node.targetSlug : "",
                  };
                })
                .filter(
                  (
                    entry,
                  ): entry is {
                    id: string;
                    title: string;
                    icon: string;
                    x: number;
                    y: number;
                    targetSlug: string;
                  } => Boolean(entry),
                )
            : [];
          const edges = Array.isArray(map.edges)
            ? map.edges
                .map((entry, index) => {
                  if (!entry || typeof entry !== "object") {
                    return null;
                  }
                  const edge = entry as { id?: unknown; from?: unknown; to?: unknown };
                  if (typeof edge.from !== "string" || typeof edge.to !== "string") {
                    return null;
                  }
                  return {
                    id:
                      typeof edge.id === "string" && edge.id
                        ? edge.id
                        : `edge-${index + 1}`,
                    from: edge.from,
                    to: edge.to,
                  };
                })
                .filter((entry): entry is { id: string; from: string; to: string } => Boolean(entry))
            : [];
          return {
            enabled: map.enabled === true,
            nodes,
            edges,
          };
        })()
      : undefined;

  return {
    backgroundColor:
      typeof theme.backgroundColor === "string" ? theme.backgroundColor : undefined,
    textColor: typeof theme.textColor === "string" ? theme.textColor : undefined,
    fontFamily: typeof theme.fontFamily === "string" ? theme.fontFamily : undefined,
    titleSize:
      theme.titleSize === "sm" || theme.titleSize === "md" || theme.titleSize === "lg"
        ? theme.titleSize
        : undefined,
    titleColor: typeof theme.titleColor === "string" ? theme.titleColor : undefined,
    titleWeight:
      theme.titleWeight === "normal" ||
      theme.titleWeight === "medium" ||
      theme.titleWeight === "semibold"
        ? theme.titleWeight
        : undefined,
    titleAlign:
      theme.titleAlign === "left" || theme.titleAlign === "center" || theme.titleAlign === "right"
        ? theme.titleAlign
        : undefined,
    bodySize:
      theme.bodySize === "sm" || theme.bodySize === "md" || theme.bodySize === "lg"
        ? theme.bodySize
        : undefined,
    nodeMap,
  };
}

function blocksToBody(blocks: InformationBlock[]): string {
  return blocks
    .filter(
      (block) =>
        block.type === "title" ||
        block.type === "heading" ||
        block.type === "paragraph" ||
        block.type === "icon" ||
        block.type === "section" ||
        block.type === "columns" ||
        block.type === "iconRow" ||
        block.type === "cta" ||
        block.type === "badge" ||
        block.type === "hours" ||
        block.type === "pricing" ||
        block.type === "quote" ||
        block.type === "checklist" ||
        block.type === "columnGroup",
    )
    .map((block) => {
      if (block.type === "icon") {
        return [block.label?.trim(), block.description?.trim()].filter(Boolean).join("\n");
      }
      if (block.type === "section") {
        return [block.sectionTitle?.trim(), block.sectionBody?.trim()].filter(Boolean).join("\n");
      }
      if (block.type === "columns") {
        return [
          block.leftTitle?.trim(),
          block.leftText?.trim(),
          block.rightTitle?.trim(),
          block.rightText?.trim(),
        ]
          .filter(Boolean)
          .join("\n");
      }
      if (block.type === "iconRow") {
        return (block.iconItems ?? [])
          .map((entry) => entry.label.trim())
          .filter(Boolean)
          .join(" / ");
      }
      if (block.type === "cta") {
        return [block.ctaLabel?.trim(), block.ctaUrl?.trim()].filter(Boolean).join("\n");
      }
      if (block.type === "badge") {
        return block.badgeText?.trim() ?? "";
      }
      if (block.type === "hours") {
        return (block.hoursItems ?? [])
          .map((entry) => `${entry.label.trim()} ${entry.value.trim()}`.trim())
          .filter(Boolean)
          .join("\n");
      }
      if (block.type === "pricing") {
        return (block.pricingItems ?? [])
          .map((entry) => `${entry.label.trim()} ${entry.value.trim()}`.trim())
          .filter(Boolean)
          .join("\n");
      }
      if (block.type === "quote") {
        return [block.text?.trim(), block.quoteAuthor?.trim()].filter(Boolean).join("\n");
      }
      if (block.type === "checklist") {
        return (block.checklistItems ?? [])
          .map((entry) => entry.text.trim())
          .filter(Boolean)
          .join("\n");
      }
      if (block.type === "columnGroup") {
        return (block.columnGroupItems ?? [])
          .flatMap((entry) => [entry.title.trim(), entry.body.trim()])
          .filter(Boolean)
          .join("\n");
      }
      return block.text?.trim() ?? "";
    })
    .filter(Boolean)
    .join("\n\n");
}

function blocksToImages(blocks: InformationBlock[]): string[] {
  return blocks
    .flatMap((block) => {
      if (block.type === "image" && typeof block.url === "string") {
        return [block.url];
      }
      if (block.type === "gallery") {
        return (block.galleryItems ?? [])
          .map((entry) => entry.url.trim())
          .filter(Boolean);
      }
      return [];
    })
    .slice(0, 3);
}

export type SubscriptionPlan = "free" | "pro";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled";

export type HotelSubscription = {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  maxPublishedPages: number;
  currentPeriodEnd: string | null;
  hasStripeCustomer: boolean;
  updatedAt: string;
};

export type HotelViewMetrics = {
  totalViews7d: number;
  qrViews7d: number;
  totalViewsToday: number;
  qrViewsToday: number;
  topPages: Array<{
    informationId: string;
    title: string;
    views: number;
    qrViews: number;
  }>;
};

export type HotelAuditLog = {
  id: string;
  action: string;
  message: string;
  targetType: string | null;
  targetId: string | null;
  actorUserId: string | null;
  createdAt: string;
};

export type DashboardBootstrapData = {
  hotelName: string;
  subscription: HotelSubscription | null;
  informations: Information[];
};

export type HotelInvite = {
  id: string;
  code: string;
  isActive: boolean;
  consumedAt: string | null;
  createdAt: string;
};

export type HotelInviteMetrics = {
  issued: number;
  redeemed: number;
  active: number;
  redeemRate: number;
};

export type OnboardingFunnel7d = {
  lpAttributedLogins: number;
  signupCompleted: number;
  lpToSignupRate: number;
  byChannel: Array<{
    channel: "x" | "instagram" | "tiktok" | "other" | "unknown";
    logins: number;
    signups: number;
    rate: number;
  }>;
  byVariant: Array<{
    variant: "a" | "b";
    logins: number;
    signups: number;
    rate: number;
  }>;
};

async function appendAuditLog(params: {
  hotelId: string;
  action: string;
  message: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { error } = await supabase.from("audit_logs").insert({
    hotel_id: params.hotelId,
    actor_user_id: user.id,
    action: params.action,
    target_type: params.targetType ?? null,
    target_id: params.targetId ?? null,
    message: params.message,
    metadata: params.metadata ?? {},
  });

  if (error) {
    console.error("failed to append audit log", error.message);
  }
}

function mapRow(row: SupabaseInformationRow): Information {
  const contentBlocks = normalizeBlocks(row.content_blocks, row.body);
  return {
    id: row.id,
    title: row.title,
    body: row.body || blocksToBody(contentBlocks),
    images: (row.images ?? []).length > 0 ? (row.images ?? []) : blocksToImages(contentBlocks),
    contentBlocks,
    theme: normalizeTheme(row.theme),
    status: row.status,
    publishAt: row.publish_at ?? null,
    unpublishAt: row.unpublish_at ?? null,
    slug: row.slug,
    updatedAt: row.updated_at,
  };
}

function cloneTemplateBlocks(blocks: InformationBlock[]): InformationBlock[] {
  return blocks.map((block) => ({
    ...block,
    iconItems: block.iconItems?.map((entry) => ({ ...entry })),
    hoursItems: block.hoursItems?.map((entry) => ({ ...entry })),
    pricingItems: block.pricingItems?.map((entry) => ({ ...entry })),
    checklistItems: block.checklistItems?.map((entry) => ({ ...entry })),
    galleryItems: block.galleryItems?.map((entry) => ({ ...entry })),
    columnGroupItems: block.columnGroupItems?.map((entry) => ({ ...entry })),
  }));
}

function resolveTemplateBlocks(template: StarterTemplate): InformationBlock[] {
  if (template.blocks && template.blocks.length > 0) {
    return cloneTemplateBlocks(template.blocks);
  }
  return normalizeBlocks([], template.body);
}

function resolveLimitByPlan(plan: SubscriptionPlan): number {
  return plan === "pro" ? 1000 : 3;
}

function bootstrapLocalData(): Information[] {
  const now = new Date().toISOString();
  return starterTemplates.map((template, i) => {
    const blocks = resolveTemplateBlocks(template);
    return {
    id: `local-${i + 1}`,
    title: template.title,
    body: blocksToBody(blocks),
    images: blocksToImages(blocks),
    contentBlocks: blocks,
    theme: {},
    status: i === 0 ? "published" : "draft",
    publishAt: null,
    unpublishAt: null,
    slug: createSlug(template.title),
    updatedAt: now,
    };
  });
}

function getLocalData(): Information[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) {
    const initial = bootstrapLocalData();
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    return JSON.parse(raw) as Information[];
  } catch {
    const initial = bootstrapLocalData();
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

function setLocalData(items: Information[]): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
}

function buildDefaultHotelName(email: string | null | undefined): string {
  if (!email) {
    return "My Store";
  }
  const label = email.split("@")[0]?.trim();
  if (!label) {
    return "My Store";
  }
  return `${label} Store`;
}

export async function ensureUserHotelScope(): Promise<string | null> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw toError(userError, "ユーザー情報の取得に失敗しました");
  }
  if (!user) {
    return null;
  }

  const { data: membership, error: membershipError } = await supabase
    .from("hotel_memberships")
    .select("hotel_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    throw toError(membershipError, "施設所属の確認に失敗しました");
  }

  if (membership?.hotel_id) {
    const { data: hotel } = await supabase
      .from("hotels")
      .select("owner_user_id")
      .eq("id", membership.hotel_id)
      .maybeSingle();
    if (hotel && !hotel.owner_user_id) {
      await supabase
        .from("hotels")
        .update({ owner_user_id: user.id })
        .eq("id", membership.hotel_id)
        .is("owner_user_id", null);
    }
    await supabase.rpc("ensure_hotel_subscription", {
      target_hotel_id: membership.hotel_id,
    });
    return membership.hotel_id;
  }

  const hotelId = crypto.randomUUID();

  const { error: hotelError } = await supabase
    .from("hotels")
    .insert({
      id: hotelId,
      name: buildDefaultHotelName(user.email),
      owner_user_id: user.id,
    });

  if (hotelError) {
    throw toError(hotelError, "施設作成に失敗しました");
  }

  const { error: insertMembershipError } = await supabase
    .from("hotel_memberships")
    .insert({ user_id: user.id, hotel_id: hotelId });

  if (insertMembershipError) {
    throw toError(insertMembershipError, "施設所属の作成に失敗しました");
  }

  const { error: ensureSubscriptionError } = await supabase.rpc(
    "ensure_hotel_subscription",
    { target_hotel_id: hotelId },
  );

  if (ensureSubscriptionError) {
    throw toError(ensureSubscriptionError, "サブスクリプション初期化に失敗しました");
  }

  return hotelId;
}

export async function getCurrentHotelSubscription(): Promise<HotelSubscription | null> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    return null;
  }

  const hotelId = await ensureUserHotelScope();
  if (!hotelId) {
    return null;
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("id,plan,status,max_published_pages,current_period_end,stripe_customer_id,updated_at")
    .eq("hotel_id", hotelId)
    .maybeSingle();

  if (error) {
    throw toError(error, "プラン情報の取得に失敗しました");
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    plan: data.plan,
    status: data.status,
    maxPublishedPages: data.max_published_pages,
    currentPeriodEnd: data.current_period_end,
    hasStripeCustomer: Boolean(data.stripe_customer_id),
    updatedAt: data.updated_at,
  };
}

export async function updateCurrentHotelSubscription(
  plan: SubscriptionPlan,
  status: SubscriptionStatus,
): Promise<void> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase設定が未完了です");
  }

  const hotelId = await ensureUserHotelScope();
  if (!hotelId) {
    throw new Error("施設情報が見つかりません");
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({
      plan,
      status,
      max_published_pages: resolveLimitByPlan(plan),
      updated_at: new Date().toISOString(),
    })
    .eq("hotel_id", hotelId);

  if (error) {
    throw toError(error, "プラン更新に失敗しました");
  }

  await appendAuditLog({
    hotelId,
    action: "subscription.updated",
    message: `契約プランを更新しました（plan=${plan}, status=${status}）`,
    targetType: "subscription",
    metadata: { plan, status, maxPublishedPages: resolveLimitByPlan(plan) },
  });
}

export async function getCurrentHotelName(): Promise<string | null> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    return null;
  }

  const hotelId = await ensureUserHotelScope();
  if (!hotelId) {
    return null;
  }

  const { data, error } = await supabase
    .from("hotels")
    .select("name")
    .eq("id", hotelId)
    .maybeSingle();

  if (error) {
    throw toError(error, "施設名の取得に失敗しました");
  }

  return data?.name ?? null;
}

export async function updateCurrentHotelName(name: string): Promise<void> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    return;
  }

  const hotelId = await ensureUserHotelScope();
  if (!hotelId) {
    throw new Error("施設情報の更新対象が見つかりません");
  }

  const next = name.trim();
  if (!next) {
    throw new Error("施設名を入力してください");
  }

  const { error } = await supabase
    .from("hotels")
    .update({ name: next })
    .eq("id", hotelId);

  if (error) {
    throw toError(error, "施設名の更新に失敗しました");
  }

  await appendAuditLog({
    hotelId,
    action: "hotel.updated",
    message: `施設名を更新しました（${next}）`,
    targetType: "hotel",
    targetId: hotelId,
    metadata: { name: next },
  });
}

export async function listInformations(): Promise<Information[]> {
  const supabase = getBrowserSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("informations")
      .select("id,title,body,images,content_blocks,theme,status,publish_at,unpublish_at,slug,updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      throw toError(error, "一覧取得に失敗しました");
    }

    return (data ?? []).map((row) => mapRow(row as SupabaseInformationRow));
  }

  return getLocalData().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getDashboardBootstrapData(): Promise<DashboardBootstrapData> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    return {
      hotelName: "Infomii",
      subscription: null,
      informations: [],
    };
  }

  const hotelId = await ensureUserHotelScope();
  if (!hotelId) {
    return {
      hotelName: "Infomii",
      subscription: null,
      informations: [],
    };
  }

  const [hotelRes, subRes, infoRes] = await Promise.all([
    supabase.from("hotels").select("name").eq("id", hotelId).maybeSingle(),
    supabase
      .from("subscriptions")
      .select("id,plan,status,max_published_pages,current_period_end,stripe_customer_id,updated_at")
      .eq("hotel_id", hotelId)
      .maybeSingle(),
    supabase
      .from("informations")
      .select("id,title,body,images,content_blocks,theme,status,publish_at,unpublish_at,slug,updated_at")
      .order("updated_at", { ascending: false }),
  ]);

  if (hotelRes.error) {
    throw toError(hotelRes.error, "施設名の取得に失敗しました");
  }
  if (subRes.error) {
    throw toError(subRes.error, "プラン情報の取得に失敗しました");
  }
  if (infoRes.error) {
    throw toError(infoRes.error, "一覧取得に失敗しました");
  }

  const subscription = subRes.data
    ? {
        id: subRes.data.id,
        plan: subRes.data.plan,
        status: subRes.data.status,
        maxPublishedPages: subRes.data.max_published_pages,
        currentPeriodEnd: subRes.data.current_period_end,
        hasStripeCustomer: Boolean(subRes.data.stripe_customer_id),
        updatedAt: subRes.data.updated_at,
      }
    : null;

  return {
    hotelName: hotelRes.data?.name ?? "Infomii",
    subscription,
    informations: (infoRes.data ?? []).map((row) => mapRow(row as SupabaseInformationRow)),
  };
}

export async function getCurrentHotelPublishedCount(): Promise<number> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    return 0;
  }

  const hotelId = await ensureUserHotelScope();
  if (!hotelId) {
    return 0;
  }

  const { count, error } = await supabase
    .from("informations")
    .select("id", { count: "exact", head: true })
    .eq("hotel_id", hotelId)
    .eq("status", "published");

  if (error) {
    throw toError(error, "公開件数の取得に失敗しました");
  }

  return count ?? 0;
}

export type HotelPageLink = {
  id: string;
  title: string;
  slug: string;
  status: InformationStatus;
};

export type HotelNodeMapInfo = {
  id: string;
  title: string;
  slug: string;
  nodeMap?: InformationTheme["nodeMap"];
};

export async function listCurrentHotelPageLinks(): Promise<HotelPageLink[]> {
  const supabase = getBrowserSupabaseClient();
  if (supabase) {
    const hotelId = await ensureUserHotelScope();
    if (!hotelId) {
      return [];
    }
    const { data, error } = await supabase
      .from("informations")
      .select("id,title,slug,status")
      .eq("hotel_id", hotelId)
      .order("updated_at", { ascending: false });
    if (error) {
      throw toError(error, "ページ一覧の取得に失敗しました");
    }
    return (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      status: row.status as InformationStatus,
    }));
  }
  return getLocalData().map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
  }));
}

export async function listCurrentHotelNodeMapInfos(): Promise<HotelNodeMapInfo[]> {
  const supabase = getBrowserSupabaseClient();
  if (supabase) {
    const hotelId = await ensureUserHotelScope();
    if (!hotelId) {
      return [];
    }
    const { data, error } = await supabase
      .from("informations")
      .select("id,title,slug,theme")
      .eq("hotel_id", hotelId)
      .order("updated_at", { ascending: false });
    if (error) {
      throw toError(error, "ノードマップ情報の取得に失敗しました");
    }
    return (data ?? []).map((row) => {
      const mapped = normalizeTheme((row as { theme?: unknown }).theme);
      return {
        id: (row as { id: string }).id,
        title: (row as { title: string }).title,
        slug: (row as { slug: string }).slug,
        nodeMap: mapped.nodeMap,
      };
    });
  }
  return getLocalData().map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    nodeMap: normalizeTheme(row.theme).nodeMap,
  }));
}

export async function getInformation(id: string): Promise<Information | null> {
  const supabase = getBrowserSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("informations")
      .select("id,title,body,images,content_blocks,theme,status,publish_at,unpublish_at,slug,updated_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw toError(error, "詳細取得に失敗しました");
    }

    return data ? mapRow(data as SupabaseInformationRow) : null;
  }

  const found = getLocalData().find((item) => item.id === id);
  return found ?? null;
}

export async function createInformationFromTemplate(
  templateIndex = 0,
): Promise<string> {
  const template = starterTemplates[templateIndex] ?? starterTemplates[0];
  const supabase = getBrowserSupabaseClient();
  const blocks = resolveTemplateBlocks(template);

  if (supabase) {
    const hotelId = await ensureUserHotelScope();
    if (!hotelId) {
      throw new Error("ログインユーザーの所属施設を取得できませんでした");
    }

    const { data, error } = await supabase
      .from("informations")
      .insert({
        hotel_id: hotelId,
        title: template.title,
        body: blocksToBody(blocks),
        images: blocksToImages(blocks),
        content_blocks: blocks,
        theme: {},
        status: "draft",
        publish_at: null,
        unpublish_at: null,
        slug: createSlug(template.title),
      })
      .select("id")
      .single();

    if (error) {
      throw toError(error, "新規作成に失敗しました");
    }

    await appendAuditLog({
      hotelId,
      action: "information.created",
      message: `インフォメーションを新規作成しました（${template.title}）`,
      targetType: "information",
      targetId: data.id,
      metadata: { templateTitle: template.title },
    });

    return data.id;
  }

  const items = getLocalData();
  const now = new Date().toISOString();
  const next = {
    id: `local-${crypto.randomUUID()}`,
    title: template.title,
    body: blocksToBody(blocks),
    images: blocksToImages(blocks),
    contentBlocks: blocks,
    theme: {},
    status: "draft" as InformationStatus,
    publishAt: null,
    unpublishAt: null,
    slug: createSlug(template.title),
    updatedAt: now,
  };

  items.unshift(next);
  setLocalData(items);
  return next.id;
}

export async function createBlankInformation(
  title = "新規インフォメーション",
): Promise<string> {
  const nextTitle = title.trim() || "新規インフォメーション";
  const supabase = getBrowserSupabaseClient();
  const blocks = normalizeBlocks([], "");

  if (supabase) {
    const hotelId = await ensureUserHotelScope();
    if (!hotelId) {
      throw new Error("ログインユーザーの所属施設を取得できませんでした");
    }

    const { data, error } = await supabase
      .from("informations")
      .insert({
        hotel_id: hotelId,
        title: nextTitle,
        body: blocksToBody(blocks),
        images: blocksToImages(blocks),
        content_blocks: blocks,
        theme: {},
        status: "draft",
        publish_at: null,
        unpublish_at: null,
        slug: createSlug(nextTitle),
      })
      .select("id")
      .single();

    if (error) {
      throw toError(error, "新規作成に失敗しました");
    }

    await appendAuditLog({
      hotelId,
      action: "information.created",
      message: "インフォメーションを白紙で新規作成しました",
      targetType: "information",
      targetId: data.id,
      metadata: { source: "blank" },
    });

    return data.id;
  }

  const items = getLocalData();
  const now = new Date().toISOString();
  const next = {
    id: `local-${crypto.randomUUID()}`,
    title: nextTitle,
    body: blocksToBody(blocks),
    images: blocksToImages(blocks),
    contentBlocks: blocks,
    theme: {},
    status: "draft" as InformationStatus,
    publishAt: null,
    unpublishAt: null,
    slug: createSlug(nextTitle),
    updatedAt: now,
  };

  items.unshift(next);
  setLocalData(items);
  return next.id;
}

export async function updateInformation(
  id: string,
  patch: Partial<
    Pick<
      Information,
      | "title"
      | "body"
      | "images"
      | "contentBlocks"
      | "theme"
      | "status"
      | "publishAt"
      | "unpublishAt"
      | "slug"
    >
  >,
): Promise<void> {
  const supabase = getBrowserSupabaseClient();
  if (supabase) {
    let current:
      | {
          status: InformationStatus;
          hotel_id: string | null;
          title: string;
        }
      | null = null;

    if (patch.status !== undefined) {
      const { data: currentData, error: currentError } = await supabase
        .from("informations")
        .select("status,hotel_id,title")
        .eq("id", id)
        .maybeSingle();

      if (currentError) {
        throw toError(currentError, "公開状態の確認に失敗しました");
      }

      if (!currentData) {
        throw new Error("対象インフォメーションが見つかりません");
      }

      current = currentData as {
        status: InformationStatus;
        hotel_id: string | null;
        title: string;
      };
    }

    if (patch.status === "published") {
      if (!current) {
        throw new Error("対象インフォメーションが見つかりません");
      }

      if (current.status !== "published") {
        if (!current.hotel_id) {
          throw new Error("施設情報が紐づいていないため公開できません");
        }

        const { data: sub, error: subError } = await supabase
          .from("subscriptions")
          .select("max_published_pages,status")
          .eq("hotel_id", current.hotel_id)
          .maybeSingle();

        if (subError) {
          throw toError(subError, "プラン情報の確認に失敗しました");
        }
        if (!sub) {
          throw new Error("サブスクリプション情報が見つかりません");
        }
        if (sub.status !== "active" && sub.status !== "trialing") {
          throw new Error("現在の契約ステータスでは公開できません");
        }

        const { count, error: countError } = await supabase
          .from("informations")
          .select("id", { count: "exact", head: true })
          .eq("hotel_id", current.hotel_id)
          .eq("status", "published");

        if (countError) {
          throw toError(countError, "公開件数の確認に失敗しました");
        }

        const publishedCount = count ?? 0;
        if (publishedCount >= sub.max_published_pages) {
          throw new Error(
            `無料枠の上限に達しました（公開上限: ${sub.max_published_pages}件）。プラン変更をご検討ください。`,
          );
        }
      }
    }

    const { error } = await supabase
      .from("informations")
      .update({
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.body !== undefined ? { body: patch.body } : {}),
        ...(patch.images !== undefined ? { images: patch.images } : {}),
        ...(patch.contentBlocks !== undefined ? { content_blocks: patch.contentBlocks } : {}),
        ...(patch.theme !== undefined ? { theme: patch.theme } : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.publishAt !== undefined ? { publish_at: patch.publishAt } : {}),
        ...(patch.unpublishAt !== undefined ? { unpublish_at: patch.unpublishAt } : {}),
        ...(patch.slug !== undefined ? { slug: patch.slug } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      throw toError(error, "更新に失敗しました");
    }

    if (
      patch.status !== undefined &&
      current &&
      current.hotel_id &&
      patch.status !== current.status
    ) {
      await appendAuditLog({
        hotelId: current.hotel_id,
        action: patch.status === "published" ? "information.published" : "information.unpublished",
        message:
          patch.status === "published"
            ? `インフォメーションを公開しました（${current.title}）`
            : `インフォメーションを下書きに戻しました（${current.title}）`,
        targetType: "information",
        targetId: id,
        metadata: { previousStatus: current.status, nextStatus: patch.status },
      });
    }

    return;
  }

  const items = getLocalData();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) {
    return;
  }

  items[index] = {
    ...items[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  setLocalData(items);
}

export async function deleteInformation(id: string): Promise<void> {
  const supabase = getBrowserSupabaseClient();
  if (supabase) {
    const { data: current, error: currentError } = await supabase
      .from("informations")
      .select("id,title,hotel_id")
      .eq("id", id)
      .maybeSingle();

    if (currentError) {
      throw toError(currentError, "削除対象の確認に失敗しました");
    }
    if (!current) {
      throw new Error("対象インフォメーションが見つかりません");
    }

    const { error } = await supabase.from("informations").delete().eq("id", id);
    if (error) {
      throw toError(error, "削除に失敗しました");
    }

    if (current.hotel_id) {
      await appendAuditLog({
        hotelId: current.hotel_id,
        action: "information.deleted",
        message: `インフォメーションを削除しました（${current.title}）`,
        targetType: "information",
        targetId: id,
        metadata: { title: current.title },
      });
    }

    return;
  }

  const items = getLocalData();
  const nextItems = items.filter((item) => item.id !== id);
  setLocalData(nextItems);
}

export function buildPublicUrl(slug: string): string {
  if (typeof window === "undefined") {
    return `/p/${slug}`;
  }
  return `${window.location.origin}/p/${slug}`;
}

export function buildPublicQrUrl(slug: string): string {
  if (typeof window === "undefined") {
    return `/p/${slug}?src=qr`;
  }
  return `${window.location.origin}/p/${slug}?src=qr`;
}

export async function getCurrentHotelViewMetrics(): Promise<HotelViewMetrics> {
  const empty: HotelViewMetrics = {
    totalViews7d: 0,
    qrViews7d: 0,
    totalViewsToday: 0,
    qrViewsToday: 0,
    topPages: [],
  };

  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    return empty;
  }

  const hotelId = await ensureUserHotelScope();
  if (!hotelId) {
    return empty;
  }

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const [
    { data: views7d, error: views7dError },
    { data: viewsToday, error: viewsTodayError },
    { data: infos, error: infosError },
  ] = await Promise.all([
    supabase
      .from("information_views")
      .select("information_id,source,created_at")
      .eq("hotel_id", hotelId)
      .gte("created_at", sevenDaysAgo.toISOString()),
    supabase
      .from("information_views")
      .select("source", { count: "exact" })
      .eq("hotel_id", hotelId)
      .gte("created_at", startOfToday.toISOString()),
    supabase.from("informations").select("id,title").eq("hotel_id", hotelId),
  ]);

  if (views7dError) {
    throw toError(views7dError, "閲覧データの取得に失敗しました");
  }
  if (viewsTodayError) {
    throw toError(viewsTodayError, "本日の閲覧データの取得に失敗しました");
  }
  if (infosError) {
    throw toError(infosError, "ページ情報の取得に失敗しました");
  }

  const rows = views7d ?? [];
  const pageNameMap = new Map((infos ?? []).map((row) => [row.id, row.title]));

  const totalViews7d = rows.length;
  let qrViews7d = 0;
  const totalViewsToday = (viewsToday ?? []).length;
  let qrViewsToday = 0;
  const aggregate = new Map<string, { views: number; qrViews: number }>();

  for (const row of rows) {
    if (row.source === "qr") {
      qrViews7d += 1;
    }

    const item = aggregate.get(row.information_id) ?? { views: 0, qrViews: 0 };
    item.views += 1;
    if (row.source === "qr") {
      item.qrViews += 1;
    }
    aggregate.set(row.information_id, item);
  }

  for (const row of viewsToday ?? []) {
    if (row.source === "qr") {
      qrViewsToday += 1;
    }
  }

  const topPages = Array.from(aggregate.entries())
    .map(([informationId, values]) => ({
      informationId,
      title: pageNameMap.get(informationId) ?? "名称未設定",
      views: values.views,
      qrViews: values.qrViews,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return {
    totalViews7d,
    qrViews7d,
    totalViewsToday,
    qrViewsToday,
    topPages,
  };
}

export async function listCurrentHotelAuditLogs(limit = 20): Promise<HotelAuditLog[]> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    return [];
  }

  const hotelId = await ensureUserHotelScope();
  if (!hotelId) {
    return [];
  }

  const { data, error } = await supabase
    .from("audit_logs")
    .select("id,action,message,target_type,target_id,actor_user_id,created_at")
    .eq("hotel_id", hotelId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw toError(error, "監査ログの取得に失敗しました");
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    action: row.action,
    message: row.message,
    targetType: row.target_type,
    targetId: row.target_id,
    actorUserId: row.actor_user_id,
    createdAt: row.created_at,
  }));
}

function makeInviteCode(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createHotelInvite(): Promise<HotelInvite> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase設定が未完了です");
  }
  const hotelId = await ensureUserHotelScope();
  if (!hotelId) {
    throw new Error("施設情報が見つかりません");
  }
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("ユーザー情報の取得に失敗しました");
  }

  const code = makeInviteCode(8);
  const { data, error } = await supabase
    .from("hotel_invites")
    .insert({
      hotel_id: hotelId,
      code,
      created_by_user_id: user.id,
      is_active: true,
    })
    .select("id,code,is_active,consumed_at,created_at")
    .single();

  if (error || !data) {
    throw toError(error, "招待コードの発行に失敗しました");
  }

  await appendAuditLog({
    hotelId,
    action: "invite.created",
    message: `スタッフ招待コードを発行しました（${data.code}）`,
    targetType: "invite",
    targetId: data.id,
    metadata: { inviteCode: data.code },
  });

  return {
    id: data.id,
    code: data.code,
    isActive: data.is_active,
    consumedAt: data.consumed_at,
    createdAt: data.created_at,
  };
}

export async function listCurrentHotelInvites(limit = 20): Promise<HotelInvite[]> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    return [];
  }
  const hotelId = await ensureUserHotelScope();
  if (!hotelId) {
    return [];
  }

  const { data, error } = await supabase
    .from("hotel_invites")
    .select("id,code,is_active,consumed_at,created_at")
    .eq("hotel_id", hotelId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw toError(error, "招待コード一覧の取得に失敗しました");
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    code: row.code,
    isActive: row.is_active,
    consumedAt: row.consumed_at,
    createdAt: row.created_at,
  }));
}

export async function revokeHotelInvite(inviteId: string): Promise<void> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase設定が未完了です");
  }
  const hotelId = await ensureUserHotelScope();
  if (!hotelId) {
    throw new Error("施設情報が見つかりません");
  }

  const { error } = await supabase
    .from("hotel_invites")
    .update({ is_active: false })
    .eq("id", inviteId)
    .eq("hotel_id", hotelId);

  if (error) {
    throw toError(error, "招待コードの無効化に失敗しました");
  }

  await appendAuditLog({
    hotelId,
    action: "invite.revoked",
    message: "スタッフ招待コードを無効化しました",
    targetType: "invite",
    targetId: inviteId,
  });
}

export async function getCurrentHotelInviteMetrics(): Promise<HotelInviteMetrics> {
  const invites = await listCurrentHotelInvites(100);
  const issued = invites.length;
  const redeemed = invites.filter((invite) => invite.consumedAt !== null).length;
  const active = invites.filter((invite) => invite.isActive).length;
  const redeemRate = issued > 0 ? Math.round((redeemed / issued) * 100) : 0;
  return {
    issued,
    redeemed,
    active,
    redeemRate,
  };
}

export async function redeemHotelInvite(inputCode: string): Promise<void> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase設定が未完了です");
  }
  const code = inputCode.trim().toUpperCase();
  if (!code) {
    return;
  }
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("ユーザー情報の取得に失敗しました");
  }

  const { data: hotelId, error } = await supabase.rpc("redeem_hotel_invite", {
    input_code: code,
  });
  if (error) {
    throw toError(error, "招待コードの適用に失敗しました");
  }

  const safeHotelId = typeof hotelId === "string" ? hotelId : null;
  if (!safeHotelId) {
    return;
  }

  await appendAuditLog({
    hotelId: safeHotelId,
    action: "invite.accepted",
    message: `スタッフ招待を承認しました（${code}）`,
    targetType: "invite",
    metadata: { inviteCode: code },
  });
}

type CheckoutSessionOptions = {
  successPath?: string;
  cancelPath?: string;
};

export type OpsHealthSnapshot = {
  checkedAt: string;
  env: {
    supabasePublic: boolean;
    supabaseService: boolean;
    stripeSecret: boolean;
    stripePrice: boolean;
    stripeWebhook: boolean;
  };
  stripe: {
    ok: boolean;
    message: string;
  };
  membership: {
    ok: boolean;
    hotelId: string | null;
  };
  billing: {
    ok: boolean;
    plan: string | null;
    status: string | null;
    hasStripeCustomer: boolean;
    lastSyncAt: string | null;
    webhookLastReceivedAt: string | null;
    funnel7d: {
      upgradeClicks: number;
      checkoutSessions: number;
      completedCheckouts: number;
      checkoutResumeClicks: number;
      clickToCheckoutRate: number;
      checkoutToPaidRate: number;
      resumeClickRate: number;
    };
    message: string;
  };
  onboarding: {
    totalPages: number;
    publishedPages: number;
    draftPages: number;
    firstPublishedReady: boolean;
  };
  week2Review: {
    kpi: {
      lpToSignupRate: number;
      publishCompletionRate: number;
      proConversionRate: number;
    };
    focus: {
      strong: string[];
      weak: string[];
    };
  };
  week3Review: {
    kpi: {
      lpToSignupRate: number;
      publishCompletionRate: number;
      proConversionRate: number;
    };
    focusTop2: string[];
    weak: string[];
  };
  execution: {
    avgMinutesToPublish: number;
    samples: number;
    lastPublishedAt: string | null;
  };
  dormancy: {
    latestUpdateAt: string | null;
    daysSinceLastUpdate: number | null;
    isDormant7d: boolean;
    message: string;
  };
  performance7d: {
    lcpAvgMs: number;
    lcpP75Ms: number;
    loadAvgMs: number;
    loadP75Ms: number;
    sampleCount: number;
    lastMeasuredAt: string | null;
    lcpByPage: Array<{
      path: string;
      lcpMs: number;
      loadMs: number;
      samples: number;
    }>;
    slowPages: Array<{
      path: string;
      lcpMs: number;
      loadMs: number;
      samples: number;
    }>;
  };
  restart7d: {
    clicks: number;
    publishes: number;
    completionRate: number;
    byPath: {
      template: number;
      draft: number;
      publish: number;
    };
  };
  recentBillingLogs: Array<{
    id: string;
    action: string;
    message: string;
    created_at: string;
  }>;
};

type OpsRecoveryAction = "ensure_scope" | "sync_subscription";

async function getAccessTokenOrThrow(): Promise<string> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase設定が未完了です");
  }
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw toError(sessionError, "認証セッション取得に失敗しました");
  }
  if (!session?.access_token) {
    throw new Error("ログインセッションが見つかりません");
  }
  return session.access_token;
}

export async function getOpsHealthSnapshot(): Promise<OpsHealthSnapshot> {
  const token = await getAccessTokenOrThrow();
  const response = await fetch("/api/ops/health", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = (await response.json()) as OpsHealthSnapshot & { message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "運用ヘルス取得に失敗しました");
  }
  return payload;
}

export async function runOpsRecoveryAction(action: OpsRecoveryAction): Promise<string> {
  const token = await getAccessTokenOrThrow();
  const response = await fetch("/api/ops/recover", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action }),
  });
  const payload = (await response.json()) as { message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "復旧操作に失敗しました");
  }
  return payload.message || "復旧操作を実行しました";
}

export async function runOpsAlertTest(): Promise<string> {
  const token = await getAccessTokenOrThrow();
  const response = await fetch("/api/ops/test-alert", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = (await response.json()) as {
    message?: string;
    channels?: {
      slack?: { ok: boolean; detail: string };
      email?: { ok: boolean; detail: string };
    };
  };
  if (!response.ok) {
    const detail = payload.channels?.email?.detail || payload.channels?.slack?.detail;
    throw new Error(`${payload.message || "通知テストに失敗しました"}${detail ? `: ${detail}` : ""}`);
  }
  const email = payload.channels?.email;
  const slack = payload.channels?.slack;
  return `${payload.message || "通知テストを送信しました"} / Slack: ${slack?.ok ? "OK" : "NG"} / Mail: ${email?.ok ? "OK" : "NG"}${email?.detail ? ` (${email.detail})` : ""}`;
}

export async function trackUpgradeClick(context: "dashboard" | "editor"): Promise<void> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    return;
  }
  const hotelId = await ensureUserHotelScope();
  if (!hotelId) {
    return;
  }
  await appendAuditLog({
    hotelId,
    action: "billing.upgrade_click",
    message: `アップグレード導線をクリックしました（${context}）`,
    targetType: "subscription",
    metadata: { context },
  });
}

export async function trackBillingResumeClick(): Promise<void> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    return;
  }
  const hotelId = await ensureUserHotelScope();
  if (!hotelId) {
    return;
  }
  await appendAuditLog({
    hotelId,
    action: "billing.checkout_resume_click",
    message: "checkout未完了リマインドから決済再開をクリックしました",
    targetType: "subscription",
    metadata: { context: "dashboard" },
  });
}

export async function trackOpsRestartFlowClick(path: "template" | "draft" | "publish"): Promise<void> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    return;
  }
  const hotelId = await ensureUserHotelScope();
  if (!hotelId) {
    return;
  }
  await appendAuditLog({
    hotelId,
    action: "ops.restart_flow_click",
    message: `再開導線をクリックしました（${path}）`,
    targetType: "ops",
    metadata: { path },
  });
}

type OnboardingSourceRef = "lp-hero" | "lp-sticky" | "lp-bottom";
type OnboardingAuthAction = "login_success" | "signup_completed";
type OnboardingSourceChannel = "x" | "instagram" | "tiktok" | "other" | "unknown";
type OnboardingCtaVariant = "a" | "b";

function toOnboardingSourceRef(value: string | null | undefined): OnboardingSourceRef | null {
  if (!value) {
    return null;
  }
  if (value === "lp-hero" || value === "lp-sticky" || value === "lp-bottom") {
    return value;
  }
  return null;
}

function toOnboardingSourceChannel(value: string | null | undefined): OnboardingSourceChannel {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized === "x" || normalized === "twitter") {
    return "x";
  }
  if (normalized === "instagram" || normalized === "insta" || normalized === "ig") {
    return "instagram";
  }
  if (normalized === "tiktok" || normalized === "tiktok") {
    return "tiktok";
  }
  if (normalized.length === 0) {
    return "unknown";
  }
  return "other";
}

function toOnboardingCtaVariant(value: string | null | undefined): OnboardingCtaVariant {
  return (value ?? "").trim().toLowerCase() === "b" ? "b" : "a";
}

export async function trackOnboardingAuthEvent(
  action: OnboardingAuthAction,
  params?: {
    sourceRef?: string | null;
    sourceChannel?: string | null;
    ctaVariant?: string | null;
  },
): Promise<void> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    return;
  }
  const hotelId = await ensureUserHotelScope();
  if (!hotelId) {
    return;
  }
  const safeRef = toOnboardingSourceRef(params?.sourceRef);
  const sourceChannel = toOnboardingSourceChannel(params?.sourceChannel);
  const ctaVariant = toOnboardingCtaVariant(params?.ctaVariant);
  const actionName = `onboarding.${action}`;
  const message =
    action === "signup_completed"
      ? `新規登録が完了しました${safeRef ? `（${safeRef}）` : ""} / ${sourceChannel.toUpperCase()} / variant:${ctaVariant}`
      : `ログインしました${safeRef ? `（${safeRef}）` : ""} / ${sourceChannel.toUpperCase()} / variant:${ctaVariant}`;

  await appendAuditLog({
    hotelId,
    action: actionName,
    message,
    targetType: "onboarding",
    metadata: {
      sourceRef: safeRef,
      sourceType: safeRef?.startsWith("lp-") ? "lp" : "unknown",
      sourceChannel,
      ctaVariant,
    },
  });
}

export async function getOnboardingFunnel7d(): Promise<OnboardingFunnel7d> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    return {
      lpAttributedLogins: 0,
      signupCompleted: 0,
      lpToSignupRate: 0,
      byChannel: [],
      byVariant: [],
    };
  }

  const hotelId = await ensureUserHotelScope();
  if (!hotelId) {
    return {
      lpAttributedLogins: 0,
      signupCompleted: 0,
      lpToSignupRate: 0,
      byChannel: [],
      byVariant: [],
    };
  }

  const sinceIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("audit_logs")
    .select("action,metadata")
    .eq("hotel_id", hotelId)
    .in("action", ["onboarding.login_success", "onboarding.signup_completed"])
    .gte("created_at", sinceIso);

  if (error) {
    throw toError(error, "オンボーディング指標の取得に失敗しました");
  }

  let lpAttributedLogins = 0;
  let signupCompleted = 0;
  const channelMap = new Map<OnboardingSourceChannel, { logins: number; signups: number }>();
  const variantMap = new Map<OnboardingCtaVariant, { logins: number; signups: number }>();

  for (const row of data ?? []) {
    const metadata = row.metadata as Record<string, unknown> | null;
    const sourceRef = toOnboardingSourceRef(
      typeof metadata?.sourceRef === "string" ? metadata.sourceRef : null,
    );
    const sourceChannel = toOnboardingSourceChannel(
      typeof metadata?.sourceChannel === "string" ? metadata.sourceChannel : null,
    );
    const ctaVariant = toOnboardingCtaVariant(
      typeof metadata?.ctaVariant === "string" ? metadata.ctaVariant : null,
    );

    if (row.action === "onboarding.login_success" && sourceRef) {
      lpAttributedLogins += 1;
      const channelStat = channelMap.get(sourceChannel) ?? { logins: 0, signups: 0 };
      channelStat.logins += 1;
      channelMap.set(sourceChannel, channelStat);

      const variantStat = variantMap.get(ctaVariant) ?? { logins: 0, signups: 0 };
      variantStat.logins += 1;
      variantMap.set(ctaVariant, variantStat);
    }

    if (row.action === "onboarding.signup_completed") {
      signupCompleted += 1;
      const channelStat = channelMap.get(sourceChannel) ?? { logins: 0, signups: 0 };
      channelStat.signups += 1;
      channelMap.set(sourceChannel, channelStat);

      const variantStat = variantMap.get(ctaVariant) ?? { logins: 0, signups: 0 };
      variantStat.signups += 1;
      variantMap.set(ctaVariant, variantStat);
    }
  }

  const lpToSignupRate =
    lpAttributedLogins > 0 ? Math.round((signupCompleted / lpAttributedLogins) * 100) : 0;

  const byChannel = Array.from(channelMap.entries())
    .map(([channel, counts]) => ({
      channel,
      logins: counts.logins,
      signups: counts.signups,
      rate: counts.logins > 0 ? Math.round((counts.signups / counts.logins) * 100) : 0,
    }))
    .sort((a, b) => b.logins - a.logins);

  const byVariant: OnboardingFunnel7d["byVariant"] = (["a", "b"] as const).map((variant) => {
    const counts = variantMap.get(variant) ?? { logins: 0, signups: 0 };
    return {
      variant,
      logins: counts.logins,
      signups: counts.signups,
      rate: counts.logins > 0 ? Math.round((counts.signups / counts.logins) * 100) : 0,
    };
  });

  return {
    lpAttributedLogins,
    signupCompleted,
    lpToSignupRate,
    byChannel,
    byVariant,
  };
}

export async function createStripeCheckoutSession(
  options?: CheckoutSessionOptions,
): Promise<string> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase設定が未完了です");
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw toError(sessionError, "認証セッション取得に失敗しました");
  }
  if (!session?.access_token) {
    throw new Error("ログインセッションが見つかりません");
  }

  const response = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      successPath: options?.successPath,
      cancelPath: options?.cancelPath,
    }),
  });

  const payload = (await response.json()) as { url?: string; message?: string };
  if (!response.ok || !payload.url) {
    throw new Error(payload.message || "Checkout作成に失敗しました");
  }

  return payload.url;
}

export async function createStripePortalSession(): Promise<string> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase設定が未完了です");
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw toError(sessionError, "認証セッション取得に失敗しました");
  }
  if (!session?.access_token) {
    throw new Error("ログインセッションが見つかりません");
  }

  const response = await fetch("/api/stripe/portal", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const payload = (await response.json()) as { url?: string; message?: string };
  if (!response.ok || !payload.url) {
    throw new Error(payload.message || "Customer Portal開始に失敗しました");
  }

  return payload.url;
}
