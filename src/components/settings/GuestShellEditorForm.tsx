"use client";

import { useEffect, useState } from "react";
import {
  createDefaultGuestShellConfig,
  getGuestShellLabelJa,
  getGuestShellNavStyle,
  guestShellLabelNeedsTranslation,
  GUEST_SHELL_MIGRATION_SQL,
  withGuestShellNavStyle,
  writeGuestShellLabelJa,
  type GuestShellConfig,
  type GuestShellNavStyle,
  type GuestShellTab,
  type GuestShellTabType,
} from "@/lib/guest-shell";
import { resolveGuestNavLinkLimit, type PlanLimitTier } from "@/lib/plan-limits";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";
import { PAGE_GUEST_SHELL_MIGRATION_SQL } from "@/lib/page-guest-shell";
import { listPagesForHotel, type PageRow } from "@/lib/storage";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

const TYPE_LABEL: Record<Exclude<GuestShellTabType, "locale">, string> = {
  home: "ホーム",
  phone: "電話",
  page: "ページ",
};

const NAV_STYLE_OPTIONS: Array<{ value: GuestShellNavStyle; label: string; hint: string }> = [
  { value: "off", label: "なし", hint: "ナビを表示しません" },
  { value: "tabs", label: "下タブ", hint: "画面下に常時表示" },
  { value: "hamburger", label: "ハンバーガー", hint: "右上から必要な分だけ下に開く" },
];

function ensureDefaultTabs(config: GuestShellConfig): GuestShellConfig {
  const navStyle = getGuestShellNavStyle(config);
  const tabs = config.tabs.filter((tab) => tab.type !== "locale");
  const normalized: GuestShellConfig = {
    ...config,
    navStyle,
    enabled: navStyle !== "off",
    tabs: tabs.length > 0 ? tabs : createDefaultGuestShellConfig().tabs,
  };
  if (normalized.tabs.length > 0) return normalized;
  return createDefaultGuestShellConfig();
}

async function translateJaToEnZhKo(
  text: string,
): Promise<{ en: string; zh: string; ko: string } | null> {
  const supabase = getBrowserSupabaseClient();
  const token = (await supabase?.auth.getSession())?.data.session?.access_token;
  const res = await fetch("/api/ai/translate-content", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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
  /** Current plan for Free guest-nav link caps (defaults from isBusinessPlan). */
  planTier?: PlanLimitTier;
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
  planTier,
  showTranslationHint = false,
}: GuestShellEditorFormProps) {
  const [pages, setPages] = useState<PageRow[]>([]);
  const resolvedPlan: PlanLimitTier =
    planTier ?? (isBusinessPlan ? "business" : "free");
  const maxEnabledTabs = resolveGuestNavLinkLimit(resolvedPlan);
  const editableTabs = config.tabs.filter((tab) => tab.type !== "locale");
  const enabledCount = editableTabs.filter((t) => t.enabled).length;

  useEffect(() => {
    listPagesForHotel().then(setPages).catch(() => setPages([]));
  }, []);

  function updateTab(tabId: string, patch: Partial<GuestShellTab>) {
    if (patch.enabled === true) {
      const current = config.tabs.find((t) => t.id === tabId);
      if (current?.type === "locale" || patch.type === "locale") {
        return;
      }
      if (!current?.enabled && enabledCount >= maxEnabledTabs) {
        return;
      }
    }
    onChange({
      ...config,
      tabs: config.tabs
        .filter((tab) => tab.type !== "locale")
        .map((tab) => (tab.id === tabId ? { ...tab, ...patch } : tab)),
    });
  }

  function handleLabelChange(tab: GuestShellTab, value: string) {
    updateTab(tab.id, { label: writeGuestShellLabelJa(tab.label, value) });
  }

  const migrationSql =
    migrationScope === "page" ? PAGE_GUEST_SHELL_MIGRATION_SQL : GUEST_SHELL_MIGRATION_SQL;
  const migrationTable = migrationScope === "page" ? "pages" : "hotels";
  const navStyle = getGuestShellNavStyle(config);
  const navActive = navStyle !== "off";

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

      <fieldset className="app-guest-shell-nav-style space-y-2">
        <legend className="text-sm font-medium text-slate-800">表示形式（いずれか1つ）</legend>
        <p className="text-xs text-slate-500">
          下タブとハンバーガーは同時に使えません。リンク設定は共通です。
        </p>
        <div className="flex flex-col gap-2">
          {NAV_STYLE_OPTIONS.map((option) => {
            const selected = navStyle === option.value;
            return (
              <label
                key={option.value}
                className={
                  "flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 transition " +
                  (selected
                    ? "border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600"
                    : "border-slate-200 bg-white hover:bg-slate-50")
                }
              >
                <input
                  type="radio"
                  name="guest-shell-nav-style"
                  value={option.value}
                  checked={selected}
                  onChange={() => onChange(withGuestShellNavStyle(config, option.value))}
                  className="mt-0.5 accent-emerald-700"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-slate-900">{option.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{option.hint}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {isBusinessPlan && showTranslationHint ? (
        <p className="text-xs text-slate-500">
          Businessプランでは、保存時にラベルを EN / 中文 / 한국어 へまとめて翻訳します（入力中は翻訳しません）。
        </p>
      ) : null}

      {!isBusinessPlan && navActive ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
          {resolvedPlan === "pro"
            ? `ゲストナビは最大${maxEnabledTabs}件まで表示できます。言語切替はBusinessプランの機能です（ヘッダーの Language）。`
            : `Freeではゲストナビの表示リンクは最大${maxEnabledTabs}件です。言語切替・多言語はBusinessプランで利用できます（ヘッダーの Language）。`}
        </p>
      ) : null}

      {isBusinessPlan ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
          言語切替はゲストページ右上の「Language」からシートで行います。ナビ（下タブ / ハンバーガー）には言語項目を置きません。
        </p>
      ) : null}

      <div className={"space-y-2 " + (navActive ? "" : "pointer-events-none opacity-50")}>
        <p className="text-xs font-medium text-slate-600">
          リンク（共通）
          {navActive ? (
            <span className="ml-2 font-normal text-slate-400">
              表示中 {enabledCount}/{maxEnabledTabs}
            </span>
          ) : null}
        </p>
        {editableTabs.map((tab) => {
          const enabledHint = tab.enabled ? "表示中" : "非表示";
          const typeLabel = TYPE_LABEL[tab.type as Exclude<GuestShellTabType, "locale">] ?? tab.type;
          return (
            <details
              key={tab.id}
              className="app-guest-shell-tab group rounded-lg border border-slate-200 bg-white [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="app-guest-shell-tab-summary flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-left outline-none ring-offset-2 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-500/30">
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {typeLabel}
                  </span>
                  <span className="mt-0.5 block truncate text-sm font-medium text-slate-800">
                    {getGuestShellLabelJa(tab.label) || typeLabel}
                    <span className="ml-2 text-xs font-normal text-slate-400">{enabledHint}</span>
                  </span>
                </span>
                <span
                  className="shrink-0 text-[10px] text-slate-400 transition-transform group-open:rotate-180"
                  aria-hidden
                >
                  ▼
                </span>
              </summary>

              <div className="space-y-2 border-t border-slate-100 px-3 pb-3 pt-2">
                <div className="app-guest-shell-tab-header flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <label className="block text-xs text-slate-500">
                      ラベル
                      <input
                        type="text"
                        value={getGuestShellLabelJa(tab.label)}
                        onChange={(e) => handleLabelChange(tab, e.target.value)}
                        className="app-guest-shell-label-input mt-1 w-full min-w-[8rem] rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900"
                        maxLength={20}
                        aria-label={`${typeLabel}のラベル`}
                      />
                    </label>
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
                      disabled={!tab.enabled && enabledCount >= maxEnabledTabs}
                      onChange={(e) => updateTab(tab.id, { enabled: e.target.checked })}
                      className="app-guest-shell-checkbox"
                    />
                    <span>表示</span>
                  </label>
                </div>

                {tab.type === "home" || tab.type === "page" ? (
                  <label className="app-guest-shell-field block text-xs text-slate-500">
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
                  <label className="app-guest-shell-field block text-xs text-slate-500">
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
              </div>
            </details>
          );
        })}
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
