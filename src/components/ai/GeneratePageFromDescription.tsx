"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { FullScreenLoadingOverlay } from "@/components/ui/FullScreenLoadingOverlay";
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

type PromptTemplate = { id: string; label: string; text: string };

const PROMPT_TEMPLATES_PERSONAL: PromptTemplate[] = [
  {
    id: "travel",
    label: "旅行しおり",
    text: "友達3人で京都2泊3日の旅行しおり。1日目の新幹線と宿、2日目は嵐山、3日目はお土産と帰り。持ち物リスト、集合場所のMAP、割り勘はLINEで話す旨も入れて。",
  },
  {
    id: "weekend",
    label: "日帰りおでかけ",
    text: "箱根の日帰りプラン。新宿集合、ロマンスカー、温泉街ランチ、カフェ、18:30までに新宿に戻る。雨の日はロープウェイやめて屋内にするメモも。",
  },
  {
    id: "oshi-live",
    label: "ライブ・推し活",
    text: "都内ライブ当日のまとめ。開場・開演・終演後の集合場所、持ち物、グッズ列の目安、最終電車。友達に送るトーンで。",
  },
  {
    id: "date",
    label: "デート・おでかけ",
    text: "渋谷の午後デート。12時ハチ公で集合、ランチ、代官山散歩、カフェ、夕食予約。雨なら屋内に変更、遅れたらチャットで連絡。",
  },
  {
    id: "event",
    label: "イベント・勉強会",
    text: "友達主催のNext.js勉強会。6/14土14:00-16:30、20人・無料、PC持参。受付、講義、ハンズオン、質疑のタイムテーブルと会場MAP。",
  },
  {
    id: "links",
    label: "リンクまとめ",
    text: "自分用のリンク集ページ。ポートフォリオ、Instagram、ブログ、仕事の相談フォーム。短い自己紹介と、DMよりフォーム推奨のメモ。",
  },
];

const PROMPT_TEMPLATES_HOSPITALITY: PromptTemplate[] = [
  {
    id: "hotel-basic",
    label: "館内案内（基本）",
    text: "ビジネスホテルの館内案内ページ。Wi-Fi（SSID・パスワード）、朝食（時間・場所）、チェックアウト11:00、周辺の駅・コンビニ、フロント連絡先。",
  },
  {
    id: "onsen",
    label: "旅館・温泉",
    text: "旅館の宿泊案内。大浴場の利用時間、食事（夕食・朝食）の時間と会場、チェックアウト、館内の過ごし方、周辺観光とタクシー案内。",
  },
  {
    id: "short-stay",
    label: "ビジネス宿泊",
    text: "出張客向けのホテル案内。Wi-Fi、朝食、チェックアウト、最寄り駅・コンビニ、ランドリー、領収書・宅配便の案内、フロント内線。",
  },
];

function PromptChipRow({
  templates,
  loading,
  onSelect,
  chipClassName = "rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60",
}: {
  templates: PromptTemplate[];
  loading: boolean;
  onSelect: (text: string) => void;
  chipClassName?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {templates.map((tpl) => (
        <button
          key={tpl.id}
          type="button"
          onClick={() => onSelect(tpl.text)}
          disabled={loading}
          className={chipClassName}
        >
          {tpl.label}
        </button>
      ))}
    </div>
  );
}

export function GeneratePageFromDescription({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = description.trim();
    if (!trimmed) {
      setError("説明文を入力してください");
      return;
    }
    setLoading(true);
    setError(null);
    let navigated = false;
    try {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) {
        setError("ログインが必要です");
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setError("ログインが必要です");
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
        const msg = data.details ?? data.error ?? "生成に失敗しました";
        const withStatus = `${msg} (HTTP ${res.status})`;
        setError(res.status === 503 ? `${withStatus}（OPENAI_API_KEY を設定してください）` : withStatus);
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
        navigated = true;
        return;
      }
      setError(data.details ?? "ページの作成に失敗しました");
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      if (!navigated) setLoading(false);
    }
  }

  return (
    <section className={className}>
      <div className="mb-3">
        <h2 className="text-base font-semibold text-slate-900">説明を書くだけでページができる</h2>
        <p className="mt-1 text-sm text-slate-500">
          旅行のしおりや推し活メモなど個人向けのほか、ホテル・旅館の館内案内も同じ要領で作れます。
        </p>
      </div>
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}
        <div className="space-y-3">
          <div className="space-y-3">
            <div>
              <p className="mb-2 text-xs font-medium text-slate-600">個人・友達に送る（例文）</p>
              <PromptChipRow templates={PROMPT_TEMPLATES_PERSONAL} loading={loading} onSelect={setDescription} />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-slate-600">宿泊施設向け（例文）</p>
              <PromptChipRow
                templates={PROMPT_TEMPLATES_HOSPITALITY}
                loading={loading}
                onSelect={setDescription}
                chipClassName="rounded-full border border-slate-300/80 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-800 transition hover:bg-slate-200/80 disabled:opacity-60"
              />
            </div>
          </div>
          <div>
            <label htmlFor="ai-desc" className="mb-1 block text-sm font-medium text-slate-700">
              どんなページにする？
            </label>
            <textarea
              id="ai-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例: 友達と沖縄3泊… / ホテルの館内案内でWi-Fi・朝食・チェックアウトを載せたい、など自由に書いてください"
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
              disabled={loading}
            />
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <p>コツ: 個人向けは時間・場所・持ち物。宿泊向けは Wi-Fi・食事・チェックアウト・連絡先があると良いです。</p>
              <p>{description.trim().length} 文字</p>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="app-button-native rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold !text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "つくってる…" : "つくって編集"}
          </button>
        </div>
      </form>
      {mounted &&
        loading &&
        createPortal(
          <FullScreenLoadingOverlay
            title="つくってる…"
            subtitle="AIがカードを並べています"
            classNameZ="z-[90]"
          />,
          document.body
        )}
    </section>
  );
}
