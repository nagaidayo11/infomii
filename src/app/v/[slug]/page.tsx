import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { GuestCardPageView } from "@/components/guest/GuestCardPageView";
import type { EditorCard, CardType } from "@/components/editor/types";
import { getVisitorLocaleFromHeader } from "@/lib/localized-content";
import { getSupabaseAdminServerClient } from "@/lib/server/supabase-server";

type PageProps = {
  params: Promise<{ slug: string }>;
};

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

  const cards: EditorCard[] = (rows ?? []).map((r) => ({
    id: r.id,
    type: (r.type ?? "text") as CardType,
    content: (r.content as Record<string, unknown>) ?? {},
    order: r.order ?? 0,
  }));

  return (
    <GuestCardPageView
      title={page.title}
      cards={cards}
      initialLocale={initialLocale}
    />
  );
}
