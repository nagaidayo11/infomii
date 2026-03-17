"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * 廃止: /editor/saas/[id] は /dashboard にリダイレクト。
 * SaasEditor は別テーブル使用のため、メインエディタ（pages/cards）に統一。
 */
export default function SaasEditorRedirectPage() {
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
