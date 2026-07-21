"use client";

import { useState } from "react";
import Link from "next/link";
import { nanoid } from "nanoid";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { AppIcon } from "@/components/app-shell/icons/AppIconSet";
import { withAppClientQuery } from "@/lib/app-href";
import { useEditor2Store } from "./store";
import { createEmptyCard } from "./types";
import {
  getStarterCardTypes,
  resolveAppLibraryAudience,
} from "@/lib/editor/card-library-config";
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

  function starterAudienceLabel() {
    if (!isAppShell) return null;
    return resolveAppLibraryAudience([]) === "personal" ? "個人向け" : "宿泊施設向け";
  }

  async function handleUseStarterCards() {
    setLoading(true);
    setError(null);
    try {
      const audience = isAppShell
        ? resolveAppLibraryAudience([])
        : "hotel";
      const starterTypes = getStarterCardTypes(audience);
      const cards = starterTypes.map((type, i) =>
        createEmptyCard(type, nanoid(10), i, audience),
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
    <div
      className={
        "flex h-full min-h-0 flex-col items-center justify-center overflow-y-auto px-4 py-8 " +
        (isAppShell ? "app-new-page-onboarding bg-gradient-to-b from-teal-50/60 to-[#f6f8fa]" : "bg-slate-100")
      }
    >
      <div
        className={
          "w-full max-w-md p-6 " +
          (isAppShell
            ? "app-new-page-onboarding-card text-center"
            : "rounded-xl border border-slate-200 bg-white shadow-sm")
        }
      >
        {isAppShell ? (
          <div className="mx-auto mb-4 flex justify-center">
            <AppIcon name="empty-editor" size={56} />
          </div>
        ) : null}
        <h2 className="text-lg font-semibold text-slate-900">
          {isAppShell ? "ここから貼っていこう" : "空のページです"}
        </h2>
        <p className={"truncate text-sm text-slate-500 " + (isAppShell ? "mt-1" : "mt-1")}>
          {pageTitle || "無題のページ"}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {isAppShell
            ? "下の「シール」から好きなブロックをタップして貼るか、旅のしおり向けの基本セットを一括で入れられます。"
            : "左のライブラリからブロックを追加するか、下のショートカットを使って始めてください。"}
        </p>

        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={() => void handleUseStarterCards()}
            disabled={loading}
            className={
              "flex w-full min-h-[48px] items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60 " +
              (isAppShell
                ? "bg-teal-600 text-white shadow-sm active:bg-teal-700"
                : "bg-slate-900 text-white hover:bg-slate-800")
            }
          >
            {loading
              ? "追加中…"
              : isAppShell
                ? `基本シールを入れる（${starterAudienceLabel()}）`
                : "基本ブロックを入れる"}
          </button>
          <Link
            href={toShellHref("/templates")}
            className={
              "flex w-full min-h-[44px] items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium " +
              (isAppShell
                ? "border border-teal-200 bg-white text-teal-800 active:bg-teal-50"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50")
            }
          >
            はじめの型を見る
          </Link>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
