"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getDashboardBootstrapData,
  getCurrentHotelViewMetrics,
  createBlankPage,
} from "@/lib/storage";
import type { Information } from "@/types/information";
import { GeneratePageFromUrl } from "@/components/ai/GeneratePageFromUrl";
import { PageCard } from "./PageCard";

export function PagesListView() {
  const router = useRouter();
  const [items, setItems] = useState<Information[]>([]);
  const [pageStats, setPageStats] = useState<
    Array<{ informationId: string; views: number; qrViews: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      getDashboardBootstrapData(),
      getCurrentHotelViewMetrics().catch(() => null),
    ])
      .then(([bootstrap, metrics]) => {
        if (!mounted) return;
        setItems(bootstrap.informations ?? []);
        setPageStats(metrics?.pageStats ?? []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function handleCreatePage() {
    setCreating(true);
    try {
      const pageId = await createBlankPage("新規ページ");
      if (pageId && typeof pageId === "string") {
        router.push(`/editor/${pageId}`);
      }
    } catch {
      setCreating(false);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">ページ</h1>
          <p className="mt-1 text-sm text-slate-500">
            案内ページの一覧。編集または公開ページを開けます。
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreatePage}
          disabled={creating}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-lg leading-none">
            +
          </span>
          ページを作成
        </button>
      </header>

      <div className="mt-6">
        <GeneratePageFromUrl />
      </div>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100 sm:h-28" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <p className="text-slate-600">まだページがありません</p>
          <p className="mt-1 text-sm text-slate-500">
            下のボタンから1つ作成してください。
          </p>
          <button
            type="button"
            onClick={handleCreatePage}
            disabled={creating}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-lg leading-none">
              +
            </span>
            ページを作成
          </button>
        </div>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-1">
          {items.map((item) => {
            const stat = pageStats.find((p) => p.informationId === item.id);
            return (
              <li key={item.id}>
                <PageCard
                  id={item.id}
                  title={item.title}
                  slug={item.slug}
                  status={item.status}
                  updatedAt={item.updatedAt}
                  views7d={stat?.views}
                  qrViews7d={stat?.qrViews}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
