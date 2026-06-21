import { useEditor2Store } from "@/components/editor/store";

/** True when the in-memory editor store already holds this page (SPA navigation / tab return). */
export function canResumeEditorPage(pageId: string | null | undefined): boolean {
  if (!pageId) return false;
  return useEditor2Store.getState().pageMeta.pageId === pageId;
}
