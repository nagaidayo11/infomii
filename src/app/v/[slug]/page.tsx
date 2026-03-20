import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { GuestCardPageView } from "@/components/guest/GuestCardPageView";
import type { EditorCard, CardType } from "@/components/editor/types";
import { getVisitorLocaleFromHeader } from "@/lib/localized-content";
import { getSupabaseAdminServerClient } from "@/lib/server/supabase-server";

const STYLE_KEY = "_style";
const PAGE_STYLE_KEY = "_pageStyle";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function readPageBackground(rows: Array<{ content: Record<string, unknown> }>): {
  mode: "solid" | "gradient";
  color: string;
  from: string;
  to: string;
  angle: number;
} | null {
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
  return {
    mode: background.mode === "gradient" ? "gradient" : "solid",
    color: typeof background.color === "string" ? background.color : "#ffffff",
    from: typeof background.from === "string" ? background.from : "#f8fafc",
    to: typeof background.to === "string" ? background.to : "#e2e8f0",
    angle: typeof background.angle === "number" ? background.angle : 180,
  };
}

export default async function PublicCardPageBySlug({ params }: PageProps) {
  const { slug } = await params;
  const requestHeaders = await headers();
  const acceptLanguage = requestHeaders.get("accept-language");
  const initialLocale = getVisitorLocaleFromHeader(acceptLanguage);

  const supabase = getSupabaseAdminServerClient();
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("id,title,slug")
    .eq("slug", slug)
    .maybeSingle();

  if (pageError || !page) notFound();

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
        ? Object.fromEntries(
            Object.entries(r.content as Record<string, unknown>).filter(([key]) => key !== STYLE_KEY)
              .filter(([key]) => key !== PAGE_STYLE_KEY)
          )
        : {},
    order: r.order ?? 0,
  }));

  return (
    <GuestCardPageView
      title={page.title}
      cards={cards}
      initialLocale={initialLocale}
      pageBackground={pageBackground}
    />
  );
}
