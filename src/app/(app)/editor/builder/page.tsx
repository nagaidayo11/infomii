"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * LP「ページビルダーを開く」→ ダッシュボードへリダイレクト。
 * ページ作成はダッシュボードの「ページを作成」から。
 */
export default function PageBuilderRedirect() {
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
