"use client";

import { Suspense, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

function LegacyEditorRedirectInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = typeof params.id === "string" ? params.id : null;

  useEffect(() => {
    if (!id) return;
    const q = searchParams.toString();
    const path = q ? `/editor/page/${id}?${q}` : `/editor/page/${id}`;
    router.replace(path);
  }, [id, router, searchParams]);

  if (!id) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center text-slate-500">
        ページが見つかりません
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-screen items-center justify-center text-slate-500">
      リダイレクト中…
    </div>
  );
}

/**
 * Legacy /editor/[id] route: redirect to the card editor at /editor/page/[id].
 * Keeps query params (e.g. ?billing=success, ?guide=start).
 */
export default function LegacyEditorRedirect() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-screen items-center justify-center text-slate-500">
          読み込み中…
        </div>
      }
    >
      <LegacyEditorRedirectInner />
    </Suspense>
  );
}
