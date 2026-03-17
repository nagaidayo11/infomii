"use client";

import { useState } from "react";
import Link from "next/link";
import { nanoid } from "nanoid";
import { useEditor2Store } from "./store";
import { createEmptyCard } from "./types";
import { STARTER_CARD_TYPES } from "./types";
import { savePageCards } from "@/lib/storage";

type NewPageOnboardingProps = {
  pageId: string;
  pageTitle: string;
};

export function NewPageOnboarding({ pageId, pageTitle }: NewPageOnboardingProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setCards = useEditor2Store((s) => s.setCards);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const setAutosaveStatus = useEditor2Store((s) => s.setAutosaveStatus);

  async function handleUseStarterCards() {
    setLoading(true);
    setError(null);
    try {
      const cards = STARTER_CARD_TYPES.map((type, i) =>
        createEmptyCard(type, nanoid(10), i)
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
    <div className="flex min-h-full flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-8 shadow-xl">
        <h2 className="text-center text-xl font-semibold text-slate-900">
          このページをどう始めますか？
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500">{pageTitle}</p>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={handleUseStarterCards}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 px-5 py-4 text-left text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-white border-t-transparent" />
                追加しています…
              </>
            ) : (
              <>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </span>
                <span>
                  <strong>スターターカードで始める</strong>
                  <span className="mt-0.5 block text-xs font-normal text-slate-300">
                    ウェルカム・WiFi・朝食・チェックアウト・周辺案内の5枚を追加
                  </span>
                </span>
              </>
            )}
          </button>

          <Link
            href="/templates"
            className="flex w-full items-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-5 py-4 text-left text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <svg className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </span>
            <span>
              <strong>テンプレートを使う</strong>
              <span className="mt-0.5 block text-xs font-normal text-slate-500">
                館内案内・WiFi・朝食など型から作成
              </span>
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="flex w-full items-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-5 py-4 text-left text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <svg className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </span>
            <span>
              <strong>AIで作成</strong>
              <span className="mt-0.5 block text-xs font-normal text-slate-500">
                URLやホテル名から自動作成
              </span>
            </span>
          </Link>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
