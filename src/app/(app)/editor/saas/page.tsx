"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SaasEditor } from "@/components/saas-editor";
import { createSaasPage } from "@/lib/saas-editor-db";

/**
 * New SaaS editor: create a page and redirect to /editor/saas/[id].
 */
export default function SaasEditorNewPage() {
  const router = useRouter();

  useEffect(() => {
    createSaasPage("Untitled").then((page) => {
      if (page) {
        router.replace(`/editor/saas/${page.id}`);
      } else {
        router.replace("/editor/saas");
      }
    });
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-100">
      <p className="text-sm text-slate-600">Creating page…</p>
    </div>
  );
}
