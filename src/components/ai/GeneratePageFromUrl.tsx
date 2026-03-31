"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

type ApiResponse = {
  page_id?: string;
  pageId?: string;
  inserted?: number;
  extracted?: { hotelName: string; address: string };
  error?: string;
  details?: string;
  message?: string;
  dbError?: string;
  quality?: {
    score?: number;
    missingCoreCards?: string[];
    missingFields?: string[];
    suggestions?: string[];
  };
  ai?: {
    modelUsed?: string;
    fallbackUsed?: boolean;
    mode?: string;
  };
};

export function GeneratePageFromUrl({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError("ホテルのウェブサイトURLを入力してください");
      return;
    }
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setError("有効なURLを入力してください（http:// または https://）");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) {
        setError("ログインが必要です");
        setLoading(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setError("ログインが必要です");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/ai/generate-cards-from-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok) {
        const msg = data.error ?? data.details ?? data.message ?? "生成に失敗しました";
        setError(res.status === 503 ? `${msg}（OPENAI_API_KEY を設定してください）` : msg);
        setLoading(false);
        return;
      }
      const pageId = data.page_id ?? data.pageId;
      if (pageId && typeof pageId === "string") {
        const params = new URLSearchParams();
        if (typeof data.quality?.score === "number") params.set("qscore", String(data.quality.score));
        if (data.quality?.suggestions?.[0]) params.set("qsug", data.quality.suggestions[0]);
        if (data.ai?.modelUsed) params.set("qmodel", data.ai.modelUsed);
        if (data.ai?.fallbackUsed) params.set("qfallback", "1");
        const query = params.toString();
        router.push(query ? `/editor/${pageId}?${query}` : `/editor/${pageId}`);
        return;
      }
      setError(data.dbError ?? data.message ?? "ページの作成に失敗しました");
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={className}>
      <div className="mb-3">
        <h2 className="text-base font-semibold text-slate-900">URLからAIでページを生成</h2>
        <p className="mt-1 text-sm text-slate-500">
          ホテルのウェブサイトURLを入力すると、ウェルカム・WiFi・朝食・チェックアウト・周辺・タクシー・緊急連絡先・地図のカードを自動作成し、編集画面を開きます。
        </p>
      </div>
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="ai-url" className="mb-1 block text-sm font-medium text-slate-700">
              ホテル公式サイトURL
            </label>
            <input
              id="ai-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.example-hotel.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "生成中…" : "生成して編集"}
          </button>
        </div>
      </form>
    </section>
  );
}
