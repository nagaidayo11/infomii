"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AppSettingsCard } from "@/components/app-shell/AppSettingsCard";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { hasSupabaseEnv } from "@/lib/supabase-config";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { useAuth } from "@/components/auth-provider";
import { dispatchProfileDisplayNameUpdated } from "@/lib/use-profile-display-name";

export function ProfileDisplayNameSection() {
  const { isAppShell } = useClientShell();
  const { user } = useAuth();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");

  const load = useCallback(async () => {
    if (!user?.id || !hasSupabaseEnv) {
      setLoading(false);
      return;
    }
    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle();
    if (!error && data) {
      setValue(data.display_name ?? "");
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      setMessageTone("error");
      setMessage("Supabase の設定が未完了です。");
      return;
    }
    setSaving(true);
    setMessage("");
    const trimmed = value.trim();
    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        display_name: trimmed || null,
      },
      { onConflict: "user_id" },
    );
    if (error) {
      setMessageTone("error");
      setMessage("表示名の保存に失敗しました。時間をおいて再度お試しください。");
    } else {
      setMessageTone("success");
      setMessage("表示名を保存しました。");
      dispatchProfileDisplayNameUpdated(trimmed || null);
    }
    setSaving(false);
  }

  if (!user) {
    return null;
  }

  if (isAppShell) {
    return (
      <AppSettingsCard className="app-settings-profile-card">
        {loading ? (
          <div className="app-shell-skeleton h-11 rounded-xl" aria-label="読み込み中" />
        ) : (
          <form onSubmit={(ev) => void handleSubmit(ev)} className="app-settings-profile-form">
            <label htmlFor="display-name" className="app-settings-profile-label">
              表示名
            </label>
            <input
              id="display-name"
              name="display-name"
              type="text"
              value={value}
              onChange={(ev) => setValue(ev.target.value)}
              maxLength={80}
              autoComplete="nickname"
              className="app-settings-profile-input"
              placeholder="例: 山田 花子"
            />
            <button
              type="submit"
              disabled={saving || !hasSupabaseEnv}
              className="app-settings-profile-save app-pressable ui-pop-tap"
            >
              {saving ? "保存中…" : "保存"}
            </button>
          </form>
        )}
        {message ? (
          <p
            className={`app-settings-profile-message ${messageTone === "success" ? "is-success" : "is-error"}`}
          >
            {message}
          </p>
        ) : null}
      </AppSettingsCard>
    );
  }

  return (
    <AppSettingsCard>
      <h2 className="text-base font-semibold text-slate-900">表示名</h2>
      <p className="mt-1 text-sm text-slate-500">
        ダッシュボードの挨拶と、右上アカウントメニューに表示されます。
      </p>
      {loading ? (
        <div className="app-settings-loading mt-3 app-shell-skeleton h-12 rounded-xl" aria-label="読み込み中" />
      ) : (
        <form onSubmit={(ev) => void handleSubmit(ev)} className="mt-4 space-y-3">
          <div>
            <input
              id="display-name"
              name="display-name"
              type="text"
              value={value}
              onChange={(ev) => setValue(ev.target.value)}
              maxLength={80}
              autoComplete="nickname"
              aria-label="表示名"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="例: 施設 花子"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !hasSupabaseEnv}
            className="app-button-native inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "保存中…" : "保存"}
          </button>
        </form>
      )}
      {message ? (
        <p className={`mt-3 text-sm ${messageTone === "success" ? "text-emerald-600" : "text-rose-600"}`}>
          {message}
        </p>
      ) : null}
    </AppSettingsCard>
  );
}
