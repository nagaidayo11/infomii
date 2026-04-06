"use client";

import { useState } from "react";
import { useEditor2Store } from "./store";

type ApiCard = { type: string; content: Record<string, unknown>; order: number };

export type AIGenerateFromUrlProps = {
  onClose?: () => void;
  className?: string;
};

/**
 * ホテルURLを入力してAIでカードを生成し、エディタのキャンバスに反映する。
 * 日本語UIのまま。
 */
export function AIGenerateFromUrl({ onClose, className = "" }: AIGenerateFromUrlProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGeneratedCards = useEditor2Store((s) => s.loadGeneratedCards);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError("URLを入力してください");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/generate-cards-from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = (await res.json()) as {
        cards?: ApiCard[];
        error?: string;
        details?: string;
      };
      if (!res.ok) {
        const msg = data.error ?? data.details ?? "生成に失敗しました";
        setError(res.status === 503 ? `${msg}（OPENAI_API_KEY を設定してください）` : msg);
        return;
      }
      const cards = data.cards;
      if (!cards || !Array.isArray(cards) || cards.length === 0) {
        setError("カードを取得できませんでした");
        return;
      }
      loadGeneratedCards(
        cards.map((c) => ({
          type: c.type,
          content: c.content ?? {},
          order: c.order ?? 0,
        }))
      );
      setUrl("");
      onClose?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <h3 className="text-sm font-semibold text-slate-800">URLから自動作成</h3>
      <p className="mt-1 text-xs text-slate-500">
        ホテルサイトのURLを入力すると、情報を取得してカードを自動生成します。
      </p>
      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">
            {error}
          </div>
        )}
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-xl border border-ds-border bg-ds-card px-3 py-2 text-sm text-slate-800 outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-slate-400 focus:border-ds-primary focus:ring-2 focus:ring-ds-primary/20 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
          disabled={loading}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-ds-primary px-3 py-2 text-sm font-medium text-white shadow-[var(--shadow-ds-sm)] transition hover:bg-ds-primary-hover disabled:opacity-60"
          >
            {loading ? "生成中…" : "生成してキャンバスに追加"}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-ds-border bg-ds-card px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              キャンセル
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
