"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BREAKFAST_CROWD_EDITOR_LABELS,
  BREAKFAST_CROWD_LEVELS,
  BREAKFAST_CROWD_LEVEL_TONES,
  formatBreakfastCrowdUpdatedAt,
  type BreakfastCrowdLevel,
} from "@/lib/editor/breakfast-crowd";
import {
  buildBreakfastCrowdOpsHref,
  canEditBreakfastCrowdOps,
  listHotelBreakfastCrowdTargets,
  loadBreakfastCrowdTargetsForPage,
  rememberBreakfastCrowdOpsPageId,
  readLastBreakfastCrowdOpsPageId,
  saveBreakfastCrowdOpsStatus,
  type BreakfastCrowdOpsTarget,
} from "@/lib/editor/breakfast-crowd-ops";
import { useAppToast } from "@/components/app-shell/AppToastProvider";
import { useClientShell } from "@/components/app-shell/useClientShell";

export function BreakfastCrowdQuickOps() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageIdParam = searchParams.get("pageId")?.trim() || null;
  const { showToast } = useAppToast();
  const { isAppShell } = useClientShell();

  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [hotelTargets, setHotelTargets] = useState<BreakfastCrowdOpsTarget[]>([]);
  const [pageTargets, setPageTargets] = useState<BreakfastCrowdOpsTarget[]>([]);
  const [pageTitle, setPageTitle] = useState<string | null>(null);
  const [pageMissing, setPageMissing] = useState(false);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [level, setLevel] = useState<BreakfastCrowdLevel>("open");
  const [note, setNote] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const saveBusyRef = useRef(false);

  const activeTarget = useMemo(
    () => pageTargets.find((t) => t.cardId === activeCardId) ?? pageTargets[0] ?? null,
    [pageTargets, activeCardId],
  );

  const applyTarget = useCallback((target: BreakfastCrowdOpsTarget | null) => {
    if (!target) {
      setActiveCardId(null);
      setLevel("open");
      setNote("");
      setUpdatedAt(null);
      return;
    }
    setActiveCardId(target.cardId);
    setLevel(target.status.level);
    setNote(target.status.note);
    setUpdatedAt(target.status.updatedAt);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPageMissing(false);
    try {
      const [editable, allTargets] = await Promise.all([
        canEditBreakfastCrowdOps(),
        listHotelBreakfastCrowdTargets(),
      ]);
      setCanEdit(editable);
      setHotelTargets(allTargets);

      let resolvedPageId = pageIdParam;
      if (!resolvedPageId) {
        const last = readLastBreakfastCrowdOpsPageId();
        if (last && allTargets.some((t) => t.page.id === last)) {
          resolvedPageId = last;
        } else if (allTargets[0]) {
          resolvedPageId = allTargets[0].page.id;
        }
      }

      if (!resolvedPageId) {
        setPageTargets([]);
        setPageTitle(null);
        applyTarget(null);
        return;
      }

      if (pageIdParam !== resolvedPageId && !pageIdParam) {
        router.replace(buildBreakfastCrowdOpsHref(resolvedPageId));
      }

      rememberBreakfastCrowdOpsPageId(resolvedPageId);
      const { page, targets } = await loadBreakfastCrowdTargetsForPage(resolvedPageId);
      if (!page) {
        setPageMissing(true);
        setPageTargets([]);
        setPageTitle(null);
        applyTarget(null);
        return;
      }
      setPageTitle(page.title);
      setPageTargets(targets);
      applyTarget(targets[0] ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, [pageIdParam, router, applyTarget]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave() {
    if (!activeTarget || !canEdit || saveBusyRef.current) return;
    saveBusyRef.current = true;
    setSaving(true);
    setSaveNotice(null);
    setError(null);
    try {
      const next = await saveBreakfastCrowdOpsStatus(activeTarget.page.id, { level, note });
      setUpdatedAt(next.updatedAt);
      // Page-level ops: every breakfast_crowd card on this page shares the same status.
      setPageTargets((prev) => prev.map((t) => ({ ...t, status: next })));
      setHotelTargets((prev) =>
        prev.map((t) => (t.page.id === activeTarget.page.id ? { ...t, status: next } : t)),
      );
      const msg = "朝食混雑を更新しました";
      setSaveNotice(msg);
      if (isAppShell) showToast(msg, "success");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "保存に失敗しました";
      setError(msg);
      if (isAppShell) showToast(msg, "error");
    } finally {
      setSaving(false);
      saveBusyRef.current = false;
    }
  }

  function handlePageChange(nextPageId: string) {
    rememberBreakfastCrowdOpsPageId(nextPageId);
    router.push(buildBreakfastCrowdOpsHref(nextPageId));
  }

  const updatedLabel = formatBreakfastCrowdUpdatedAt(updatedAt) ?? "最終更新 —";
  const pagesWithCrowd = useMemo(() => {
    const seen = new Map<string, string>();
    for (const t of hotelTargets) {
      if (!seen.has(t.page.id)) seen.set(t.page.id, t.page.title);
    }
    if (pageIdParam && pageTitle && !seen.has(pageIdParam)) {
      seen.set(pageIdParam, pageTitle);
    }
    return Array.from(seen.entries()).map(([id, title]) => ({ id, title }));
  }, [hotelTargets, pageIdParam, pageTitle]);

  return (
    <div className="app-main-container mx-auto max-w-lg space-y-5 pb-10">
      <header className="app-page-header">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">フロントデスク</p>
        <h1 className="mt-1 app-page-title">朝食混雑クイック切替</h1>
        <p className="app-page-subtitle">大きなボタンで混雑状況をすぐ更新できます</p>
      </header>

      {!canEdit && !loading ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
          閲覧権限のため更新できません。オーナーに編集権限の付与を依頼してください。
        </p>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {error}
        </div>
      ) : null}

      {saveNotice ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {saveNotice}
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        </div>
      ) : pageMissing ? (
        <EmptyBlock
          title="ページが見つかりません"
          body="指定のページにアクセスできないか、削除されている可能性があります。"
          actionHref="/dashboard/pages"
          actionLabel="ページ一覧へ"
        />
      ) : pagesWithCrowd.length === 0 ? (
        <EmptyBlock
          title="朝食混雑ブロックがありません"
          body="編集画面で「朝食混雑」ブロックを追加すると、ここから混雑状況を切り替えられます。"
          actionHref={pageIdParam ? `/editor/${pageIdParam}` : "/dashboard/pages"}
          actionLabel={pageIdParam ? "編集画面で追加" : "ページ一覧へ"}
        />
      ) : (
        <>
          <section className="space-y-2">
            <label className="block text-xs font-medium text-slate-500" htmlFor="ops-page">
              対象ページ
            </label>
            <select
              id="ops-page"
              value={pageIdParam ?? pagesWithCrowd[0]?.id ?? ""}
              onChange={(e) => handlePageChange(e.target.value)}
              className="min-h-[48px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              {pagesWithCrowd.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title || "無題のページ"}
                </option>
              ))}
            </select>
            {pageTitle ? (
              <p className="text-xs text-slate-500">
                {pageTitle}
                {activeTarget ? ` · ${activeTarget.title}` : null}
              </p>
            ) : null}
          </section>

          {pageTargets.length === 0 ? (
            <EmptyBlock
              title="このページに朝食混雑ブロックがありません"
              body="編集画面でブロックを追加してください。"
              actionHref={`/editor/${pageIdParam}`}
              actionLabel="編集画面を開く"
            />
          ) : (
            <>
              {pageTargets.length > 1 ? (
                <section className="space-y-2">
                  <label className="block text-xs font-medium text-slate-500" htmlFor="ops-card">
                    ブロック
                  </label>
                  <select
                    id="ops-card"
                    value={activeCardId ?? ""}
                    onChange={(e) => {
                      const next = pageTargets.find((t) => t.cardId === e.target.value) ?? null;
                      applyTarget(next);
                      setSaveNotice(null);
                    }}
                    className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                  >
                    {pageTargets.map((t, i) => (
                      <option key={t.cardId} value={t.cardId}>
                        {t.title || `朝食混雑 ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </section>
              ) : null}

              <section className="space-y-3">
                <div className="flex items-end justify-between gap-2">
                  <h2 className="text-sm font-semibold text-slate-800">混雑レベル</h2>
                  <p className="text-xs text-slate-500">{updatedLabel}</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {BREAKFAST_CROWD_LEVELS.map((lv) => {
                    const selected = level === lv;
                    const tone = BREAKFAST_CROWD_LEVEL_TONES[lv];
                    return (
                      <button
                        key={lv}
                        type="button"
                        disabled={!canEdit || saving}
                        onClick={() => {
                          setLevel(lv);
                          setSaveNotice(null);
                        }}
                        className={
                          "relative min-h-[72px] overflow-hidden rounded-2xl border px-4 py-4 text-left transition disabled:opacity-60 " +
                          (selected ? tone.opsSelected : tone.opsIdle)
                        }
                      >
                        <span
                          className={`absolute inset-y-0 left-0 w-1.5 ${tone.band}`}
                          aria-hidden
                        />
                        <span className="block pl-2 text-lg font-semibold leading-snug sm:text-xl">
                          {BREAKFAST_CROWD_EDITOR_LABELS[lv]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-2">
                <label className="block text-xs font-medium text-slate-500" htmlFor="ops-note">
                  メモ（任意）
                </label>
                <textarea
                  id="ops-note"
                  value={note}
                  disabled={!canEdit || saving}
                  onChange={(e) => {
                    setNote(e.target.value);
                    setSaveNotice(null);
                  }}
                  rows={2}
                  placeholder="例: 最終入場は9:00です"
                  className="min-h-[72px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:opacity-60"
                />
              </section>

              <button
                type="button"
                disabled={!canEdit || saving || !activeTarget}
                onClick={() => void handleSave()}
                className="app-button-native inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-base font-semibold !text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? "保存中…" : "更新する"}
              </button>

              {pageIdParam ? (
                <p className="text-center text-xs text-slate-500">
                  <Link
                    href={`/editor/${pageIdParam}`}
                    className="font-medium text-slate-600 underline-offset-2 hover:underline"
                  >
                    編集画面を開く
                  </Link>
                </p>
              ) : null}
            </>
          )}
        </>
      )}
    </div>
  );
}

function EmptyBlock({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
      <Link
        href={actionHref}
        className="app-button-native mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-medium !text-white hover:bg-slate-800"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
