"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatOAuthCallbackError } from "@/lib/auth-oauth-errors";
import { buildAuthConfirmedUrl, buildLoginConfirmedUrl } from "@/lib/auth-redirect";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

function sanitizeNextPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("認証を処理しています…");

  useEffect(() => {
    const client = getBrowserSupabaseClient();
    if (!client) {
      setMessage("Supabase の設定が未完了です。");
      return;
    }

    const oauthError = formatOAuthCallbackError(
      searchParams.get("error"),
      searchParams.get("error_description"),
    );
    if (oauthError) {
      const params = new URLSearchParams({
        error: searchParams.get("error") ?? "auth_error",
        error_description: oauthError,
      });
      router.replace(`/login?${params.toString()}`);
      return;
    }

    const flowType = searchParams.get("type");
    const nextPath = sanitizeNextPath(searchParams.get("next"));
    const isAppClient = searchParams.get("client") === "app";
    const code = searchParams.get("code");

    let active = true;

    void (async () => {
      try {
        if (code) {
          const { error } = await client.auth.exchangeCodeForSession(code);
          if (error) {
            if (!active) return;
            const params = new URLSearchParams({
              error: "exchange_failed",
              error_description: error.message ?? "認証コードの処理に失敗しました。",
            });
            router.replace(`/login?${params.toString()}`);
            return;
          }
        }

        const { data, error: sessionError } = await client.auth.getSession();
        if (sessionError) {
          if (!active) return;
          const params = new URLSearchParams({
            error: "session_error",
            error_description: sessionError.message ?? "セッションの取得に失敗しました。",
          });
          router.replace(`/login?${params.toString()}`);
          return;
        }

        const isEmailConfirmation =
          flowType === "signup" ||
          flowType === "email" ||
          flowType === "email_change" ||
          flowType === "invite";

        if (isEmailConfirmation) {
          await client.auth.signOut();
          if (!active) return;
          router.replace(buildAuthConfirmedUrl(isAppClient ? "app" : undefined));
          return;
        }

        if (flowType === "recovery" || flowType === "magiclink") {
          if (!active) return;
          router.replace("/reset-password");
          return;
        }

        if (data.session && !nextPath && !flowType) {
          await client.auth.signOut();
          if (!active) return;
          router.replace(buildAuthConfirmedUrl(isAppClient ? "app" : undefined));
          return;
        }

        if (!data.session) {
          if (!active) return;
          router.replace(buildLoginConfirmedUrl(isAppClient ? "app" : undefined));
          return;
        }

        if (nextPath) {
          if (!active) return;
          router.replace(nextPath);
          return;
        }

        if (!active) return;
        router.replace(isAppClient ? "/dashboard?client=app" : "/dashboard");
      } catch (err) {
        if (!active) return;
        const description =
          err instanceof Error ? err.message : "認証処理中にエラーが発生しました。";
        const params = new URLSearchParams({
          error: "callback_failed",
          error_description: description,
        });
        router.replace(`/login?${params.toString()}`);
      }
    })();

    return () => {
      active = false;
    };
  }, [router, searchParams]);

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md items-center justify-center px-4">
      <p className="text-sm text-slate-600" role="status" aria-live="polite">
        {message}
      </p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-[100dvh] max-w-md items-center justify-center px-4">
          <p className="text-sm text-slate-600">認証を処理しています…</p>
        </main>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
