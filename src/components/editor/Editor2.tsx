"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LocaleProvider } from "@/components/locale-context";
import { EditorLayout } from "./EditorLayout";
import { EditorTopBar } from "./EditorTopBar";
import { CardLibrary } from "./CardLibrary";
import { FreeformCanvas } from "./FreeformCanvas";
import { CardSettings } from "./SettingsPanel";
import { PublishModal } from "./PublishModal";
import { SaveToast } from "./SaveToast";
import { SlashCommandMenu } from "./SlashCommandMenu";
import { useEditor2Store } from "./store";
import { useAutoSaveCards } from "./useAutoSaveCards";
import type { CardType } from "./types";
import { getPage, buildPublicUrlV, savePageCards } from "@/lib/storage";

/**
 * Canvas-based card editor — Notion-like experience.
 * State is centralized in useEditor2Store (cards, selectedCardId, isSaving, pageMeta).
 * Canvas, library and settings all use the same store.
 */
type Editor2Props = { pageId?: string | null };

function buildChecklistItemsForPreset(types: CardType[]): Array<{ text: string; checked: boolean }> {
  const base: Array<{ text: string; checked: boolean }> = [
    { text: "施設名・連絡先を最新化", checked: false },
    { text: "プレースホルダ文言を削除", checked: false },
    { text: "公開前チェックを実行", checked: false },
  ];
  const byType: Partial<Record<CardType, Array<{ text: string; checked: boolean }>>> = {
    wifi: [
      { text: "Wi-Fi SSID / パスワードを入力", checked: false },
      { text: "接続不可時の案内を入力", checked: false },
    ],
    breakfast: [
      { text: "朝食時間・会場を入力", checked: false },
    ],
    checkout: [
      { text: "チェックアウト時刻を入力", checked: false },
    ],
    parking: [
      { text: "駐車場の料金・台数を入力", checked: false },
    ],
    taxi: [
      { text: "タクシー連絡先を入力", checked: false },
    ],
    emergency: [
      { text: "緊急連絡先を入力", checked: false },
    ],
    map: [
      { text: "地図・住所を入力", checked: false },
    ],
    pageLinks: [
      { text: "ページリンク先を設定", checked: false },
    ],
    menu: [
      { text: "メニュー名・価格を入力", checked: false },
    ],
    gallery: [
      { text: "画像を差し替え", checked: false },
    ],
    faq: [
      { text: "FAQの質問・回答を入力", checked: false },
    ],
  };
  const merged = [...base];
  types.forEach((t) => {
    (byType[t] ?? []).forEach((item) => {
      if (!merged.some((m) => m.text === item.text)) merged.push(item);
    });
  });
  return merged.slice(0, 10);
}

export function Editor2({ pageId }: Editor2Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [publishState, setPublishState] = useState<{
    publicUrl: string;
    pageTitle: string;
    slug: string;
  } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [prepublishState, setPrepublishState] = useState<{
    errors: string[];
    warnings: string[];
    allowContinue: boolean;
  } | null>(null);

  const cards = useEditor2Store((s) => s.cards);
  const selectedCardId = useEditor2Store((s) => s.selectedCardId);
  const lastAddedCardId = useEditor2Store((s) => s.lastAddedCardId);
  const pageBackgroundMode = useEditor2Store((s) => s.pageBackgroundMode);
  const pageBackgroundColor = useEditor2Store((s) => s.pageBackgroundColor);
  const pageGradientFrom = useEditor2Store((s) => s.pageGradientFrom);
  const pageGradientTo = useEditor2Store((s) => s.pageGradientTo);
  const pageGradientAngle = useEditor2Store((s) => s.pageGradientAngle);
  const isSaving = useEditor2Store((s) => s.isSaving);
  const lastSavedAt = useEditor2Store((s) => s.lastSavedAt);
  const saveError = useEditor2Store((s) => s.saveError);
  const pageMeta = useEditor2Store((s) => s.pageMeta);
  const addCard = useEditor2Store((s) => s.addCard);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const reorderCards = useEditor2Store((s) => s.reorderCards);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const removeCard = useEditor2Store((s) => s.removeCard);
  const duplicateCard = useEditor2Store((s) => s.duplicateCard);
  const undo = useEditor2Store((s) => s.undo);
  const redo = useEditor2Store((s) => s.redo);
  const clearCards = useEditor2Store((s) => s.clearCards);
  const replaceTextAll = useEditor2Store((s) => s.replaceTextAll);
  const canUndo = useEditor2Store((s) => s.historyPast.length > 0);
  const canRedo = useEditor2Store((s) => s.historyFuture.length > 0);
  const setPageMeta = useEditor2Store((s) => s.setPageMeta);

  const runPrepublishChecks = useCallback(() => {
    const errors: string[] = [];
    const warnings: string[] = [];
    if (cards.length === 0) {
      errors.push("ブロックが1つもありません。最低1ブロック追加してください。");
    }
    const hasWifi = cards.some((c) => c.type === "wifi");
    const hasCheckout = cards.some((c) => c.type === "checkout");
    if (!hasWifi) warnings.push("Wi-Fi案内ブロックがありません。");
    if (!hasCheckout) warnings.push("チェックアウト案内ブロックがありません。");
    const placeholderPattern = /\[[^\]]+\]|ここに|入力してください|記載してください/;
    const emptyOrAnchorHrefPattern = /^#?$|^\s*$/;
    cards.forEach((card) => {
      const raw = JSON.stringify(card.content ?? {});
      if (placeholderPattern.test(raw)) {
        warnings.push(`「${card.type}」にプレースホルダ文言が残っています。`);
      }
      if (card.type === "button") {
        const href = String((card.content as Record<string, unknown>).href ?? "");
        if (emptyOrAnchorHrefPattern.test(href)) {
          warnings.push("ボタンリンク未設定のブロックがあります。");
        }
      }
    });
    return { errors, warnings };
  }, [cards]);

  useEffect(() => {
    if (!pageId) {
      setPageMeta({ pageId: null, title: "", slug: "", publicUrl: null });
      return;
    }
    getPage(pageId).then((page) => {
      if (page) {
        setPageMeta({
          pageId,
          title: page.title ?? "",
          slug: page.slug,
          publicUrl: buildPublicUrlV(page.slug),
        });
      }
    });
  }, [pageId, setPageMeta]);

  useEffect(() => {
    if (!pageId || typeof window === "undefined") return;
    const key = `editor-page-background:${pageId}`;
    window.localStorage.setItem(
      key,
      JSON.stringify({
        mode: pageBackgroundMode,
        color: pageBackgroundColor,
        from: pageGradientFrom,
        to: pageGradientTo,
        angle: pageGradientAngle,
      })
    );
  }, [pageId, pageBackgroundMode, pageBackgroundColor, pageGradientFrom, pageGradientTo, pageGradientAngle]);

  const { retry } = useAutoSaveCards(pageId ?? null);

  const selectedCard = useMemo(
    () => cards.find((c) => c.id === selectedCardId) ?? null,
    [cards, selectedCardId]
  );

  const handleSlashKey = useCallback((e: KeyboardEvent) => {
    if (e.key !== "/") return;
    const root = rootRef.current;
    const target = e.target as Node | null;
    if (!root || !target || !root.contains(target)) return;
    const el = target as HTMLElement;
    if (
      el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA" ||
      el.isContentEditable
    ) {
      return;
    }
    e.preventDefault();
    setSlashMenuOpen(true);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleSlashKey);
    return () => document.removeEventListener("keydown", handleSlashKey);
  }, [handleSlashKey]);

  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (slashMenuOpen) return;
      const root = rootRef.current;
      const target = e.target as HTMLElement | null;
      if (!root || !target || !root.contains(target)) return;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (isInput) {
        const isEmpty =
          (target as HTMLInputElement | HTMLTextAreaElement).value?.trim() === "" ||
          target.textContent?.trim() === "";
        if (isEmpty) {
          if (e.key === "Backspace" || e.key === "Delete") {
            const cardEl = target.closest("[data-card-id]");
            const cardId = cardEl?.getAttribute("data-card-id");
            if (cardId && selectedCardId === cardId) {
              e.preventDefault();
              removeCard(cardId);
              (target as HTMLElement).blur();
            }
            return;
          }
          if (e.key === "Enter" && !e.shiftKey) {
            const cardEl = target.closest("[data-card-id]");
            const cardId = cardEl?.getAttribute("data-card-id");
            if (cardId) {
              e.preventDefault();
              const idx = cards.findIndex((c) => c.id === cardId);
              if (idx >= 0) {
                addCard("text", idx + 1);
                (target as HTMLElement).blur();
              }
            }
            return;
          }
        }
        if (e.key === "Backspace" || e.key === "Delete") return;
      }
      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && e.key === "d") {
        e.preventDefault();
        if (selectedCardId) duplicateCard(selectedCardId);
        return;
      }
      if ((e.key === "Backspace" || e.key === "Delete") && selectedCardId) {
        const el = target as HTMLElement;
        if (el.tagName !== "INPUT" && el.tagName !== "TEXTAREA" && !el.isContentEditable) {
          e.preventDefault();
          removeCard(selectedCardId);
        }
      }
    },
    [undo, redo, duplicateCard, removeCard, addCard, selectedCardId, slashMenuOpen, cards]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  const handleSlashSelect = useCallback(
    (type: CardType) => {
      addCard(type);
      setSlashMenuOpen(false);
    },
    [addCard]
  );

  const publishNow = useCallback(async () => {
    if (!pageId) return;
    setPublishing(true);
    try {
      const state = useEditor2Store.getState();
      await savePageCards(pageId, state.cards, {
        pageStyle: {
          background: {
            mode: state.pageBackgroundMode,
            color: state.pageBackgroundColor,
            from: state.pageGradientFrom,
            to: state.pageGradientTo,
            angle: state.pageGradientAngle,
          },
        },
      });
      const page = await getPage(pageId);
      if (!page?.slug) {
        setPublishing(false);
        return;
      }
      const publicUrl = buildPublicUrlV(page.slug);
      setPublishState({
        publicUrl,
        pageTitle: page.title ?? "",
        slug: page.slug,
      });
    } finally {
      setPublishing(false);
    }
  }, [pageId]);

  const handlePublishClick = useCallback(async () => {
    const report = runPrepublishChecks();
    if (report.errors.length > 0 || report.warnings.length > 0) {
      setPrepublishState({
        errors: report.errors,
        warnings: report.warnings,
        allowContinue: report.errors.length === 0,
      });
      return;
    }
    await publishNow();
  }, [publishNow, runPrepublishChecks]);

  const handlePreviewClick = useCallback(async () => {
    if (!pageMeta.publicUrl || !pageId) return;
    try {
      const state = useEditor2Store.getState();
      await savePageCards(pageId, state.cards, {
        pageStyle: {
          background: {
            mode: state.pageBackgroundMode,
            color: state.pageBackgroundColor,
            from: state.pageGradientFrom,
            to: state.pageGradientTo,
            angle: state.pageGradientAngle,
          },
        },
      });
    } catch {
      // Even if save fails, allow user to inspect current public page.
    }
    window.open(pageMeta.publicUrl, "_blank", "noopener,noreferrer");
  }, [pageMeta.publicUrl, pageId]);

  const handleAddPreset = useCallback(
    (types: CardType[]) => {
      for (const type of types) {
        addCard(type);
      }
      addCard("checklist");
      const checklistId = useEditor2Store.getState().selectedCardId;
      if (checklistId) {
        updateCard(checklistId, {
          content: {
            title: "即運用チェックリスト",
            items: buildChecklistItemsForPreset(types),
          },
          style: {
            deleteProtected: true,
          },
        });
      }
    },
    [addCard, updateCard]
  );

  const handleClearAll = useCallback(() => {
    if (cards.length === 0) return;
    const ok = window.confirm("このページのブロックをすべて削除します。よろしいですか？");
    if (!ok) return;
    clearCards();
  }, [cards.length, clearCards]);

  const handleRunPrepublishCheck = useCallback(() => {
    const report = runPrepublishChecks();
    setPrepublishState({
      errors: report.errors,
      warnings: report.warnings,
      allowContinue: false,
    });
  }, [runPrepublishChecks]);

  const topBar =
    pageId ? (
      <EditorTopBar
        pageTitle={pageMeta.title}
        saving={isSaving}
        lastSavedAt={lastSavedAt}
        saveError={saveError}
        onRetry={retry}
        status="draft"
        publicUrl={pageMeta.publicUrl}
        publishing={publishing}
        canUndo={canUndo}
        canRedo={canRedo}
        canClearAll={cards.length > 0}
        onUndo={undo}
        onRedo={redo}
        onClearAll={handleClearAll}
        onEditPageBackground={() => selectCard(null)}
        onPreview={handlePreviewClick}
        onPublish={handlePublishClick}
        onQr={handlePublishClick}
      />
    ) : null;

  return (
    <LocaleProvider value="ja">
      <div ref={rootRef} className="h-screen w-full overflow-hidden">
        <EditorLayout
          topBar={topBar}
          library={<CardLibrary onAddCard={addCard} onAddPreset={handleAddPreset} />}
          canvas={
            <div ref={canvasRef} className="flex h-full flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-auto">
                <FreeformCanvas
                  cards={cards}
                  selectedCardId={selectedCardId}
                  onSelectCard={selectCard}
                  onUpdateCard={updateCard}
                  onReorderCards={reorderCards}
                  onDuplicateCard={duplicateCard}
                  onRemoveCard={removeCard}
                  pageBackground={{
                    mode: pageBackgroundMode,
                    color: pageBackgroundColor,
                    from: pageGradientFrom,
                    to: pageGradientTo,
                    angle: pageGradientAngle,
                  }}
                />
              </div>
            </div>
          }
          settings={
            <CardSettings
              card={selectedCard}
              onUpdate={updateCard}
              onBulkReplace={replaceTextAll}
              onRunPrepublishCheck={handleRunPrepublishCheck}
              lastAddedCardId={lastAddedCardId}
            />
          }
        />
        <SlashCommandMenu
          open={slashMenuOpen}
          onClose={() => setSlashMenuOpen(false)}
          onSelect={handleSlashSelect}
          anchorRef={canvasRef}
        />
        {publishState && (
          <PublishModal
            publicUrl={publishState.publicUrl}
            pageTitle={publishState.pageTitle}
            slug={publishState.slug}
            onClose={() => setPublishState(null)}
          />
        )}
        {prepublishState && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
              <h3 className="text-lg font-semibold text-slate-900">公開前チェック</h3>
              {prepublishState.errors.length === 0 && prepublishState.warnings.length === 0 ? (
                <p className="mt-3 text-sm text-emerald-700">問題は見つかりませんでした。</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {prepublishState.errors.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-rose-700">修正が必要</p>
                      <ul className="mt-1 space-y-1 text-sm text-rose-700">
                        {prepublishState.errors.map((item) => (
                          <li key={item}>・{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {prepublishState.warnings.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-amber-700">確認推奨</p>
                      <ul className="mt-1 max-h-44 space-y-1 overflow-auto text-sm text-amber-700">
                        {prepublishState.warnings.map((item, idx) => (
                          <li key={`${item}-${idx}`}>・{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPrepublishState(null)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  閉じる
                </button>
                {prepublishState.allowContinue && (
                  <button
                    type="button"
                    onClick={async () => {
                      setPrepublishState(null);
                      await publishNow();
                    }}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    このまま公開
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        <SaveToast lastSavedAt={lastSavedAt} />
      </div>
    </LocaleProvider>
  );
}
