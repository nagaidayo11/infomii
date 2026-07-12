"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createDefaultGuestShellConfig,
  getGuestShellNavStyle,
  getGuestShellTabLabel,
  resolveVisibleGuestShellTabs,
  type GuestShellConfig,
} from "@/lib/guest-shell";
import type { PageGuestShellEditorState } from "@/lib/page-guest-shell";
import {
  clearPageGuestShellOverride,
  getPageGuestShellEditorState,
  updatePageGuestShell,
} from "@/lib/storage";
import {
  ensureDefaultTabs,
  ensureGuestShellLabelsTranslated,
  GuestShellEditorForm,
} from "./GuestShellEditorForm";

type GuestShellPagePanelProps = {
  pageId: string;
  isBusinessPlan?: boolean;
  onConfigChange?: (config: GuestShellConfig) => void;
};

export function GuestShellPagePanel({
  pageId,
  isBusinessPlan = false,
  onConfigChange,
}: GuestShellPagePanelProps) {
  const [state, setState] = useState<PageGuestShellEditorState | null>(null);
  const [config, setConfig] = useState<GuestShellConfig>(() => createDefaultGuestShellConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const next = await getPageGuestShellEditorState(pageId);
      if (!next) {
        setState(null);
        return;
      }
      setState(next);
      const editing = ensureDefaultTabs(next.editing);
      setConfig(editing);
      onConfigChange?.(next.effective);
    } finally {
      setLoading(false);
    }
  }, [onConfigChange, pageId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    onConfigChange?.(config);
  }, [config, onConfigChange]);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const toSave = isBusinessPlan
        ? await ensureGuestShellLabelsTranslated(config)
        : config;
      if (toSave !== config) setConfig(ensureDefaultTabs(toSave));
      const next = await updatePageGuestShell(pageId, toSave);
      setConfig(ensureDefaultTabs(next));
      await load();
      setMessageTone("success");
      setMessage("このページのゲストナビを保存しました。");
    } catch (e) {
      setMessageTone("error");
      setMessage(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function handleClearOverride() {
    setSaving(true);
    setMessage("");
    try {
      await clearPageGuestShellOverride(pageId);
      await load();
      setMessageTone("success");
      setMessage("ルートページの設定を継承するように戻しました。");
    } catch (e) {
      setMessageTone("error");
      setMessage(e instanceof Error ? e.message : "更新に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  function handleStartOverride() {
    if (!state) return;
    setConfig(ensureDefaultTabs({ ...state.effective }));
    setMessage("");
  }

  const inheritBanner = state ? (
    <div className="rounded-lg border border-emerald-100 bg-emerald-50/80 px-3 py-2.5 text-sm text-emerald-950">
      {state.isRootPage ? (
        <p>
          このページは<strong>ページ連携セットのルート</strong>です。ここで保存した設定が、連携した子ページのデフォルトになります。
        </p>
      ) : state.mode === "inherited" ? (
        <div className="space-y-2">
          <p>
            <strong>{state.rootPageTitle || "ルートページ"}</strong>のゲストナビ設定を継承しています。
          </p>
          <button
            type="button"
            onClick={handleStartOverride}
            className="text-xs font-semibold text-emerald-800 underline underline-offset-2 hover:text-emerald-950"
          >
            このページだけ別設定にする
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p>ルートとは別のゲストナビ設定を使っています。</p>
          <button
            type="button"
            onClick={() => void handleClearOverride()}
            disabled={saving}
            className="text-xs font-semibold text-emerald-800 underline underline-offset-2 hover:text-emerald-950 disabled:opacity-60"
          >
            ルートの設定に戻す
          </button>
        </div>
      )}
    </div>
  ) : null;

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="border-b border-slate-200 bg-white px-4 py-4">
          <h2 className="text-sm font-semibold text-slate-700">ゲストナビ</h2>
          <div className="mt-3 h-24 animate-pulse rounded-lg bg-slate-100" aria-label="読み込み中" />
        </div>
      </div>
    );
  }

  const previewTabs = resolveVisibleGuestShellTabs(config, {
    businessFeaturesEnabled: isBusinessPlan,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="border-b border-slate-200 bg-white px-4 py-4">
        <h2 className="text-sm font-semibold text-slate-700">ゲストナビ</h2>
        <p className="mt-1 text-xs text-slate-500">
          ブロック未選択時に編集できます。プレビューに反映されます。
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <GuestShellEditorForm
          config={config}
          onChange={setConfig}
          onSave={handleSave}
          saving={saving}
          columnReady={state?.columnReady ?? true}
          migrationScope="page"
          inheritBanner={inheritBanner}
          isBusinessPlan={isBusinessPlan}
          showTranslationHint
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
              "mt-3 text-sm " + (messageTone === "success" ? "text-emerald-700" : "text-red-600")
            }
          >
            {message}
          </p>
        ) : null}
        {getGuestShellNavStyle(config) !== "off" && previewTabs.length > 0 ? (
          <p className="mt-3 text-xs text-slate-400">
            表示形式:{" "}
            {getGuestShellNavStyle(config) === "hamburger" ? "ハンバーガー" : "下タブ"}
            {" / "}
            有効リンク: {previewTabs.map((tab) => getGuestShellTabLabel(tab, "ja")).join(" / ")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
