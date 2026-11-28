"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clampGuestShellConfigForPlan,
  createDefaultGuestShellConfig,
  type GuestShellConfig,
} from "@/lib/guest-shell";
import { resolveGuestNavLinkLimit, type PlanLimitTier } from "@/lib/plan-limits";
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
  planTier?: PlanLimitTier;
  onConfigChange?: (config: GuestShellConfig) => void;
};

export function GuestShellPagePanel({
  pageId,
  isBusinessPlan = false,
  planTier,
  onConfigChange,
}: GuestShellPagePanelProps) {
  const resolvedPlan: PlanLimitTier =
    planTier ?? (isBusinessPlan ? "business" : "free");
  const [state, setState] = useState<PageGuestShellEditorState | null>(null);
  const [config, setConfig] = useState<GuestShellConfig>(() => createDefaultGuestShellConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");
  /** Avoid pushing the default "nav off" draft onto the canvas before the page shell loads. */
  const hydratedRef = useRef(false);
  const onConfigChangeRef = useRef(onConfigChange);
  onConfigChangeRef.current = onConfigChange;

  const publishConfig = useCallback((next: GuestShellConfig) => {
    onConfigChangeRef.current?.(next);
  }, []);

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
      hydratedRef.current = true;
      setConfig(editing);
      publishConfig(next.effective);
    } finally {
      setLoading(false);
    }
  }, [pageId, publishConfig]);

  useEffect(() => {
    hydratedRef.current = false;
    void load();
  }, [load]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    publishConfig(config);
  }, [config, publishConfig]);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const clamped = clampGuestShellConfigForPlan(config, {
        businessFeaturesEnabled: isBusinessPlan,
        maxEnabledTabs: resolveGuestNavLinkLimit(resolvedPlan),
      });
      const toSave = isBusinessPlan
        ? await ensureGuestShellLabelsTranslated(clamped)
        : clamped;
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
    <p className="text-[11px] leading-snug text-slate-400">
      {state.isRootPage ? (
        "ページ連携のルート。ここでの設定が子ページの初期値になります。"
      ) : state.mode === "inherited" ? (
        <>
          {state.rootPageTitle || "ルートページ"}の設定を継承しています。{" "}
          <button
            type="button"
            onClick={handleStartOverride}
            className="font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900"
          >
            このページだけ別設定
          </button>
        </>
      ) : (
        <>
          ルートとは別設定です。{" "}
          <button
            type="button"
            onClick={() => void handleClearOverride()}
            disabled={saving}
            className="font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900 disabled:opacity-60"
          >
            ルートに戻す
          </button>
        </>
      )}
    </p>
  ) : null;

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="border-b border-slate-200 bg-white px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">ページ設定</h2>
          <div className="mt-3 h-24 animate-pulse rounded-lg bg-slate-100" aria-label="読み込み中" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="border-b border-slate-200 bg-white px-4 pt-3 pb-2">
        <h2 className="text-sm font-semibold text-slate-800">ページ設定</h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <GuestShellEditorForm
          config={config}
          onChange={setConfig}
          onSave={handleSave}
          saving={saving}
          columnReady={state?.columnReady ?? true}
          migrationScope="page"
          inheritBanner={inheritBanner}
          isBusinessPlan={isBusinessPlan}
          planTier={resolvedPlan}
          showTranslationHint
          compact
          secondaryActions={
            <button
              type="button"
              onClick={() => setConfig(createDefaultGuestShellConfig())}
              className="inline-flex min-h-[36px] items-center justify-center rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800"
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
      </div>
    </div>
  );
}
