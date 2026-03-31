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

const PROMPT_TEMPLATES = [
  {
    id: "hotel-basic",
    label: "館内案内（基本）",
    text: "ホテルの館内案内ページを作成。含めたい項目: WiFi（SSID・パスワード）、朝食（時間・場所）、チェックアウト時間、周辺案内（駅・コンビニ）、緊急連絡先。",
  },
  {
    id: "onsen",
    label: "旅館・温泉向け",
    text: "旅館の案内ページを作成。含めたい項目: 大浴場/温泉の営業時間、食事時間、館内ルール、チェックアウト、周辺観光、送迎やタクシー案内。",
  },
  {
    id: "short-stay",
    label: "ビジネス宿泊向け",
    text: "ビジネス利用客向けの案内ページ。含めたい項目: WiFi、朝食、チェックアウト、近隣の駅・コンビニ、ランドリー、フロント連絡先。",
  },
] as const;

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
        const params = new URLSearchParams();
        if (typeof data.quality?.score === "number") params.set("qscore", String(data.quality.score));
        if (data.quality?.suggestions?.[0]) params.set("qsug", data.quality.suggestions[0]);
        if (data.ai?.modelUsed) params.set("qmodel", data.ai.modelUsed);
        if (data.ai?.fallbackUsed) params.set("qfallback", "1");
        const query = params.toString();
        router.push(query ? `/editor/${pageId}?${query}` : `/editor/${pageId}`);
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
            <p className="mb-2 text-xs font-medium text-slate-600">AIテンプレート（そのまま使えます）</p>
            <div className="flex flex-wrap gap-2">
              {PROMPT_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setDescription(tpl.text)}
                  disabled={loading}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>
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
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <p>コツ: 「対象客」「必須項目」「時間/場所」を入れると精度が上がります。</p>
              <p>{description.trim().length} 文字</p>
            </div>
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
