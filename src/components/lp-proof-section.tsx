"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import VoiceLogo from "@/components/voice-logo";

type ProofIndustry = "business" | "resort" | "spa";

type ImpactCard = {
  label: string;
  value: string;
};

type BeforeAfterRow = {
  industryTag: ProofIndustry;
  scene: string;
  before: string;
  after: string;
  impact: string;
};

type HotelVoice = {
  industryTag: ProofIndustry;
  brandMark: string;
  brandTone: string;
  logoSrc: string;
  hotel: string;
  comment: string;
  impact: string;
};

type LpProofSectionProps = {
  initialIndustry: ProofIndustry;
  impactCards: ImpactCard[];
  beforeAfterRows: BeforeAfterRow[];
  hotelVoices: HotelVoice[];
  proofMethodNotes: string[];
};

const INDUSTRY_LABELS: Record<ProofIndustry, string> = {
  business: "ビジネス",
  resort: "リゾート",
  spa: "温浴・スパ",
};

export default function LpProofSection({
  initialIndustry,
  impactCards,
  beforeAfterRows,
  hotelVoices,
  proofMethodNotes,
}: LpProofSectionProps) {
  const [activeIndustry, setActiveIndustry] = useState<ProofIndustry>(initialIndustry);

  const filteredRows = useMemo(
    () => beforeAfterRows.filter((row) => row.industryTag === activeIndustry),
    [activeIndustry, beforeAfterRows],
  );
  const filteredVoices = useMemo(
    () => hotelVoices.filter((voice) => voice.industryTag === activeIndustry),
    [activeIndustry, hotelVoices],
  );

  return (
    <section id="proof" className="lux-card lp-reveal lp-delay-2 rounded-3xl p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">実績と信頼性</h2>
          <p className="text-sm text-slate-600">導入ヒアリングで得た運用変化のサンプル</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["business", "resort", "spa"] as const).map((industry) => (
            <button
              key={industry}
              type="button"
              onClick={() => setActiveIndustry(industry)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                activeIndustry === industry
                  ? "border-emerald-500 bg-emerald-600 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {INDUSTRY_LABELS[industry]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {impactCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2">
            <p className="text-[11px] text-emerald-800">{card.label}</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-600">現在表示中: {INDUSTRY_LABELS[activeIndustry]} の実績</p>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid grid-cols-1 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 md:grid-cols-[1.1fr_1.2fr_1.2fr_0.9fr]">
          <p className="px-3 py-2">シーン</p>
          <p className="px-3 py-2">導入前</p>
          <p className="px-3 py-2">導入後</p>
          <p className="px-3 py-2">実感値</p>
        </div>
        {filteredRows.map((row, index) => (
          <div
            key={row.scene}
            className={`grid grid-cols-1 text-xs md:grid-cols-[1.1fr_1.2fr_1.2fr_0.9fr] ${index < filteredRows.length - 1 ? "border-b border-slate-200" : ""}`}
          >
            <p className="px-3 py-2 font-medium text-slate-900">{row.scene}</p>
            <p className="px-3 py-2 text-slate-700">{row.before}</p>
            <p className="px-3 py-2 text-emerald-700">{row.after}</p>
            <p className="px-3 py-2 font-semibold text-slate-900">{row.impact}</p>
          </div>
        ))}
        {filteredRows.length === 0 && (
          <p className="px-3 py-4 text-xs text-slate-500">この業態の比較データは準備中です。</p>
        )}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {filteredVoices.map((voice, index) => (
          <article
            key={voice.hotel}
            className="lp-reveal rounded-2xl border border-slate-200 bg-white p-4"
            style={{ transitionDelay: `${160 + index * 80}ms` }}
          >
            <div className="flex items-center gap-2">
              <VoiceLogo logoSrc={voice.logoSrc} hotel={voice.hotel} brandMark={voice.brandMark} brandTone={voice.brandTone} />
              <p className="text-xs font-semibold text-emerald-700">{voice.hotel}</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-800">「{voice.comment}」</p>
            <p className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-800">
              {voice.impact}
            </p>
          </article>
        ))}
        {filteredVoices.length === 0 && (
          <article className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600 md:col-span-3">
            この業態の導入コメントは現在追加中です。
          </article>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <p className="font-semibold text-slate-700">算出条件（公開ページ上の目安表示）</p>
        <ul className="mt-1 space-y-1">
          {proofMethodNotes.map((line) => (
            <li key={line}>・{line}</li>
          ))}
        </ul>
        <p>※ 数値は導入施設ヒアリングに基づく目安です。運用体制・更新頻度により変動します。</p>
        <p className="mt-1">
          法務・運営情報: <Link className="underline" href="/terms">利用規約</Link> / <Link className="underline" href="/privacy">プライバシーポリシー</Link> / <Link className="underline" href="/commerce">特定商取引法に基づく表記</Link>
        </p>
      </div>
    </section>
  );
}
