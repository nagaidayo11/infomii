"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

type ApiResponse = {
  page_id?: string;
  pageId?: string;
  cards?: number;
  error?: string;
  details?: string;
};

export function GeneratePageFromDescription({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = description.trim();
    if (!trimmed) {
      setError("説明文を入力してください");
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
      const res = await fetch("/api/ai/generate-page-from-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description: trimmed }),
      });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok) {
        const msg = data.error ?? data.details ?? "生成に失敗しました";
        setError(res.status === 503 ? `${msg}（OPENAI_API_KEY を設定してください）` : msg);
        setLoading(false);
        return;
      }
      const pageId = data.page_id ?? data.pageId;
      if (pageId && typeof pageId === "string") {
        router.push(`/editor/${pageId}`);
        return;
      }
      setError(data.details ?? "ページの作成に失敗しました");
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={className}>
      <div className="mb-3">
        <h2 className="text-base font-semibold text-slate-900">説明文からAIでページを生成</h2>
        <p className="mt-1 text-sm text-slate-500">
          「ホテルの館内案内でWiFi・朝食・チェックアウトを入れたい」など、作りたいページを日本語で説明すると、カードを自動作成して編集画面を開きます。
        </p>
      </div>
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}
        <div className="space-y-3">
          <div>
            <label htmlFor="ai-desc" className="mb-1 block text-sm font-medium text-slate-700">
              作りたいページの説明
            </label>
            <textarea
              id="ai-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例: ホテルの館内案内ページ。WiFiのSSIDとパスワード、朝食7:00〜9:30、チェックアウト11:00、周辺のコンビニと駅の案内"
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "生成中…" : "生成して編集"}
          </button>
        </div>
      </form>
    </section>
  );
}
