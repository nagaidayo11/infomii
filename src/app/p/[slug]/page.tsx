import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import Image from "next/image";
import type { ReactNode } from "react";
import type { InformationBlock, InformationStatus, InformationTheme } from "@/types/information";
import type { Database } from "@/types/supabase";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase-config";
import { getSupabaseAdminServerClient } from "@/lib/server/supabase-server";

type PublicPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ src?: string; embed?: string }>;
};

function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function normalizeBlocks(value: unknown, fallbackBody: string): InformationBlock[] {
  if (Array.isArray(value) && value.length > 0) {
    return value
      .map((item, index) => {
        if (!item || typeof item !== "object") {
          return null;
        }
        const block = item as Partial<InformationBlock>;
        if (
          block.type !== "title" &&
          block.type !== "heading" &&
          block.type !== "paragraph" &&
          block.type !== "image" &&
          block.type !== "divider" &&
          block.type !== "icon" &&
          block.type !== "space" &&
          block.type !== "section" &&
          block.type !== "columns" &&
          block.type !== "iconRow" &&
          block.type !== "cta" &&
          block.type !== "badge" &&
          block.type !== "hours" &&
          block.type !== "pricing" &&
          block.type !== "quote" &&
          block.type !== "checklist" &&
          block.type !== "gallery" &&
          block.type !== "columnGroup"
        ) {
          return null;
        }
        return {
          id: typeof block.id === "string" ? block.id : `block-${index + 1}`,
          type: block.type,
          text: typeof block.text === "string" ? block.text : undefined,
          url: typeof block.url === "string" ? block.url : undefined,
          icon: typeof block.icon === "string" ? block.icon : undefined,
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
  return fallbackBody.split(/\n{2,}/).map((text, index) => ({
    id: `fallback-${index + 1}`,
    type: "paragraph",
    text,
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
    backgroundColor: typeof theme.backgroundColor === "string" ? theme.backgroundColor : undefined,
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

function getTitleSizeClass(size: InformationTheme["titleSize"]): string {
  if (size === "sm") {
    return "text-xl sm:text-2xl";
  }
  if (size === "lg") {
    return "text-3xl sm:text-4xl";
  }
  return "text-2xl sm:text-3xl";
}

function getBlockTextSizeClass(
  size: InformationBlock["textSize"] | undefined,
  fallback: InformationTheme["bodySize"],
): string {
  const value = size ?? fallback;
  if (value === "sm") {
    return "text-[14px] sm:text-sm";
  }
  if (value === "lg") {
    return "text-[17px] sm:text-lg";
  }
  return "text-[15px] sm:text-base";
}

function getWeightClass(weight: "normal" | "medium" | "semibold" | undefined): string {
  if (weight === "semibold") {
    return "font-semibold";
  }
  if (weight === "medium") {
    return "font-medium";
  }
  return "font-normal";
}

function getBlockAlignClass(align: InformationBlock["textAlign"] | undefined): string {
  if (align === "center") {
    return "text-center";
  }
  if (align === "right") {
    return "text-right";
  }
  return "text-left";
}

function getBlockJustifyClass(align: InformationBlock["textAlign"] | undefined): string {
  if (align === "center") {
    return "justify-center";
  }
  if (align === "right") {
    return "justify-end";
  }
  return "justify-start";
}

function getDividerThicknessStyle(
  thickness: InformationBlock["dividerThickness"] | undefined,
  color: string | undefined,
): { borderTopWidth: string; borderTopColor: string } {
  if (thickness === "thick") {
    return { borderTopWidth: "3px", borderTopColor: color ?? "#e2e8f0" };
  }
  if (thickness === "medium") {
    return { borderTopWidth: "2px", borderTopColor: color ?? "#e2e8f0" };
  }
  return { borderTopWidth: "1px", borderTopColor: color ?? "#e2e8f0" };
}

function getBlockSpacingStyle(
  spacing: InformationBlock["spacing"] | undefined,
): { marginBottom: string } {
  if (spacing === "sm") {
    return { marginBottom: "8px" };
  }
  if (spacing === "lg") {
    return { marginBottom: "28px" };
  }
  return { marginBottom: "16px" };
}

function getSpaceHeightClass(spacing: InformationBlock["spacing"] | undefined): string {
  if (spacing === "sm") {
    return "h-4";
  }
  if (spacing === "lg") {
    return "h-12";
  }
  return "h-8";
}

function getCardRadiusClass(radius: InformationBlock["cardRadius"] | undefined): string {
  if (radius === "sm") {
    return "rounded-md";
  }
  if (radius === "md") {
    return "rounded-lg";
  }
  if (radius === "xl") {
    return "rounded-2xl";
  }
  if (radius === "full") {
    return "rounded-3xl";
  }
  return "rounded-xl";
}

function getBlockContainerStyle(
  block: InformationBlock,
  theme: InformationTheme,
): { marginBottom: string; fontFamily: string } {
  const defaultFont = "\"Noto Sans JP\", \"Hiragino Kaku Gothic ProN\", \"Yu Gothic\", sans-serif";
  return {
    ...getBlockSpacingStyle(block.spacing),
    fontFamily: block.fontFamily ?? theme.fontFamily ?? defaultFont,
  };
}

function renderLineIcon(token: string): ReactNode {
  const className = "h-5 w-5 text-slate-700";
  if (token === "svg:clock") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </svg>
    );
  }
  if (token === "svg:map-pin") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 21s6-5.4 6-10a6 6 0 1 0-12 0c0 4.6 6 10 6 10Z" />
        <circle cx="12" cy="11" r="2.5" />
      </svg>
    );
  }
  if (token === "svg:wifi") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4.5 9.5a11 11 0 0 1 15 0" />
        <path d="M7.5 12.5a7 7 0 0 1 9 0" />
        <path d="M10.5 15.5a3 3 0 0 1 3 0" />
        <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (token === "svg:car") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 13h16l-1.5-4h-13L4 13Z" />
        <path d="M5 13v4h2" />
        <path d="M17 17h2v-4" />
        <circle cx="8" cy="17" r="1.6" />
        <circle cx="16" cy="17" r="1.6" />
      </svg>
    );
  }
  if (token === "svg:bell") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 17h8l-1-2v-4a3 3 0 1 0-6 0v4l-1 2Z" />
        <path d="M10.5 19a1.5 1.5 0 0 0 3 0" />
      </svg>
    );
  }
  if (token === "svg:utensils") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 4v8" />
        <path d="M5 4v4" />
        <path d="M9 4v4" />
        <path d="M7 12v8" />
        <path d="M16 4c1.5 2.5 1.5 5.5 0 8v8" />
      </svg>
    );
  }
  if (token === "svg:bath") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 12h14v3a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-3Z" />
        <path d="M8 12V8a2 2 0 1 1 4 0" />
      </svg>
    );
  }
  return null;
}

function renderIconVisual(icon: string | undefined): ReactNode {
  if (!icon) {
    return <span className="text-xl">⭐</span>;
  }
  if (icon.startsWith("svg:")) {
    return renderLineIcon(icon) ?? <span className="text-xl">⭐</span>;
  }
  return <span className="text-xl">{icon}</span>;
}

export default async function PublicInformationPage({ params, searchParams }: PublicPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const isEmbed = query.embed === "1";

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return (
      <main className={`lux-main mx-auto w-full max-w-2xl ${isEmbed ? "p-0" : "min-h-screen overflow-x-hidden px-3 py-8 sm:px-6 sm:py-12"}`}>
        <h1 className="mb-4 text-xl font-semibold">公開ページ</h1>
        <p className="text-sm text-slate-600">
          Supabase環境変数が未設定のため、公開ページを取得できません。
        </p>
      </main>
    );
  }

  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("informations")
    .select("id,hotel_id,title,body,images,content_blocks,theme,status,updated_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    let isDraft = false;
    try {
      const admin = getSupabaseAdminServerClient();
      const { data: draftRow } = await admin
        .from("informations")
        .select("id,status")
        .eq("slug", slug)
        .eq("status", "draft")
        .maybeSingle();
      isDraft = Boolean(draftRow);
    } catch {
      // service role未設定時は従来どおり not found 扱い
    }
    return (
      <main className={`lux-main mx-auto w-full max-w-2xl ${isEmbed ? "p-0" : "min-h-screen overflow-x-hidden px-3 py-8 sm:px-6 sm:py-12"}`}>
        <h1 className="mb-4 text-xl font-semibold">ご案内</h1>
        <p className="text-sm text-slate-600">
          {isDraft ? "このページは未公開です。公開後にご利用いただけます。" : "ページが見つかりませんでした。"}
        </p>
      </main>
    );
  }

  const row = data as {
    id: string;
    hotel_id: string | null;
    title: string;
    body: string;
    images: string[] | null;
    content_blocks: unknown;
    theme: unknown;
    status: InformationStatus;
    updated_at: string;
  };
  const blocks = normalizeBlocks(row.content_blocks, row.body);
  const theme = normalizeTheme(row.theme);
  const nodeMap = theme.nodeMap;

  const source = query.src === "qr" ? "qr" : "direct";
  const requestHeaders = await headers();

  if (row.hotel_id) {
    const { error: viewError } = await supabase.from("information_views").insert({
      information_id: row.id,
      hotel_id: row.hotel_id,
      slug,
      source,
      referrer: requestHeaders.get("referer"),
      user_agent: requestHeaders.get("user-agent"),
    });
    if (viewError) {
      console.error("failed to insert information_view", viewError.message);
    }
  }

  return (
    <main
      className={`lux-main text-slate-900 ${
        isEmbed
          ? "bg-transparent p-0"
          : "min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#fde68a1a_0%,#dbeafe38_32%,#f8fafc_100%)] px-3 py-8 sm:px-8 sm:py-12"
      }`}
    >
      <div className={`mx-auto w-full ${isEmbed ? "max-w-none" : "max-w-2xl"}`}>
        <article
          className="lux-card lux-section-card overflow-hidden rounded-3xl"
          style={{
            backgroundColor: theme.backgroundColor || "#ffffff",
            color: theme.textColor || "#0f172a",
            fontFamily: theme.fontFamily ?? "\"Noto Sans JP\", \"Hiragino Kaku Gothic ProN\", \"Yu Gothic\", sans-serif",
          }}
        >
          {!isEmbed ? (
            <div className="hidden border-b border-slate-100 px-4 py-4 sm:block sm:px-6 sm:py-5">
              <p className="lux-kicker text-[11px]">Infomii</p>
              <p className="mt-2 text-xs text-slate-500">最終更新: {formatUpdatedAt(row.updated_at)}</p>
            </div>
          ) : null}

          <div className="px-4 py-5 sm:px-6 sm:py-6">
            {nodeMap?.enabled && nodeMap.nodes.length > 0 && (
              <section className="mb-5 hidden rounded-xl border border-emerald-200 bg-emerald-50/50 p-2.5 sm:mb-6 sm:block sm:p-3">
                <p className="mb-2 text-xs font-semibold text-emerald-800">総合案内ナビゲーション</p>
                <div className="relative h-[320px] overflow-hidden rounded-lg border border-slate-200 bg-white sm:h-[360px]">
                  <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {nodeMap.edges.map((edge) => {
                      const from = nodeMap.nodes.find((n) => n.id === edge.from);
                      const to = nodeMap.nodes.find((n) => n.id === edge.to);
                      if (!from || !to) {
                        return null;
                      }
                      return <line key={edge.id} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#94a3b8" strokeWidth="0.55" />;
                    })}
                  </svg>
                  {nodeMap.nodes.map((node) => {
                    const clampedX = Math.min(84, Math.max(16, node.x));
                    const clampedY = Math.min(90, Math.max(10, node.y));
                    return (
                    <div
                      key={node.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${clampedX}%`, top: `${clampedY}%` }}
                    >
                      {node.targetSlug ? (
                        <a
                          href={`/p/${node.targetSlug}`}
                          className="flex min-h-[72px] min-w-[86px] max-w-[108px] touch-manipulation flex-col items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-2.5 text-center shadow-sm transition active:scale-[0.99] hover:-translate-y-[1px] hover:shadow-md sm:min-h-[78px] sm:min-w-[124px] sm:max-w-none sm:px-3"
                        >
                          <span className="text-lg">{node.icon || "📄"}</span>
                          <span className="break-words text-[11px] font-medium leading-tight text-slate-800 sm:text-xs">{node.title}</span>
                        </a>
                      ) : (
                        <div className="flex min-h-[72px] min-w-[86px] max-w-[108px] flex-col items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2.5 text-center shadow-sm sm:min-h-[78px] sm:min-w-[124px] sm:max-w-none sm:px-3">
                          <span className="text-lg">{node.icon || "📄"}</span>
                          <span className="break-words text-[11px] font-medium leading-tight text-slate-500 sm:text-xs">{node.title}</span>
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              </section>
            )}
            <div>
              {blocks.map((block) => {
                if (block.type === "title") {
                  return (
                    <div key={block.id} style={getBlockContainerStyle(block, theme)}>
                      <h2
                        className={`${getWeightClass(block.textWeight ?? "semibold")} ${getTitleSizeClass(block.textSize ?? "md")} ${getBlockAlignClass(block.textAlign)}`}
                        style={{ color: block.textColor ?? theme.textColor ?? "#0f172a" }}
                      >
                        {block.text || "タイトル"}
                      </h2>
                    </div>
                  );
                }
                if (block.type === "heading") {
                  return (
                    <div key={block.id} style={getBlockContainerStyle(block, theme)}>
                      <h2
                        className={`${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, theme.bodySize)} ${getBlockAlignClass(block.textAlign)}`}
                        style={{ color: block.textColor ?? theme.textColor ?? "#0f172a" }}
                      >
                        {block.text || "見出し"}
                      </h2>
                    </div>
                  );
                }
                if (block.type === "paragraph") {
                  return (
                    <div key={block.id} style={getBlockContainerStyle(block, theme)}>
                        <p
                          className={`whitespace-pre-wrap leading-7 sm:leading-8 ${getWeightClass(block.textWeight)} ${getBlockTextSizeClass(block.textSize, theme.bodySize)} ${getBlockAlignClass(block.textAlign)}`}
                          style={{ color: block.textColor ?? theme.textColor ?? "#0f172a" }}
                        >
                          {block.text || ""}
                      </p>
                    </div>
                  );
                }
                if (block.type === "image") {
                  return (
                    <div key={block.id} style={getBlockContainerStyle(block, theme)}>
                      <Image
                        src={block.url || ""}
                        alt="block"
                        width={960}
                        height={540}
                        unoptimized
                        className="h-auto w-full rounded-2xl object-cover"
                      />
                    </div>
                  );
                }
                if (block.type === "icon") {
                  return (
                    <div key={block.id} style={getBlockContainerStyle(block, theme)}>
                      <div className={`rounded-xl border border-slate-200 bg-slate-50/60 p-3 ${getBlockAlignClass(block.textAlign)}`}>
                        <div className={`flex items-center gap-2 ${getBlockJustifyClass(block.textAlign)}`}>
                          {renderIconVisual(block.icon)}
                          <p
                            className={`${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, theme.bodySize)}`}
                            style={{ color: block.textColor ?? theme.textColor ?? "#0f172a" }}
                          >
                            {block.label || "ラベル"}
                          </p>
                        </div>
                        <p
                          className={`mt-1 whitespace-pre-wrap ${getWeightClass(block.textWeight)} ${getBlockTextSizeClass(block.textSize, theme.bodySize)}`}
                          style={{ color: block.textColor ?? theme.textColor ?? "#0f172a" }}
                        >
                          {block.description || ""}
                        </p>
                      </div>
                    </div>
                  );
                }
                if (block.type === "iconRow") {
                  const iconItems = block.iconItems ?? [];
                  const iconColumnsClass = iconItems.length >= 3 ? "grid-cols-3" : "grid-cols-2";
                  const isRoundIconRow = block.cardRadius === "full";
                  const iconItemRadiusClass = isRoundIconRow ? "rounded-full" : getCardRadiusClass(block.cardRadius);
                  return (
                    <div key={block.id} style={getBlockContainerStyle(block, theme)}>
                      <div
                        className={`${getCardRadiusClass(block.cardRadius)} border border-slate-200 p-3`}
                        style={{ backgroundColor: block.iconRowBackgroundColor ?? "#f8fafc" }}
                      >
                        <div className={`grid gap-2 ${iconColumnsClass}`}>
                          {iconItems.map((entry) => (
                            <div
                              key={entry.id}
                              className={`${iconItemRadiusClass} border border-slate-200 text-center shadow-sm ${isRoundIconRow ? "aspect-square overflow-hidden" : ""}`}
                              style={{ backgroundColor: entry.backgroundColor ?? "#ffffff" }}
                            >
                              {entry.link ? (
                                <a
                                  href={entry.link}
                                  target={entry.link.startsWith("/p/") ? undefined : "_blank"}
                                  rel={entry.link.startsWith("/p/") ? undefined : "noreferrer"}
                                  className={`flex w-full touch-manipulation flex-col items-center justify-center gap-1 px-2 py-2.5 transition active:scale-[0.99] ${isRoundIconRow ? "aspect-square min-h-0" : "min-h-[76px]"}`}
                                >
                                  {renderIconVisual(entry.icon)}
                                  <p
                                    className={`${getWeightClass(block.textWeight ?? "medium")} ${getBlockTextSizeClass(block.textSize, theme.bodySize)}`}
                                    style={{ color: block.textColor ?? theme.textColor ?? "#0f172a" }}
                                  >
                                    {entry.label || "項目"}
                                  </p>
                                </a>
                              ) : (
                                <div className={`flex w-full flex-col items-center justify-center gap-1 px-2 py-2.5 ${isRoundIconRow ? "aspect-square min-h-0" : "min-h-[76px]"}`}>
                                  {renderIconVisual(entry.icon)}
                                  <p
                                    className={`${getWeightClass(block.textWeight ?? "medium")} ${getBlockTextSizeClass(block.textSize, theme.bodySize)}`}
                                    style={{ color: block.textColor ?? theme.textColor ?? "#0f172a" }}
                                  >
                                    {entry.label || "項目"}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }
                if (block.type === "section") {
                  return (
                    <div key={block.id} style={getBlockContainerStyle(block, theme)}>
                      <div
                        className={`rounded-xl border border-slate-200 px-4 py-4 ${getBlockAlignClass(block.textAlign)}`}
                        style={{ backgroundColor: block.sectionBackgroundColor ?? "#f8fafc" }}
                      >
                        <p
                          className={`${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, theme.bodySize)}`}
                          style={{ color: block.textColor ?? theme.textColor ?? "#0f172a" }}
                        >
                          {block.sectionTitle || "セクションタイトル"}
                        </p>
                        <p
                          className={`mt-2 whitespace-pre-wrap ${getBlockTextSizeClass(block.textSize, theme.bodySize)}`}
                          style={{ color: block.textColor ?? theme.textColor ?? "#0f172a" }}
                        >
                          {block.sectionBody || ""}
                        </p>
                      </div>
                    </div>
                  );
                }
                if (block.type === "columns") {
                  return (
                    <div key={block.id} style={getBlockContainerStyle(block, theme)}>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div
                          className={`${getCardRadiusClass(block.cardRadius)} border border-slate-200 p-3`}
                          style={{ backgroundColor: block.columnsBackgroundColor ?? "#f8fafc" }}
                        >
                          <p className={`mb-1 ${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, theme.bodySize)}`}>
                            {block.leftTitle || "左タイトル"}
                          </p>
                          <p className={`whitespace-pre-wrap ${getBlockTextSizeClass(block.textSize, theme.bodySize)}`}>
                            {block.leftText || ""}
                          </p>
                        </div>
                        <div
                          className={`${getCardRadiusClass(block.cardRadius)} border border-slate-200 p-3`}
                          style={{ backgroundColor: block.columnsBackgroundColor ?? "#f8fafc" }}
                        >
                          <p className={`mb-1 ${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, theme.bodySize)}`}>
                            {block.rightTitle || "右タイトル"}
                          </p>
                          <p className={`whitespace-pre-wrap ${getBlockTextSizeClass(block.textSize, theme.bodySize)}`}>
                            {block.rightText || ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                if (block.type === "cta") {
                  return (
                    <div key={block.id} style={getBlockContainerStyle(block, theme)} className={getBlockAlignClass(block.textAlign)}>
                      <a
                        href={block.ctaUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex min-h-[44px] items-center rounded-lg bg-emerald-600 px-4 py-2.5 ${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, theme.bodySize)}`}
                        style={{ color: block.textColor ?? "#ffffff" }}
                      >
                        {block.ctaLabel || "ボタン"}
                      </a>
                    </div>
                  );
                }
                if (block.type === "badge") {
                  return (
                    <div key={block.id} style={getBlockContainerStyle(block, theme)} className={getBlockAlignClass(block.textAlign)}>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 ${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, theme.bodySize)}`}
                        style={{
                          backgroundColor: block.badgeColor ?? "#dcfce7",
                          color: block.textColor ?? block.badgeTextColor ?? "#065f46",
                        }}
                      >
                        {block.badgeText || "バッジ"}
                      </span>
                    </div>
                  );
                }
                if (block.type === "hours") {
                  return (
                    <div key={block.id} style={getBlockContainerStyle(block, theme)}>
                      <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                        <p
                          className={`mb-2 ${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, theme.bodySize)}`}
                          style={{ color: block.textColor ?? theme.textColor ?? "#0f172a" }}
                        >
                          営業時間
                        </p>
                        <div className="space-y-1.5">
                          {(block.hoursItems ?? []).map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between gap-3">
                              <span
                                className={`${getWeightClass(block.textWeight ?? "medium")} ${getBlockTextSizeClass(block.textSize, theme.bodySize)}`}
                                style={{ color: block.textColor ?? theme.textColor ?? "#0f172a" }}
                              >
                                {entry.label || "-"}
                              </span>
                              <span
                                className={getBlockTextSizeClass(block.textSize, theme.bodySize)}
                                style={{ color: block.textColor ?? theme.textColor ?? "#0f172a" }}
                              >
                                {entry.value || "-"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }
                if (block.type === "pricing") {
                  return (
                    <div key={block.id} style={getBlockContainerStyle(block, theme)}>
                      <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                        <p
                          className={`mb-2 ${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, theme.bodySize)}`}
                          style={{ color: block.textColor ?? theme.textColor ?? "#0f172a" }}
                        >
                          料金表
                        </p>
                        <div className="space-y-1.5">
                          {(block.pricingItems ?? []).map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between gap-3">
                              <span
                                className={`${getWeightClass(block.textWeight ?? "medium")} ${getBlockTextSizeClass(block.textSize, theme.bodySize)}`}
                                style={{ color: block.textColor ?? theme.textColor ?? "#0f172a" }}
                              >
                                {entry.label || "-"}
                              </span>
                              <span
                                className={`${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, theme.bodySize)}`}
                                style={{ color: block.textColor ?? theme.textColor ?? "#0f172a" }}
                              >
                                {entry.value || "-"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }
                if (block.type === "quote") {
                  return (
                    <div key={block.id} style={getBlockContainerStyle(block, theme)}>
                      <blockquote className="rounded-xl border-l-4 border-emerald-400 bg-emerald-50/50 px-4 py-3">
                        <p
                          className={`whitespace-pre-wrap italic ${getWeightClass(block.textWeight ?? "medium")} ${getBlockTextSizeClass(block.textSize, theme.bodySize)}`}
                          style={{ color: block.textColor ?? theme.textColor ?? "#0f172a" }}
                        >
                          {block.text || "引用文"}
                        </p>
                        {(block.quoteAuthor ?? "").trim() && (
                          <p
                            className={`mt-2 ${getBlockTextSizeClass("sm", theme.bodySize)} text-slate-600`}
                            style={{ color: block.textColor ?? theme.textColor ?? "#475569" }}
                          >
                            {block.quoteAuthor}
                          </p>
                        )}
                      </blockquote>
                    </div>
                  );
                }
                if (block.type === "checklist") {
                  return (
                    <div key={block.id} style={getBlockContainerStyle(block, theme)}>
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <ul className="space-y-2">
                          {(block.checklistItems ?? []).map((entry) => (
                            <li key={entry.id} className="flex items-start gap-2">
                              <span className="mt-0.5 text-emerald-600">✓</span>
                              <span
                                className={`${getWeightClass(block.textWeight ?? "medium")} ${getBlockTextSizeClass(block.textSize, theme.bodySize)}`}
                                style={{ color: block.textColor ?? theme.textColor ?? "#0f172a" }}
                              >
                                {entry.text || "項目を入力"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                }
                if (block.type === "gallery") {
                  const galleryItems = (block.galleryItems ?? []).filter((entry) => entry.url.trim());
                  return (
                    <div key={block.id} style={getBlockContainerStyle(block, theme)}>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {galleryItems.map((entry) => (
                          <figure key={entry.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <Image
                              src={entry.url}
                              alt={entry.caption || "gallery"}
                              width={640}
                              height={360}
                              unoptimized
                              className="h-44 w-full object-cover"
                            />
                            {(entry.caption ?? "").trim() && (
                              <figcaption className="px-3 py-2 text-xs text-slate-600">{entry.caption}</figcaption>
                            )}
                          </figure>
                        ))}
                      </div>
                    </div>
                  );
                }
                if (block.type === "columnGroup") {
                  const items = block.columnGroupItems ?? [];
                  const columnsClass = items.length >= 4 ? "sm:grid-cols-4" : items.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
                  return (
                    <div key={block.id} style={getBlockContainerStyle(block, theme)}>
                      <div className={`grid gap-2 ${columnsClass}`}>
                        {items.map((entry) => (
                          <div key={entry.id} className={`${getCardRadiusClass(block.cardRadius)} border border-slate-200 bg-slate-50/70 p-3`}>
                            <p
                              className={`mb-1 ${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, theme.bodySize)}`}
                              style={{ color: block.textColor ?? theme.textColor ?? "#0f172a" }}
                            >
                              {entry.title || "タイトル"}
                            </p>
                            <p
                              className={`whitespace-pre-wrap ${getBlockTextSizeClass(block.textSize, theme.bodySize)}`}
                              style={{ color: block.textColor ?? theme.textColor ?? "#0f172a" }}
                            >
                              {entry.body || ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                if (block.type === "space") {
                  return (
                    <div key={block.id} style={getBlockContainerStyle(block, theme)}>
                      <div className={getSpaceHeightClass(block.spacing)} />
                    </div>
                  );
                }
                return (
                  <div key={block.id} style={getBlockContainerStyle(block, theme)}>
                    <hr
                      className="border-slate-200"
                      style={getDividerThicknessStyle(block.dividerThickness, block.dividerColor)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <footer className="border-t border-emerald-100 bg-[linear-gradient(180deg,#fffdf7,#f8fafc)] px-4 py-4 sm:px-6">
              <p className="text-xs leading-6 text-slate-600">
              ご不明な点はスタッフまでお声がけください。
            </p>
          </footer>
        </article>
      </div>
    </main>
  );
}
