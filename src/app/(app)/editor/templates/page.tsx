"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy /editor/templates: redirect to card-editor template gallery.
 * Block-based editor UI has been removed; templates are at /templates.
 */
export default function EditorTemplatesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/templates");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-slate-500">
      リダイレクト中…
    </div>
  );
}
