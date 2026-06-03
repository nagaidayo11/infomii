"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { withAppClientQuery } from "@/lib/app-href";
import { isLaunchOnboardingCompleted } from "@/lib/launch-onboarding";
import { ensureUserHotelScope } from "@/lib/storage";
import { isAccessRevokedError } from "@/lib/access-revoked";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAppShell } = useClientShell();
  const { user, loading, enabled } = useAuth();
  const [scopeChecked, setScopeChecked] = useState(false);

  useEffect(() => {
    if (!enabled || loading || user) {
      return;
    }
    if (!isLaunchOnboardingCompleted()) {
      router.replace(isAppShell ? withAppClientQuery("/onboarding") : "/onboarding");
      return;
    }
    const nextPath = pathname ?? "/dashboard";
    const loginNext = isAppShell ? withAppClientQuery(nextPath) : nextPath;
    router.replace(`/login?next=${encodeURIComponent(loginNext)}`);
  }, [enabled, isAppShell, loading, user, router, pathname]);

  useEffect(() => {
    if (!enabled || loading || !user) return;
    let active = true;
    setScopeChecked(false);
    void (async () => {
      try {
        await ensureUserHotelScope();
        if (active) setScopeChecked(true);
      } catch (error) {
        if (!active) return;
        if (isAccessRevokedError(error)) {
          router.replace("/_not-found");
          return;
        }
        setScopeChecked(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [enabled, loading, user, router]);

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

  if (loading || !user || (user && !scopeChecked)) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-xl px-4 py-10 sm:px-6">
        <p className="text-sm text-slate-600">認証状態を確認しています...</p>
      </main>
    );
  }

  return <>{children}</>;
}
