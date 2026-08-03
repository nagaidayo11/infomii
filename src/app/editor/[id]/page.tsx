import { EditorPageClient } from "./EditorPageClient";

type EditorPageProps = {
  params: Promise<{ id?: string | string[] }>;
  searchParams?: Promise<{ from?: string | string[] }>;
};

/**
 * Editor page at /editor/[id]. Resolve route params on the server, then render
 * the client editor with stable initial props to avoid hydration drift.
 */
export default async function EditorPage({ params, searchParams }: EditorPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const id = resolvedParams.id;
  const from = resolvedSearchParams.from;
  const pageId = typeof id === "string" ? id : null;
  const fromTemplate = Array.isArray(from) ? from.includes("template") : from === "template";

  return <EditorPageClient pageId={pageId} fromTemplate={fromTemplate} />;
}
