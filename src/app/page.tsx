"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function RootPage() {
  const router = useRouter();
  const { user, loading, enabled } = useAuth();

  useEffect(() => {
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
