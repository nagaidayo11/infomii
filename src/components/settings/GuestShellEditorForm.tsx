"use client";

import { useEffect, useState } from "react";
import {
  createDefaultGuestShellConfig,
  getGuestShellLabelJa,
  guestShellLabelNeedsTranslation,
  GUEST_SHELL_MIGRATION_SQL,
  writeGuestShellLabelJa,
  type GuestShellConfig,
  type GuestShellTab,
  type GuestShellTabType,
} from "@/lib/guest-shell";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";
import { PAGE_GUEST_SHELL_MIGRATION_SQL } from "@/lib/page-guest-shell";
import { listPagesForHotel, type PageRow } from "@/lib/storage";

const TYPE_LABEL: Record<GuestShellTabType, string> = {
  home: "ホーム",
  phone: "電話",
  page: "ページ",
  locale: "言語",
};

function ensureDefaultTabs(config: GuestShellConfig): GuestShellConfig {
  if (config.tabs.length > 0) return config;
  return createDefaultGuestShellConfig();
}

async function translateJaToEnZhKo(
  text: string,
): Promise<{ en: string; zh: string; ko: string } | null> {
  const res = await fetch("/api/ai/translate-content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { en?: string; zh?: string; ko?: string };
  if (typeof data.en !== "string" || typeof data.zh !== "string" || typeof data.ko !== "string") {
    return null;
  }
  return { en: data.en, zh: data.zh, ko: data.ko };
}

/** Fill missing en/zh/ko for Business before persist (one pass on save). */
export async function ensureGuestShellLabelsTranslated(
  config: GuestShellConfig,
): Promise<GuestShellConfig> {
  const tabs = await Promise.all(
    config.tabs.map(async (tab) => {
      if (!guestShellLabelNeedsTranslation(tab.label)) return tab;
      const ja = getGuestShellLabelJa(tab.label).trim();
      if (!ja) return tab;
      const result = await translateJaToEnZhKo(ja);
      if (!result) return tab;
      const prev =
        typeof tab.label === "object" && tab.label ? tab.label : ({ ja } as LocalizedString);
      return {
        ...tab,
        label: {
          ...(typeof prev === "object" ? prev : { ja }),
          ja,
          en: result.en.slice(0, 20),
          zh: result.zh.slice(0, 20),
          ko: result.ko.slice(0, 20),
        },
      };
    }),
  );
  return { ...config, tabs };
}

export type GuestShellEditorFormProps = {
  config: GuestShellConfig;
  onChange: (config: GuestShellConfig) => void;
  onSave: () => void | Promise<void>;
  saving?: boolean;
  columnReady?: boolean;
  saveLabel?: string;
  /** When set, shows migration hint for missing DB column */
  migrationScope?: "hotel" | "page";
  /** Optional inheritance banner above the form */
  inheritBanner?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  /** Business: translate labels on save (not while typing) */
  isBusinessPlan?: boolean;
  /** Show Business translation note in editor context only. */
  showTranslationHint?: boolean;
};

export function GuestShellEditorForm({
  config,
  onChange,
  onSave,
  saving = false,
  columnReady = true,
  saveLabel = "保存する",
  migrationScope,
  inheritBanner,
  secondaryActions,
  isBusinessPlan = false,
  showTranslationHint = false,
}: GuestShellEditorFormProps) {
  const [pages, setPages] = useState<PageRow[]>([]);

  useEffect(() => {
    listPagesForHotel().then(setPages).catch(() => setPages([]));
  }, []);

  function updateTab(tabId: string, patch: Partial<GuestShellTab>) {
    onChange({
      ...config,
      tabs: config.tabs.map((tab) => (tab.id === tabId ? { ...tab, ...patch } : tab)),
    });
  }

  function handleLabelChange(tab: GuestShellTab, value: string) {
    updateTab(tab.id, { label: writeGuestShellLabelJa(tab.label, value) });
  }

  const migrationSql =
    migrationScope === "page" ? PAGE_GUEST_SHELL_MIGRATION_SQL : GUEST_SHELL_MIGRATION_SQL;
  const migrationTable = migrationScope === "page" ? "pages" : "hotels";

  return (
    <div className="app-guest-shell-form space-y-4">
      {inheritBanner}

      {!columnReady && migrationScope ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950">
          <p className="font-medium">データベースの準備が必要です</p>
          <p className="mt-1 leading-relaxed">
            Supabase の <code className="rounded bg-amber-100 px-1">{migrationTable}</code> テーブルに{" "}
            <code className="rounded bg-amber-100 px-1">guest_shell</code> 列がまだありません。
            SQL Editor で次を1回実行してから、保存をお試しください。
          </p>
          <pre className="mt-2 overflow-x-auto rounded-md border border-amber-200 bg-white p-2 text-xs text-slate-800">
            {migrationSql}
          </pre>
        </section>
      ) : null}

      <label className="app-guest-shell-toggle flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5">
        <span className="text-sm font-medium text-slate-800">下タブナビを表示する</span>
        <input
          type="checkbox"
          checked={config.enabled}
          onChange={(e) => onChange({ ...config, enabled: e.target.checked })}
          className="app-guest-shell-switch-input"
        />
        <span className="app-guest-shell-switch" aria-hidden />
      </label>

      {isBusinessPlan && showTranslationHint ? (
        <p className="text-xs text-slate-500">
          Businessプランでは、保存時にラベルを EN / 中文 / 한국어 へまとめて翻訳します（入力中は翻訳しません）。
        </p>
      ) : null}

      <div className={"space-y-3 " + (config.enabled ? "" : "pointer-events-none opacity-50")}>
        {config.tabs.map((tab) => (
          <div key={tab.id} className="app-guest-shell-tab rounded-lg border border-slate-200 bg-white p-3">
            <div className="app-guest-shell-tab-header flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {TYPE_LABEL[tab.type]}
                </p>
                <input
                  type="text"
                  value={getGuestShellLabelJa(tab.label)}
                  onChange={(e) => handleLabelChange(tab, e.target.value)}
                  className="app-guest-shell-label-input mt-1 w-full min-w-[8rem] rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900"
                  maxLength={20}
                  aria-label={`${TYPE_LABEL[tab.type]}のラベル`}
                />
                {isBusinessPlan && typeof tab.label === "object" && tab.label ? (
                  <p className="mt-1 truncate text-[10px] text-slate-400">
                    EN {getLocalizedContent(tab.label, "en") || "—"}
                    {" · "}
                    中文 {getLocalizedContent(tab.label, "zh") || "—"}
                    {" · "}
                    KO {getLocalizedContent(tab.label, "ko") || "—"}
                  </p>
                ) : null}
              </div>
              <label className="app-guest-shell-display-toggle inline-flex items-center gap-2 text-xs font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={tab.enabled}
                  onChange={(e) => updateTab(tab.id, { enabled: e.target.checked })}
                  className="app-guest-shell-checkbox"
                />
                <span>表示</span>
              </label>
            </div>

            {tab.type === "home" || tab.type === "page" ? (
              <label className="app-guest-shell-field mt-2 block text-xs text-slate-500">
                遷移先ページ
                <select
                  value={tab.pageSlug ?? ""}
                  onChange={(e) =>
                    updateTab(tab.id, { pageSlug: e.target.value.trim() || null })
                  }
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-800"
                >
                  <option value="">未設定</option>
                  {pages.map((page) => (
                    <option key={page.id} value={page.slug}>
                      {page.title || "(無題)"}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {tab.type === "phone" ? (
              <label className="app-guest-shell-field mt-2 block text-xs text-slate-500">
                フロント電話番号
                <input
                  type="tel"
                  value={tab.phone ?? ""}
                  onChange={(e) => updateTab(tab.id, { phone: e.target.value || null })}
                  placeholder="例: 03-1234-5678"
                  className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-2 text-sm text-slate-800"
                />
              </label>
            ) : null}

            {tab.type === "locale" ? (
              <p className="mt-2 text-xs text-slate-500">
                オンにするとフッターの「言語」から切替できます。このときヘッダーの言語トグルは非表示になります。
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="app-guest-shell-actions flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={saving || !columnReady}
          className="inline-flex min-h-[40px] items-center justify-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {saving ? "保存中…" : saveLabel}
        </button>
        {secondaryActions}
      </div>
    </div>
  );
}

export { ensureDefaultTabs };
