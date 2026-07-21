"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AppSettingsCard } from "@/components/app-shell/AppSettingsCard";
import { AppSettingsIconFacility } from "@/components/app-shell/icons/AppSettingsIcons";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { useAuth } from "@/components/auth-provider";
import { getCurrentHotelName, updateCurrentHotelName } from "@/lib/storage";
import { hasSupabaseEnv } from "@/lib/supabase-config";
import { dispatchHotelNameUpdated } from "@/lib/use-hotel-name";

export function HotelNameSection() {
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
    setLoading(true);
    try {
      const name = await getCurrentHotelName();
      setValue(name ?? "");
    } catch {
      setValue("");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setMessage("");
    const trimmed = value.trim();
    try {
      await updateCurrentHotelName(trimmed);
      setMessageTone("success");
      setMessage("施設名を保存しました。");
      dispatchHotelNameUpdated(trimmed);
    } catch (err) {
      setMessageTone("error");
      setMessage(err instanceof Error ? err.message : "施設名の保存に失敗しました。");
    } finally {
      setSaving(false);
    }
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
            <span className="app-settings-row-icon">
              <AppSettingsIconFacility size={26} />
            </span>
            <label htmlFor="hotel-name" className="app-settings-profile-label">
              施設名
            </label>
            <input
              id="hotel-name"
              name="hotel-name"
              type="text"
              value={value}
              onChange={(ev) => setValue(ev.target.value)}
              maxLength={80}
              autoComplete="organization"
              className="app-settings-profile-input"
              placeholder="例: Infomii Hotel"
            />
            <button
              type="submit"
              disabled={saving || !hasSupabaseEnv || !value.trim()}
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
      <h2 className="text-base font-semibold text-slate-900">施設名</h2>
      <p className="mt-1 text-sm text-slate-500">
        サイドバーやダッシュボードに表示され、チーム運用の単位になります。
      </p>
      {loading ? (
        <div className="app-settings-loading mt-3 app-shell-skeleton h-12 rounded-xl" aria-label="読み込み中" />
      ) : (
        <form onSubmit={(ev) => void handleSubmit(ev)} className="mt-4 space-y-3">
          <div>
            <input
              id="hotel-name"
              name="hotel-name"
              type="text"
              value={value}
              onChange={(ev) => setValue(ev.target.value)}
              maxLength={80}
              autoComplete="organization"
              aria-label="施設名"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400"
              placeholder="例: Infomii Hotel"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !hasSupabaseEnv || !value.trim()}
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
