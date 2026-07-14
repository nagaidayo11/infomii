"use client";

import { useState } from "react";
import Link from "next/link";
import { nanoid } from "nanoid";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { withAppClientQuery } from "@/lib/app-href";
import { useEditor2Store } from "./store";
import { createEmptyCard, STARTER_CARD_TYPES } from "./types";
import { savePageCards } from "@/lib/storage";

type NewPageOnboardingProps = {
  pageId: string;
  pageTitle: string;
};

/**
 * Empty-canvas helper: add starter blocks or open templates.
 */
export function NewPageOnboarding({ pageId, pageTitle }: NewPageOnboardingProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAppShell } = useClientShell();
  const setCards = useEditor2Store((s) => s.setCards);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const setAutosaveStatus = useEditor2Store((s) => s.setAutosaveStatus);

  function toShellHref(path: string) {
    return isAppShell ? withAppClientQuery(path) : path;
  }

  async function handleUseStarterCards() {
    setLoading(true);
    setError(null);
    try {
      const cards = STARTER_CARD_TYPES.map((type, i) =>
        createEmptyCard(type, nanoid(10), i),
      );
      const { updatedIds } = await savePageCards(pageId, cards);
      const merged = cards.map((c) => ({
        ...c,
        id: updatedIds[c.id] ?? c.id,
      }));
      setCards(merged);
      selectCard(merged[0]?.id ?? null);
      setAutosaveStatus({ isSaving: false, lastSavedAt: Date.now() });
    } catch (e) {
      setError(e instanceof Error ? e.message : "カードの追加に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center overflow-y-auto bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">空のページです</h2>
        <p className="mt-1 truncate text-sm text-slate-500">{pageTitle || "無題のページ"}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          左のライブラリからブロックを追加するか、下のショートカットを使って始めてください。
        </p>

        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={() => void handleUseStarterCards()}
            disabled={loading}
            className="flex w-full min-h-[48px] items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "追加中…" : "基本ブロックを入れる"}
          </button>
          <Link
            href={toShellHref("/templates")}
            className="flex w-full min-h-[44px] items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            テンプレート一覧を見る
          </Link>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
