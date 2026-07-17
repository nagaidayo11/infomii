"use client";

import { useEffect, useState, type ReactNode } from "react";
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

type PromptTemplate = {
  id: string;
  label: string;
  text: string;
  icon?: ReactNode;
};

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

/** Soft deformed pictograms for AI prompt chips. */
function IconTravel() {
  return (
    <svg viewBox="0 0 32 32" className="app-ai-chip-icon" aria-hidden>
      <rect x="7" y="11" width="18" height="13" rx="3.5" fill="#7dd3c7" />
      <path
        d="M12 11V9.5a4 4 0 0 1 8 0V11"
        fill="none"
        stroke="#0f766e"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12.5" cy="17.5" r="1.4" fill="#0f766e" />
      <circle cx="19.5" cy="17.5" r="1.4" fill="#0f766e" />
      <path d="M7 18h18" stroke="#fff" strokeWidth="1.5" opacity="0.7" />
    </svg>
  );
}

function IconOuting() {
  return (
    <svg viewBox="0 0 32 32" className="app-ai-chip-icon" aria-hidden>
      <circle cx="22" cy="10" r="5" fill="#fbbf24" />
      <path
        d="M4 24c4-5 8-7 12-5s7 1 12 4"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 20c2-3 4-3 6 0"
        fill="none"
        stroke="#0d9488"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="13" cy="16" r="1.5" fill="#0d9488" />
    </svg>
  );
}

function IconLive() {
  return (
    <svg viewBox="0 0 32 32" className="app-ai-chip-icon" aria-hidden>
      <path
        d="M16 6l2.2 6.2H25l-5.1 3.8 2 6.2L16 18.8 10.1 22l2-6.2L7 12.2h6.8z"
        fill="#f472b6"
      />
      <circle cx="16" cy="14.5" r="2.2" fill="#fff" opacity="0.85" />
    </svg>
  );
}

function IconDate() {
  return (
    <svg viewBox="0 0 32 32" className="app-ai-chip-icon" aria-hidden>
      <path
        d="M16 26s-8.5-5.2-8.5-11.2A4.6 4.6 0 0 1 16 12.2a4.6 4.6 0 0 1 8.5 2.6C24.5 20.8 16 26 16 26z"
        fill="#fb7185"
      />
      <circle cx="13.2" cy="15.2" r="1.2" fill="#fff" opacity="0.9" />
      <circle cx="18.8" cy="15.2" r="1.2" fill="#fff" opacity="0.9" />
    </svg>
  );
}

function IconSpark() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
      <circle cx="16" cy="16" r="10" fill="rgba(255,255,255,0.22)" />
      <path
        d="M16 7.5c.5 3.2 2.3 5 5.5 5.5-3.2.5-5 2.3-5.5 5.5-.5-3.2-2.3-5-5.5-5.5 3.2-.5 5-2.3 5.5-5.5z"
        fill="#fff"
      />
      <circle cx="23.5" cy="10" r="1.4" fill="#fff" opacity="0.85" />
      <circle cx="9.5" cy="21.5" r="1.1" fill="#fff" opacity="0.7" />
    </svg>
  );
}

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
          {tpl.icon ? <span className="inline-flex shrink-0">{tpl.icon}</span> : null}
          <span>{tpl.label}</span>
        </button>
      ))}
    </div>
  );
}

const APP_HOME_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "travel",
    label: "旅",
    icon: <IconTravel />,
    text: "友達3人で京都2泊3日の旅行。1日目の新幹線と宿、2日目は嵐山、3日目はお土産と帰り。持ち物リスト、集合場所のMAP、割り勘はLINEで話す旨も入れて。",
  },
  {
    id: "weekend",
    label: "日帰り",
    icon: <IconOuting />,
    text: PROMPT_TEMPLATES_PERSONAL[1]!.text,
  },
  {
    id: "oshi-live",
    label: "ライブ",
    icon: <IconLive />,
    text: PROMPT_TEMPLATES_PERSONAL[2]!.text,
  },
  {
    id: "date",
    label: "デート",
    icon: <IconDate />,
    text: PROMPT_TEMPLATES_PERSONAL[3]!.text,
  },
];

export function GeneratePageFromDescription({
  className = "",
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "app";
}) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const isApp = variant === "app";
  const textareaId = isApp ? "ai-desc-app" : "ai-desc";

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
      const {
        data: { session },
      } = await supabase.auth.getSession();
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

  const chipClassName = isApp ? "app-ai-chip app-pressable" : undefined;

  return (
    <section className={className}>
      <form
        onSubmit={handleSubmit}
        className={
          isApp
            ? "app-ai-compose-card space-y-3"
            : "rounded-lg border border-[#e6e8eb] bg-white p-4"
        }
      >
        {isApp ? (
          <div className="flex items-center gap-2.5">
            <div className="app-ai-compose-orb" aria-hidden>
              <IconSpark />
            </div>
            <h2 className="text-lg font-bold leading-tight text-[var(--app-text)]">AIでつくる</h2>
          </div>
        ) : (
          <div className="mb-3">
            <h2 className="text-base font-semibold text-slate-900">説明を書くだけでページができる</h2>
            <p className="mt-1 text-sm text-slate-500">
              ホテル・旅館の館内案内を、短い説明から作成できます。
            </p>
          </div>
        )}
        {error && (
          <div
            className={
              isApp
                ? "rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
                : "mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
            }
          >
            {error}
          </div>
        )}
        <div className={isApp ? "space-y-2.5" : "space-y-3"}>
          {isApp ? (
            <PromptChipRow
              templates={APP_HOME_PROMPT_TEMPLATES}
              loading={loading}
              onSelect={setDescription}
              chipClassName={chipClassName}
            />
          ) : (
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-700">宿泊施設向け（例文）</p>
              <PromptChipRow
                templates={PROMPT_TEMPLATES_HOSPITALITY}
                loading={loading}
                onSelect={setDescription}
                chipClassName="rounded-md border border-[#e6e8eb] bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
              />
            </div>
          )}
          <div>
            {!isApp ? (
              <label htmlFor={textareaId} className="mb-1 block text-sm font-medium text-slate-700">
                どんなページにする？
              </label>
            ) : (
              <label htmlFor={textareaId} className="sr-only">
                作りたいページ
              </label>
            )}
            <textarea
              id={textareaId}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isApp
                  ? "例: 京都2泊3日。集合・持ち物・日程"
                  : "例: ビジネスホテルの館内案内。Wi-Fi・朝食・チェックアウト・周辺の駅を載せたい"
              }
              rows={3}
              className={
                isApp
                  ? "app-ai-textarea w-full resize-none px-3.5 py-2.5 text-[15px] text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] focus:outline-none"
                  : "w-full resize-none rounded-md border border-[#e6e8eb] px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
              }
              disabled={loading}
            />
            {!isApp ? (
              <p className="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span>コツ: Wi-Fi・食事・チェックアウト・連絡先・周辺案内を入れると作りやすいです。</span>
                <span>{description.trim().length} 文字</span>
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={
              isApp
                ? "app-ai-submit app-touch-btn app-pressable flex w-full items-center justify-center gap-2 font-semibold text-white disabled:opacity-50"
                : "app-button-native rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium !text-white transition hover:bg-slate-800 disabled:opacity-60"
            }
          >
            <span>{loading ? "つくってる…" : isApp ? "つくる" : "AIでページ作成"}</span>
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
