"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * モバイル Google OAuth の戻り先（Supabase Redirect URLs に登録する固定 URL）。
 * 1. アプリ内ブラウザ: この URL へ遷移した時点で Expo が URL をアプリに返す（主経路）
 * 2. 外部 Safari 等: カスタムスキームへ転送してアプリを起動（フォールバック）
 */
function MobileCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("アプリに戻しています…");

  const appDeepLink = useMemo(() => {
    const base = "infomii://auth/callback";
    if (typeof window !== "undefined" && window.location.hash.length > 1) {
      return `${base}${window.location.hash}`;
    }
    const q = searchParams.toString();
    return q ? `${base}?${q}` : base;
  }, [searchParams]);

  useEffect(() => {
    const error =
      searchParams.get("error_description") ?? searchParams.get("error");
    if (error) {
      setStatus(decodeURIComponent(error));
      return;
    }

    const hasCode = searchParams.has("code");
    const hasHash =
      typeof window !== "undefined" &&
      window.location.hash.length > 1;

    if (!hasCode && !hasHash) {
      setStatus("認証情報が見つかりませんでした。アプリから再度お試しください。");
      return;
    }

    window.location.replace(appDeepLink);

    const t = window.setTimeout(() => {
      setStatus(
        "自動でアプリに戻れない場合は、Infomii アプリを開いた状態でもう一度 Google ログインをお試しください。",
      );
    }, 2500);

    return () => window.clearTimeout(t);
  }, [searchParams, appDeepLink]);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">ログイン処理中</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">{status}</p>
        <a
          href={appDeepLink}
          className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          アプリを開く
        </a>
      </div>
    </main>
  );
}

export default function MobileAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4">
          <p className="text-sm text-slate-600">読み込み中…</p>
        </main>
      }
    >
      <MobileCallbackContent />
    </Suspense>
  );
}
