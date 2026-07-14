"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatAuthCallbackError } from "@/lib/auth-oauth-errors";
import { buildAuthConfirmedUrl, buildLoginConfirmedUrl } from "@/lib/auth-redirect";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { ensureUserHotelScope } from "@/lib/storage";

function sanitizeNextPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

type EmailOtpType = "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email";

function resolveEmailOtpType(flowType: string | null): EmailOtpType {
  switch (flowType) {
    case "signup":
      return "signup";
    case "invite":
      return "invite";
    case "magiclink":
      return "magiclink";
    case "recovery":
      return "recovery";
    case "email_change":
      return "email_change";
    default:
      return "email";
  }
}

function redirectToLoginWithAuthError(
  router: ReturnType<typeof useRouter>,
  error: string,
  errorDescription: string,
) {
  const params = new URLSearchParams({
    error,
    error_description: errorDescription,
  });
  router.replace(`/login?${params.toString()}`);
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

    const authError = formatAuthCallbackError(
      searchParams.get("error"),
      searchParams.get("error_description"),
    );
    if (authError) {
      redirectToLoginWithAuthError(
        router,
        searchParams.get("error") ?? "auth_error",
        authError,
      );
      return;
    }

    const flowType = searchParams.get("type");
    const nextPath = sanitizeNextPath(searchParams.get("next"));
    const isAppClient = searchParams.get("client") === "app";
    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");

    let active = true;

    void (async () => {
      try {
        if (tokenHash) {
          const { error } = await client.auth.verifyOtp({
            token_hash: tokenHash,
            type: resolveEmailOtpType(flowType),
          });
          if (error) {
            if (!active) return;
            redirectToLoginWithAuthError(
              router,
              "email_confirm_failed",
              error.message ?? "メール確認リンクの処理に失敗しました。",
            );
            return;
          }
        } else if (code) {
          const { error } = await client.auth.exchangeCodeForSession(code);
          if (error) {
            if (!active) return;
            redirectToLoginWithAuthError(
              router,
              "exchange_failed",
              error.message ?? "認証コードの処理に失敗しました。",
            );
            return;
          }
        }

        const { data, error: sessionError } = await client.auth.getSession();
        if (sessionError) {
          if (!active) return;
          redirectToLoginWithAuthError(
            router,
            "session_error",
            sessionError.message ?? "セッションの取得に失敗しました。",
          );
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

        try {
          await ensureUserHotelScope();
        } catch {
          /* AuthGate / login will retry; still send user toward their destination. */
        }

        const preferred = nextPath ?? (isAppClient ? "/dashboard?client=app" : "/dashboard");
        if (!active) return;
        router.replace(preferred);      } catch (err) {
        if (!active) return;
        const description =
          err instanceof Error ? err.message : "認証処理中にエラーが発生しました。";
        redirectToLoginWithAuthError(router, "callback_failed", description);
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
