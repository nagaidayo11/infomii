"use client";

import { useState } from "react";
import { useEditor2Store } from "./store";

type ApiCard = { type: string; content: Record<string, unknown>; order: number };

export type AIGenerateFromDescriptionProps = {
  onClose?: () => void;
  className?: string;
};

/**
 * User describes the page (e.g. "Create a hotel information page");
 * AI generates cards and loads them into the editor canvas.
 */
export function AIGenerateFromDescription({
  onClose,
  className = "",
}: AIGenerateFromDescriptionProps) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGeneratedCards = useEditor2Store((s) => s.loadGeneratedCards);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = description.trim();
    if (!trimmed) {
      setError("Describe the page you want to create");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/generate-cards-from-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: trimmed }),
      });
      const data = (await res.json()) as {
        cards?: ApiCard[];
        error?: string;
        details?: string;
      };
      if (!res.ok) {
        const msg = data.error ?? data.details ?? "Generation failed";
        setError(res.status === 503 ? `${msg} (OPENAI_API_KEY required)` : msg);
        return;
      }
      const cards = data.cards;
      if (!cards || !Array.isArray(cards) || cards.length === 0) {
        setError("No cards were generated");
        return;
      }
      loadGeneratedCards(
        cards.map((c) => ({
          type: c.type,
          content: c.content ?? {},
          order: c.order ?? 0,
        }))
      );
      setDescription("");
      onClose?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <h3 className="text-sm font-semibold text-slate-800">AI page generation</h3>
      <p className="mt-1 text-xs text-slate-500">
        Describe the page and we&apos;ll generate useful cards automatically.
      </p>
      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">
            {error}
          </div>
        )}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Create a hotel information page with WiFi, breakfast hours, and a map"
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-slate-400 focus:border-ds-primary focus:ring-2 focus:ring-ds-primary/20 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
          disabled={loading}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-ds-primary px-3 py-2 text-sm font-medium text-white shadow-[var(--shadow-ds-sm)] transition hover:bg-blue-600 disabled:opacity-60"
          >
            {loading ? "Generating…" : "Generate page"}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
