"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function RootPage() {
  const router = useRouter();
  const { user, loading, enabled } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const code = sp.get("code");
    const hash = window.location.hash;
    if (code || hash.includes("access_token")) {
      const target = new URL("infomii://auth/callback");
      if (code) {
        sp.forEach((value, key) => target.searchParams.set(key, value));
        window.location.replace(target.toString());
      } else {
        window.location.replace(`infomii://auth/callback${hash}`);
      }
      return;
    }

    if (loading) return;
    if (!enabled || !user) {
      router.replace("/lp/saas");
      return;
    }
    router.replace("/dashboard");
  }, [enabled, loading, router, user]);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-slate-50">
      <p className="text-sm text-slate-500">読み込み中...</p>
    </main>
  );
}
