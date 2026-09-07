"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

type ApiResponse = { page_id?: string; pageId?: string; error?: string; details?: string; message?: string };
type ImportSource = "pdf" | "website";

export function GeneratePageFromUrl({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [source, setSource] = useState<ImportSource>("pdf");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (source === "website" && !/^https?:\/\//i.test(trimmed)) {
      setError("有効なホテル公式サイトURLを入力してください");
      return;
    }
    if (source === "pdf" && !file) {
      setError("PDFを選択してください");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = getBrowserSupabaseClient();
      const { data: { session } } = supabase
        ? await supabase.auth.getSession()
        : { data: { session: null } };
      if (!session?.access_token) {
        setError("ログインが必要です");
        return;
      }

      const endpoint = source === "pdf"
        ? "/api/ai/generate-page-from-pdf"
        : "/api/ai/generate-cards-from-url";
      const requestBody = source === "pdf"
        ? (() => {
            const form = new FormData();
            form.set("file", file!);
            return form;
          })()
        : JSON.stringify({ url: trimmed, create_page: true });
      const response = await fetch(endpoint, {
        method: "POST",
        headers: source === "pdf"
          ? { Authorization: `Bearer ${session.access_token}` }
          : { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: requestBody,
      });
      const data = await response.json() as ApiResponse;
      if (!response.ok) {
        setError(data.details ?? data.error ?? data.message ?? "取り込みに失敗しました");
        return;
      }
      const pageId = data.page_id ?? data.pageId;
      if (!pageId) {
        setError("ページの作成に失敗しました");
        return;
      }
      router.push(`/editor/${pageId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={className}>
      <div className="mb-3">
        <h2 className="text-base font-semibold text-slate-900">既存の案内からページを作る</h2>
        <p className="mt-1 text-sm text-slate-500">
          PDFまたはホテル公式サイトを読み取り、内容に合う構成・ブロック・導線をAIが設計します。
        </p>
      </div>
      <form onSubmit={handleSubmit} className="rounded-lg border border-[#e6e8eb] bg-white p-4">
        <div className="mb-4 inline-flex rounded-md border border-[#e6e8eb] bg-slate-50 p-0.5">
          {([{"id":"pdf","label":"PDF"},{"id":"website","label":"ホテル公式サイト"}] as const).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => { setSource(option.id); setError(null); }}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${source === option.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {error ? <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div> : null}

        {source === "pdf" ? (
          <div>
            <label htmlFor="ai-pdf" className="mb-1 block text-sm font-medium text-slate-700">案内PDF</label>
            <input
              id="ai-pdf"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              disabled={loading}
              className="block w-full rounded-md border border-[#e6e8eb] bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium"
            />
            <p className="mt-2 text-xs text-slate-500">15MBまで。原本はInfomiiに保存せず、生成処理後に破棄します。</p>
          </div>
        ) : (
          <div>
            <label htmlFor="ai-url" className="mb-1 block text-sm font-medium text-slate-700">ホテル公式サイトURL</label>
            <input
              id="ai-url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://www.example-hotel.com"
              disabled={loading}
              className="w-full rounded-md border border-[#e6e8eb] px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
            />
          </div>
        )}

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">写真・ロゴは著作権保護のため取り込みません。</p>
          <button
            type="submit"
            disabled={loading}
            className="app-button-native shrink-0 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-semibold !text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "内容と構成を解析中…" : "取り込んでページを作成"}
          </button>
        </div>
      </form>
    </section>
  );
}
