"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";

/**
 * Fallback if middleware does not run (or presence cookie is not warm yet).
 * Prefer the HTTP redirect in `src/middleware.ts` for SEO.
 */
export default function RootPage() {
  const { user, loading, enabled } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!enabled || !user) {
      window.location.replace("/lp/business");
      return;
    }
    window.location.replace("/dashboard");
  }, [enabled, loading, user]);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-slate-50">
      <p className="text-sm text-slate-500">読み込み中...</p>
    </main>
  );
}
