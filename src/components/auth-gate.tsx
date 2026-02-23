"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, enabled } = useAuth();

  useEffect(() => {
    if (!enabled || loading || user) {
      return;
    }
    router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [enabled, loading, user, router, pathname]);

  if (!enabled) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-xl px-4 py-10 sm:px-6">
        <h1 className="mb-3 text-xl font-semibold">Supabaseの接続設定が必要です</h1>
        <p className="text-sm leading-7 text-slate-700">
          認証機能を使うには `.env.local` に Supabase の URL と anon key を設定してください。
        </p>
      </main>
    );
  }

  if (loading || !user) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-xl px-4 py-10 sm:px-6">
        <p className="text-sm text-slate-600">認証状態を確認しています...</p>
      </main>
    );
  }

  return <>{children}</>;
}
