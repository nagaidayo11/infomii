"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { AppSettingsCard } from "@/components/app-shell/AppSettingsCard";
import { AppSettingsIconEmail, AppSettingsIconGoogle } from "@/components/app-shell/icons/AppSettingsIcons";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { useAuth } from "@/components/auth-provider";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { hasSupabaseEnv } from "@/lib/supabase-config";

const GOOGLE_LINK_INTENT_KEY = "infomii_google_link_intent";

function hasGoogleIdentity(user: User | null): boolean {
  if (!user) return false;

  const appMetadata = user.app_metadata as { provider?: string; providers?: string[] } | undefined;
  if (appMetadata?.provider === "google") return true;
  if (Array.isArray(appMetadata?.providers) && appMetadata.providers.includes("google")) return true;

  const withIdentities = user as User & { identities?: Array<{ provider?: string }> };
  if (Array.isArray(withIdentities.identities)) {
    return withIdentities.identities.some((identity) => identity.provider === "google");
  }

  return false;
}

function formatReauthError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return "パスワードが正しくありません。";
  }
  if (normalized.includes("email not confirmed")) {
    return "メール確認が完了していません。受信メールをご確認ください。";
  }
  return "再認証に失敗しました。時間をおいて再度お試しください。";
}

function formatGoogleLinkError(message: string): string {
  const normalized = message.toLowerCase();
  if (
    normalized.includes("already registered") ||
    normalized.includes("already exists") ||
    normalized.includes("identity already exists")
  ) {
    return "同じメールの既存アカウントがある場合は、メールでログイン後に連携してください。";
  }
  if (normalized.includes("provider is not enabled")) {
    return "Google連携の設定が未完了です。管理者にお問い合わせください。";
  }
  if (normalized.includes("access_denied")) {
    return "Google連携がキャンセルされました。もう一度お試しください。";
  }
  if (normalized.includes("manual linking is disabled")) {
    return "Google連携解除は現在無効です。Supabase の Authentication 設定で Manual linking を有効化してください。";
  }
  return "Google連携に失敗しました。再度お試しください。";
}

export function AccountAuthLinkSection() {
  const { isAppShell } = useClientShell();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [checking, setChecking] = useState(true);
  const [googleLinked, setGoogleLinked] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");
  const [reauthModalOpen, setReauthModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [reauthBusy, setReauthBusy] = useState(false);
  const [reauthError, setReauthError] = useState("");
  const [unlinkModalOpen, setUnlinkModalOpen] = useState(false);
  const [unlinkPassword, setUnlinkPassword] = useState("");
  const [unlinkBusy, setUnlinkBusy] = useState(false);
  const [unlinkError, setUnlinkError] = useState("");

  const canUseSupabase = hasSupabaseEnv;
  const hasUserEmail = useMemo(() => Boolean(user?.email), [user?.email]);

  const refreshLinkState = useCallback(async () => {
    const client = getBrowserSupabaseClient();
    if (!client) {
      setChecking(false);
      return;
    }
    const { data } = await client.auth.getUser();
    setGoogleLinked(hasGoogleIdentity(data.user ?? null));
    setChecking(false);
  }, []);

  useEffect(() => {
    void refreshLinkState();
  }, [refreshLinkState]);

  useEffect(() => {
    const oauthError = searchParams.get("error_description") ?? searchParams.get("error");
    if (!oauthError) return;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(GOOGLE_LINK_INTENT_KEY);
    }
    setMessageTone("error");
    setMessage(formatGoogleLinkError(oauthError));
    router.replace("/settings");
  }, [router, searchParams]);

  useEffect(() => {
    if (searchParams.get("link") !== "google") return;
    if (typeof window === "undefined") return;

    const intent = window.localStorage.getItem(GOOGLE_LINK_INTENT_KEY);
    if (intent !== "google_link") {
      setMessageTone("error");
      setMessage("Google連携の状態を確認できませんでした。もう一度お試しください。");
      router.replace("/settings");
      return;
    }

    window.localStorage.removeItem(GOOGLE_LINK_INTENT_KEY);
    setMessageTone("success");
    setMessage("Google連携が完了しました。");
    void refreshLinkState();
    router.replace("/settings");
  }, [router, searchParams, refreshLinkState]);

  async function startGoogleLink() {
    const client = getBrowserSupabaseClient();
    if (!client) {
      setMessageTone("error");
      setMessage("Supabase の設定が未完了です。.env.local を確認してください。");
      return;
    }

    if (!user?.email) {
      setMessageTone("error");
      setMessage("メールアドレス情報が取得できませんでした。再ログイン後にお試しください。");
      return;
    }

    setReauthBusy(true);
    setReauthError("");
    setMessage("");

    const { error: reauthErrorResult } = await client.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (reauthErrorResult) {
      setReauthError(formatReauthError(reauthErrorResult.message ?? ""));
      setReauthBusy(false);
      return;
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    if (typeof window !== "undefined") {
      window.localStorage.setItem(GOOGLE_LINK_INTENT_KEY, "google_link");
    }
    const { error: oauthError } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/settings?link=google`,
      },
    });

    if (oauthError) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(GOOGLE_LINK_INTENT_KEY);
      }
      setReauthBusy(false);
      setReauthModalOpen(false);
      setCurrentPassword("");
      setMessageTone("error");
      setMessage(formatGoogleLinkError(oauthError.message ?? ""));
      return;
    }
  }

  async function handleGoogleUnlink() {
    const client = getBrowserSupabaseClient();
    if (!client) {
      setMessageTone("error");
      setMessage("Supabase の設定が未完了です。.env.local を確認してください。");
      return;
    }

    if (!user?.email) {
      setUnlinkError("メールアドレス情報が取得できませんでした。再ログイン後にお試しください。");
      return;
    }

    setUnlinkBusy(true);
    setUnlinkError("");
    setMessage("");

    const { error: reauthErrorResult } = await client.auth.signInWithPassword({
      email: user.email,
      password: unlinkPassword,
    });

    if (reauthErrorResult) {
      setUnlinkError(formatReauthError(reauthErrorResult.message ?? ""));
      setUnlinkBusy(false);
      return;
    }

    const authWithOptionalUnlink = client.auth as unknown as {
      unlinkIdentity?: (args: { identity_id: string }) => Promise<{ error: { message?: string } | null }>;
      getUserIdentities?: () => Promise<{
        data: { identities: Array<{ identity_id: string; provider: string }> } | null;
        error: { message?: string } | null;
      }>;
    };

    if (typeof authWithOptionalUnlink.unlinkIdentity !== "function" || typeof authWithOptionalUnlink.getUserIdentities !== "function") {
      setUnlinkBusy(false);
      setUnlinkModalOpen(false);
      setUnlinkPassword("");
      setMessageTone("error");
      setMessage("この環境ではGoogle連携解除に未対応です。Supabase SDK を確認してください。");
      return;
    }

    const identitiesResult = await authWithOptionalUnlink.getUserIdentities();
    const googleIdentity = identitiesResult.data?.identities?.find((identity) => identity.provider === "google");
    if (!googleIdentity?.identity_id) {
      setUnlinkBusy(false);
      setUnlinkModalOpen(false);
      setUnlinkPassword("");
      setMessageTone("error");
      setMessage("Google連携情報を取得できませんでした。時間をおいて再度お試しください。");
      return;
    }
    const { error } = await authWithOptionalUnlink.unlinkIdentity({ identity_id: googleIdentity.identity_id });
    if (error) {
      setUnlinkBusy(false);
      setUnlinkError(formatGoogleLinkError(error.message ?? ""));
      return;
    }

    setUnlinkBusy(false);
    setUnlinkModalOpen(false);
    setUnlinkPassword("");
    setMessageTone("success");
    setMessage("Google連携を解除しました。");
    void refreshLinkState();
  }

  return (
    <>
      <AppSettingsCard className={isAppShell ? "app-settings-auth-card" : ""}>
        {isAppShell ? null : (
          <>
            <h2 className="text-base font-semibold text-slate-900">アカウント連携</h2>
            <p className="app-settings-card-desc mt-1 text-sm text-slate-600">
              Google連携を行うと、次回から Google でも同じアカウントにログインできます。
            </p>
          </>
        )}

        <div
          className={
            isAppShell
              ? "app-settings-rows"
              : "app-settings-link-rows mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/60 divide-y divide-slate-200"
          }
        >
          <div className="app-settings-row app-settings-row--icon flex items-center justify-between px-3 py-2.5 sm:px-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="app-settings-row-icon">
                <AppSettingsIconEmail size={22} />
              </span>
              <p className="text-sm font-medium text-slate-700">メールログイン</p>
            </div>
            <span
              className={
                isAppShell
                  ? "app-settings-status-pill app-settings-status-pill--on"
                  : "inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200"
              }
            >
              連携済み
            </span>
          </div>

          <div className="app-settings-row app-settings-row--icon flex items-center justify-between px-3 py-2.5 sm:px-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="app-settings-row-icon">
                <AppSettingsIconGoogle size={22} />
              </span>
              <p className="text-sm font-medium text-slate-700">Googleログイン</p>
            </div>
            {checking ? (
              <span className="text-xs text-slate-500">確認中...</span>
            ) : googleLinked ? (
              <span
                className={
                  isAppShell
                    ? "app-settings-status-pill app-settings-status-pill--on"
                    : "inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200"
                }
              >
                連携済み
              </span>
            ) : (
              <span
                className={
                  isAppShell
                    ? "app-settings-status-pill app-settings-status-pill--off"
                    : "inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600"
                }
              >
                未連携
              </span>
            )}
          </div>
        </div>

        {!googleLinked ? (
          <div
            className={
              isAppShell
                ? "app-settings-auth-action"
                : "app-settings-link-actions mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
            }
          >
            <button
              type="button"
              onClick={() => {
                setReauthError("");
                setCurrentPassword("");
                setReauthModalOpen(true);
              }}
              disabled={!canUseSupabase || checking || !hasUserEmail}
              className={
                "app-button-native app-touch-btn-primary inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60" +
                (isAppShell ? " w-full" : "")
              }
            >
              Googleを連携
            </button>
          </div>
        ) : isAppShell ? (
          <button
            type="button"
            onClick={() => {
              setUnlinkError("");
              setUnlinkPassword("");
              setUnlinkModalOpen(true);
            }}
            disabled={!canUseSupabase || checking || !hasUserEmail}
            className="app-settings-auth-unlink app-pressable ui-pop-tap"
          >
            Google連携を解除
          </button>
        ) : (
          <div className="app-settings-link-actions mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled
              className="app-button-native inline-flex min-h-[44px] items-center justify-center rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed"
            >
              Google連携済み
            </button>
            <button
              type="button"
              onClick={() => {
                setUnlinkError("");
                setUnlinkPassword("");
                setUnlinkModalOpen(true);
              }}
              disabled={!canUseSupabase || checking || !hasUserEmail}
              className="app-button-native inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Google連携を解除
            </button>
          </div>
        )}

        {message ? (
          <p className={`mt-3 text-sm ${messageTone === "success" ? "text-emerald-600" : "text-rose-600"}`}>
            {message}
          </p>
        ) : null}
      </AppSettingsCard>

      {reauthModalOpen ? (
        <div className="app-settings-modal-overlay ui-overlay-fade fixed inset-0 z-[90] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="app-settings-modal ui-pop-in w-full max-w-md rounded-t-lg border border-[#e6e8eb] bg-white p-6 shadow-md sm:rounded-lg">
            <h3 className="text-lg font-semibold text-slate-900">本人確認</h3>
            <p className="mt-2 text-sm text-slate-600">
              セキュリティ保護のため、現在のパスワードを入力してください。
            </p>

            <div className="mt-4">
              <label htmlFor="reauth-password" className="block text-sm font-medium text-slate-700">
                現在のパスワード
              </label>
              <input
                id="reauth-password"
                name="reauth-password"
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="現在のパスワードを入力"
              />
            </div>

            {reauthError ? <p className="mt-3 text-sm text-rose-600">{reauthError}</p> : null}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  if (reauthBusy) return;
                  setReauthModalOpen(false);
                  setCurrentPassword("");
                  setReauthError("");
                }}
                className="app-button-native rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => void startGoogleLink()}
                disabled={reauthBusy || !currentPassword.trim()}
                className="app-button-native rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold !text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reauthBusy ? "確認中..." : "確認して続行"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {unlinkModalOpen ? (
        <div className="app-settings-modal-overlay ui-overlay-fade fixed inset-0 z-[90] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="app-settings-modal ui-pop-in w-full max-w-md rounded-t-lg border border-[#e6e8eb] bg-white p-6 shadow-md sm:rounded-lg">
            <h3 className="text-lg font-semibold text-slate-900">Google連携を解除</h3>
            <p className="mt-2 text-sm text-slate-600">
              セキュリティ保護のため、現在のパスワードを入力して解除を確定してください。
            </p>

            <div className="mt-4">
              <label htmlFor="unlink-password" className="block text-sm font-medium text-slate-700">
                現在のパスワード
              </label>
              <input
                id="unlink-password"
                name="unlink-password"
                type="password"
                autoComplete="current-password"
                required
                value={unlinkPassword}
                onChange={(event) => setUnlinkPassword(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="現在のパスワードを入力"
              />
            </div>

            {unlinkError ? <p className="mt-3 text-sm text-rose-600">{unlinkError}</p> : null}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  if (unlinkBusy) return;
                  setUnlinkModalOpen(false);
                  setUnlinkPassword("");
                  setUnlinkError("");
                }}
                className="app-button-native rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => void handleGoogleUnlink()}
                disabled={unlinkBusy || !unlinkPassword.trim()}
                className="app-button-native rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold !text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {unlinkBusy ? "解除中..." : "解除する"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
