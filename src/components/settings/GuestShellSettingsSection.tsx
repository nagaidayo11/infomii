"use client";

import { useCallback, useEffect, useState } from "react";
import { AppSettingsCard } from "@/components/app-shell/AppSettingsCard";
import { useClientShell } from "@/components/app-shell/useClientShell";
import {
  createDefaultGuestShellConfig,
  type GuestShellConfig,
} from "@/lib/guest-shell";
import {
  getCurrentHotelGuestShell,
  getCurrentHotelSubscription,
  isGuestShellColumnAvailable,
  updateCurrentHotelGuestShell,
} from "@/lib/storage";
import {
  ensureDefaultTabs,
  ensureGuestShellLabelsTranslated,
  GuestShellEditorForm,
} from "./GuestShellEditorForm";

export function GuestShellSettingsSection() {
  const { isAppShell } = useClientShell();
  const [config, setConfig] = useState<GuestShellConfig>(() => createDefaultGuestShellConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");
  const [columnReady, setColumnReady] = useState(true);
  const [open, setOpen] = useState(false);
  const [isBusinessPlan, setIsBusinessPlan] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const [shell, ready, sub] = await Promise.all([
        getCurrentHotelGuestShell().catch(() => createDefaultGuestShellConfig()),
        isGuestShellColumnAvailable().catch(() => true),
        getCurrentHotelSubscription().catch(() => null),
      ]);
      setConfig(ensureDefaultTabs(shell));
      setColumnReady(ready);
      setIsBusinessPlan(sub?.plan === "business");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const toSave = isBusinessPlan
        ? await ensureGuestShellLabelsTranslated(config)
        : config;
      if (toSave !== config) setConfig(ensureDefaultTabs(toSave));
      const next = await updateCurrentHotelGuestShell(toSave);
      setConfig(ensureDefaultTabs(next));
      setMessageTone("success");
      setMessage("施設共通の下タブナビを保存しました。");
    } catch (e) {
      setMessageTone("error");
      setMessage(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  const body = (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="group rounded-xl border border-slate-200/90 bg-white [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-1 py-1 text-left outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-emerald-500/30">
        <div>
          <h2 className={isAppShell ? "text-base font-semibold text-slate-900" : "text-sm font-semibold text-slate-900"}>
            ゲスト下タブナビ（施設共通）
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            ルートページに設定がないときのフォールバックです。通常はエディタのルートページで編集します。
          </p>
        </div>
        <span className="shrink-0 text-xs font-medium text-slate-400 group-open:rotate-180 transition-transform">
          ▼
        </span>
      </summary>

      <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
        {loading ? (
          <div className="h-24 animate-pulse rounded-lg bg-slate-100" aria-label="読み込み中" />
        ) : (
          <>
            <GuestShellEditorForm
              config={config}
              onChange={setConfig}
              onSave={handleSave}
              saving={saving}
              columnReady={columnReady}
              migrationScope="hotel"
              isBusinessPlan={isBusinessPlan}
              secondaryActions={
                <button
                  type="button"
                  onClick={() => setConfig(createDefaultGuestShellConfig())}
                  className="inline-flex min-h-[40px] items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  初期値に戻す
                </button>
              }
            />
            {message ? (
              <p
                className={
                  "text-sm " + (messageTone === "success" ? "text-emerald-700" : "text-red-600")
                }
              >
                {message}
              </p>
            ) : null}
          </>
        )}
      </div>
    </details>
  );

  if (isAppShell) {
    return <AppSettingsCard>{body}</AppSettingsCard>;
  }

  return (
    <section className="rounded-lg border border-[#e6e8eb] bg-white p-4 sm:p-5">{body}</section>
  );
}
