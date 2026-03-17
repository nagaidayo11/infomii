"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * 廃止: /editor/saas は /dashboard にリダイレクト。
 * ページ作成はダッシュボードの「ページを作成」から /editor/[id] へ。
 */
export default function SaasEditorNewPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return (
    <div className="flex h-screen items-center justify-center bg-slate-100">
      <p className="text-sm text-slate-600">リダイレクト中…</p>
    </div>
  );
}
