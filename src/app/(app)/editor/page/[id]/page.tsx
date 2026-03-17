"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * 廃止: /editor/page/[id] は /editor/[id] にリダイレクト。
 * 正規URL: /editor/[id]
 */
export default function EditorPageRedirect() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : null;

  useEffect(() => {
    if (id) {
      router.replace(`/editor/${id}`);
    } else {
      router.replace("/dashboard");
    }
  }, [id, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-100">
      <p className="text-sm text-slate-600">リダイレクト中…</p>
    </div>
  );
}
