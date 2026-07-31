"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { AppAuthBootScreen } from "@/components/app-shell/AppAuthBootScreen";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { withAppClientQuery } from "@/lib/app-href";
import { shouldShowLaunchOnboarding } from "@/lib/launch-onboarding";
import {
  clearCachedAuthScopeUserId,
  hasCachedAuthScope,
  writeCachedAuthScopeUserId,
} from "@/lib/session-resume-cache";
import { ensureUserHotelScope } from "@/lib/storage";
import { isAccessRevokedError } from "@/lib/access-revoked";

const SCOPE_CHECK_TIMEOUT_MS = 7_000;
const APP_BOOT_RECOVERY_MS = 9_000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error("timeout"));
    }, timeoutMs);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAppShell } = useClientShell();
  const { user, loading, enabled } = useAuth();
  const [scopeChecked, setScopeChecked] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const checkingScopeUserIdRef = useRef<string | null>(null);
  const bootWaiting = enabled && (loading || !user || Boolean(user && !scopeChecked && !hasCachedAuthScope(user.id)));

  useEffect(() => {
    if (!isAppShell || !bootWaiting) {
      setShowRecovery(false);
      return;
    }
    const timer = window.setTimeout(() => setShowRecovery(true), APP_BOOT_RECOVERY_MS);
    return () => window.clearTimeout(timer);
  }, [bootWaiting, isAppShell]);

  useEffect(() => {
    if (!enabled || loading || user) {
      return;
    }
    clearCachedAuthScopeUserId();
    if (shouldShowLaunchOnboarding(isAppShell)) {
      router.replace(withAppClientQuery("/onboarding"));
      return;
    }
    const nextPath = pathname ?? "/dashboard";
    const loginNext = isAppShell ? withAppClientQuery(nextPath) : nextPath;
    router.replace(`/login?next=${encodeURIComponent(loginNext)}`);
  }, [enabled, isAppShell, loading, user, router, pathname]);

  useEffect(() => {
    const userId = user?.id;
    if (!enabled || loading || !userId) {
      if (!userId) setScopeChecked(false);
      checkingScopeUserIdRef.current = null;
      return;
    }

    const scopeCached = hasCachedAuthScope(userId);
    if (scopeCached) {
      setScopeChecked(true);
      return;
    }
    if (checkingScopeUserIdRef.current === userId) {
      return;
    }
    checkingScopeUserIdRef.current = userId;
    setScopeChecked(false);

    let active = true;
    void (async () => {
      try {
        await withTimeout(ensureUserHotelScope(), SCOPE_CHECK_TIMEOUT_MS);
        if (!active) return;
        writeCachedAuthScopeUserId(userId);
        setScopeChecked(true);
      } catch (error) {
        if (!active) return;
        if (isAccessRevokedError(error)) {
          clearCachedAuthScopeUserId();
          const loginNext = isAppShell ? withAppClientQuery("/dashboard") : "/dashboard";
          router.replace(`/login?access=revoked&next=${encodeURIComponent(loginNext)}`);
          return;
        }
        writeCachedAuthScopeUserId(userId);
        setScopeChecked(true);
      } finally {
        if (active && checkingScopeUserIdRef.current === userId) {
          checkingScopeUserIdRef.current = null;
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [enabled, loading, user?.id, router, isAppShell]);

  const scopeReady = Boolean(user && (scopeChecked || hasCachedAuthScope(user.id)));

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

  if (loading || !user || !scopeReady) {
    if (isAppShell) {
      const isEditor = (pathname ?? "").startsWith("/editor");
      const nextPath = pathname ?? "/dashboard";
      const loginNext = withAppClientQuery(nextPath);
      return (
        <AppAuthBootScreen
          variant={isEditor ? "editor" : "tabs"}
          recoverable={showRecovery}
          onRetry={() => window.location.reload()}
          onLogin={() => router.replace(`/login?next=${encodeURIComponent(loginNext)}`)}
        />
      );
    }
    return (
      <main className="mx-auto min-h-screen w-full max-w-xl px-4 py-10 sm:px-6">
        <p className="text-sm text-slate-600">認証状態を確認しています...</p>
      </main>
    );
  }

  return <>{children}</>;
}
