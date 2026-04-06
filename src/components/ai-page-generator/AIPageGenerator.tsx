"use client";

import { useState } from "react";
import { createPagesFromTemplate } from "@/lib/storage";
import type { MultiPageTemplate, TemplatePage } from "@/lib/multi-page-templates/types";

const DEFAULT_PREVIEW_IMAGE =
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80";

export type AIPageGeneratorProps = {
  onCreated?: (pageIds: string[]) => void;
  className?: string;
};

/**
 * AI page generator: input hotel name + location, call API to generate
 * 5 pages (館内総合案内, WiFi, 朝食, チェックアウト, 周辺観光) with Title, Text, Icon, Button blocks.
 */
export function AIPageGenerator({ onCreated, className = "" }: AIPageGeneratorProps) {
  const [hotelName, setHotelName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = hotelName.trim();
    const loc = location.trim();
    if (!name || !loc) {
      setError("ホテル名と所在地を入力してください");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/generate-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelName: name, location: loc }),
      });
      const data = (await res.json()) as { pages?: TemplatePage[]; error?: string; details?: string };
      if (!res.ok) {
        const msg = data.error ?? data.details ?? "生成に失敗しました";
        setError(res.status === 503 ? `${msg}（OPENAI_API_KEY を設定してください）` : msg);
        return;
      }
      const pages = data.pages;
      if (!pages || !Array.isArray(pages) || pages.length === 0) {
        setError("ページデータを取得できませんでした");
        return;
      }
      const template: MultiPageTemplate = {
        id: `ai-${Date.now()}`,
        name: `${name} - AI生成`,
        description: `${loc}のゲスト向け案内ページ（AI生成）`,
        previewImage: DEFAULT_PREVIEW_IMAGE,
        pages,
      };
      const ids = await createPagesFromTemplate(template);
      onCreated?.(ids);
      setHotelName("");
      setLocation("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={className}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">AIでページを自動作成</h2>
        <p className="mt-1 text-sm text-slate-500">
          ホテル名と所在地を入力すると、館内総合案内・WiFi・朝食・チェックアウト・周辺観光などの複数ページを自動作成します。
        </p>
      </div>
      <form onSubmit={handleSubmit} className="rounded-xl border border-ds-border bg-ds-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ai-hotel-name" className="mb-1 block text-sm font-medium text-slate-700">
              ホテル名
            </label>
            <input
              id="ai-hotel-name"
              type="text"
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
              placeholder="例: 〇〇ホテル"
              className="w-full rounded-xl border border-ds-border px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-ds-primary focus:outline-none focus:ring-2 focus:ring-ds-primary/20"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="ai-location" className="mb-1 block text-sm font-medium text-slate-700">
              所在地
            </label>
            <input
              id="ai-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="例: 東京都渋谷区"
              className="w-full rounded-xl border border-ds-border px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-ds-primary focus:outline-none focus:ring-2 focus:ring-ds-primary/20"
              disabled={loading}
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-ds-primary px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-ds-primary-hover disabled:opacity-60 sm:w-auto sm:min-w-[200px]"
          >
            {loading ? "生成中…" : "AIでページを生成"}
          </button>
        </div>
      </form>
    </section>
  );
}
