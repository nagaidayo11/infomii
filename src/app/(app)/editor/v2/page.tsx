"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * 廃止: /editor/v2?pageId=xxx は /editor/[id] にリダイレクト。
 * 正規URL: /editor/[id]
 */
export default function EditorV2Redirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageId = searchParams.get("pageId");

  useEffect(() => {
    if (pageId) {
      router.replace(`/editor/${pageId}`);
    } else {
      router.replace("/dashboard");
    }
  }, [pageId, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-100">
      <p className="text-sm text-slate-600">リダイレクト中…</p>
    </div>
  );
}
