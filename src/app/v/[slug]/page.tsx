import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { GuestCardPageView } from "@/components/guest/GuestCardPageView";
import type { EditorCard, CardType } from "@/components/editor/types";
import { getVisitorLocaleFromHeader, normalizeLocale, type SupportedLocale } from "@/lib/localized-content";
import { buildGuestPreviewBackLink } from "@/lib/app-href";
import { fetchResolvedGuestShellForPage } from "@/lib/server/guest-shell-resolve";
import { resolveGuestNavLinkLimit } from "@/lib/plan-limits";
import { getSupabaseAdminServerClient } from "@/lib/server/supabase-server";
import { normalizeCardWidthModeContent } from "@/lib/editor/card-width-mode";
import { applyLiveOpsByKeyToCards } from "@/lib/editor/live-ops/status";
import { resolveAllPageLiveOpsWithClient } from "@/lib/editor/live-ops/page-store";
import { normalizePageAtmosphere } from "@/lib/page-atmosphere";
import type { PageBackgroundStyle } from "@/lib/storage";

/** Live ops (and other live card fields) must not be served from a stale RSC cache. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

const STYLE_KEY = "_style";
const PAGE_STYLE_KEY = "_pageStyle";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string; lang?: string; from?: string; returnEditor?: string; client?: string }>;
};

function hasLocalizedPayload(value: unknown): boolean {
  if (!value) return false;
  if (Array.isArray(value)) return value.some((item) => hasLocalizedPayload(item));
  if (typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  const hasLocaleShape =
    typeof obj.ja === "string" &&
    ((typeof obj.en === "string" && obj.en.trim().length > 0) ||
      (typeof obj.zh === "string" && obj.zh.trim().length > 0) ||
      (typeof obj.ko === "string" && obj.ko.trim().length > 0));
  if (hasLocaleShape) return true;
  return Object.values(obj).some((item) => hasLocalizedPayload(item));
}

function readPageBackground(rows: Array<{ content: Record<string, unknown> }>): PageBackgroundStyle | null {
  const first = rows[0];
  if (!first || typeof first.content !== "object" || !first.content || Array.isArray(first.content)) {
    return null;
  }
  const raw = (first.content as Record<string, unknown>)[PAGE_STYLE_KEY];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const bg = obj.background;
  if (!bg || typeof bg !== "object" || Array.isArray(bg)) return null;
  const background = bg as Record<string, unknown>;
  const atmosphere = normalizePageAtmosphere(background.atmosphere);
  return {
    mode: background.mode === "gradient" ? "gradient" : "solid",
    color: typeof background.color === "string" ? background.color : "#ffffff",
    from: typeof background.from === "string" ? background.from : "#f8fafc",
    to: typeof background.to === "string" ? background.to : "#e2e8f0",
    angle: typeof background.angle === "number" ? background.angle : 180,
    ...(atmosphere !== "none" ? { atmosphere } : {}),
  };
}

export default async function PublicCardPageBySlug({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const isPreviewRequest = query.preview === "1";
  const fromSlug = typeof query.from === "string" && query.from.trim() ? query.from.trim() : "";
  const returnEditorPageId =
    typeof query.returnEditor === "string" && query.returnEditor.trim() ? query.returnEditor.trim() : "";
  const isAppClient = query.client === "app";
  const requestHeaders = await headers();
  const acceptLanguage = requestHeaders.get("accept-language");
  const forcedFromUrl =
    typeof query.lang === "string" && query.lang.trim() !== ""
      ? normalizeLocale(query.lang.trim())
      : null;
  const initialLocale: SupportedLocale =
    forcedFromUrl ?? getVisitorLocaleFromHeader(acceptLanguage);

  const supabase = getSupabaseAdminServerClient();
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("id,title,slug,hotel_id")
    .eq("slug", slug)
    .maybeSingle();

  if (pageError || !page) notFound();

  const { data: infoRow } = await supabase
    .from("informations")
    .select("status,hotel_id")
    .eq("slug", slug)
    .maybeSingle();
  const hotelIdForLocaleToggle =
    page.hotel_id ??
    (infoRow && typeof infoRow === "object" && "hotel_id" in infoRow
      ? ((infoRow as { hotel_id?: string | null }).hotel_id ?? null)
      : null);
  const { data: subRows } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("hotel_id", hotelIdForLocaleToggle)
    .order("updated_at", { ascending: false })
    .limit(1);
  const plan = (subRows?.[0]?.plan ?? "free") as "free" | "pro" | "business";
  const canShowLocaleToggle = plan === "business";
  const guestNavMaxVisible = resolveGuestNavLinkLimit(plan);
  const guestShell = await fetchResolvedGuestShellForPage(supabase, {
    id: page.id,
    hotel_id: hotelIdForLocaleToggle,
  });
  const isPublished = infoRow?.status === "published";
  if (!isPublished && !isPreviewRequest) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-[420px] overflow-x-hidden bg-[#fafafa] px-3 py-8 sm:px-6 sm:py-12">
        <h1 className="mb-4 text-xl font-semibold text-slate-900">公開OFFエラー</h1>
        <p className="text-sm leading-relaxed text-slate-600">
          現在公開OFFになっています。公開ONにしてから、QRコードまたは公開URLをご利用ください。
        </p>
      </main>
    );
  }

  const { data: rows, error: cardsError } = await supabase
    .from("cards")
    .select("id,type,content,order")
    .eq("page_id", page.id)
    .order("order", { ascending: true });

  if (cardsError) notFound();
  const pageBackground = readPageBackground((rows ?? []) as Array<{ content: Record<string, unknown> }>);

  const cards: EditorCard[] = (rows ?? []).map((r) => ({
    // Keep public rendering in sync with editor persistence:
    // style is stored in content._style when saved from editor.
    ...(typeof r.content === "object" &&
    r.content &&
    !Array.isArray(r.content) &&
    STYLE_KEY in (r.content as Record<string, unknown>) &&
    typeof (r.content as Record<string, unknown>)[STYLE_KEY] === "object"
      ? {
          style: (r.content as Record<string, unknown>)[STYLE_KEY] as Record<string, unknown>,
        }
      : {}),
    id: r.id,
    type: (r.type ?? "text") as CardType,
    content:
      typeof r.content === "object" && r.content && !Array.isArray(r.content)
        ? normalizeCardWidthModeContent(
            (r.type ?? "text") as string,
            Object.fromEntries(
              Object.entries(r.content as Record<string, unknown>).filter(([key]) => key !== STYLE_KEY)
                .filter(([key]) => key !== PAGE_STYLE_KEY)
            ),
          )
        : {},
    order: r.order ?? 0,
  }));

  const liveOps = await resolveAllPageLiveOpsWithClient(
    supabase,
    page.id,
    (rows ?? []).map((r) => ({ type: (r.type ?? "text") as string, content: r.content })),
  );
  const { cards: cardsWithOps } = applyLiveOpsByKeyToCards(cards, liveOps);
  const hasMultilingualContent = cardsWithOps.some((card) => hasLocalizedPayload(card.content));
  const showLocaleToggle = canShowLocaleToggle || hasMultilingualContent;
  const backLink = buildGuestPreviewBackLink({
    fromSlug: fromSlug || undefined,
    returnEditorPageId: returnEditorPageId || undefined,
    isPreview: isPreviewRequest,
    lang: typeof query.lang === "string" && query.lang.trim() ? query.lang.trim() : undefined,
    isAppClient,
  });

  return (
    <GuestCardPageView
      title={page.title}
      cards={cardsWithOps}
      initialLocale={initialLocale}
      localeLocked={Boolean(forcedFromUrl)}
      pageBackground={pageBackground}
      unpublishedPreview={false}
      showLocaleToggle={showLocaleToggle}
      businessFeaturesEnabled={canShowLocaleToggle}
      guestNavMaxVisible={guestNavMaxVisible}
      localeToggleHint={null}
      guestShell={guestShell}
      currentSlug={page.slug}
      preview={isPreviewRequest}
      clientApp={isAppClient}
      backButton={
        backLink ? (
          <a
            href={backLink.href}
            className="guest-page-link inline-flex min-h-[32px] items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm"
          >
            {backLink.label}
          </a>
        ) : null
      }
    />
  );
}
