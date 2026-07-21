"use client";

import { Section } from "@/components/ui";
import {
  FancyStagger,
  ScrollProgressLine,
  StickyBeforeAfter,
  TiltCard,
} from "@/components/lp/hotel/LpHotelMotion";
import { ScrollReveal, StaggerReveal } from "@/components/motion";

type Item = { title: string; body: string };
type Step = { step: string; title: string; desc: string };
type Row = { before: string; after: string };

export function LpHotelTrustMarquee({ points }: { points: readonly string[] }) {
  return (
    <div className="border-b border-emerald-100/80 bg-gradient-to-r from-emerald-50/90 via-white to-teal-50/70 py-5">
      <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-0.5 px-4 text-sm font-medium text-slate-700 sm:gap-x-10">
        {points.map((point) => (
          <li key={point} className="inline-flex items-center gap-2 py-1">
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200/80"
              aria-hidden
            >
              ✓
            </span>
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LpHotelValueMotion({
  items,
  kicker = "現場のあるあるを、そのまま軽くする",
  title = "ホテルのインフォメーションを、スマホで回す",
  description = "上の画面のような案内ページを作ると、フロントの繰り返し説明と紙の差し替えが減ります。",
}: {
  items: readonly Item[];
  kicker?: string;
  title?: string;
  description?: string;
}) {
  return (
    <Section
      id="operations"
      kicker={kicker}
      title={title}
      description={description}
      variant="white"
      popTitle
    >
      <ScrollProgressLine className="mb-10" />
      <FancyStagger className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3" itemClassName="h-full">
        {items.map((item, index) => (
          <TiltCard
            key={item.title}
            className="group flex h-full flex-col rounded-2xl border border-emerald-100/80 bg-white p-5 shadow-sm ring-1 ring-slate-100/60 sm:p-6"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100 transition duration-300 group-hover:scale-110 group-hover:bg-emerald-100">
              {String(index + 1).padStart(2, "0")}
            </div>
            <h3 className="text-base font-semibold text-emerald-900">{item.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{item.body}</p>
          </TiltCard>
        ))}
      </FancyStagger>
    </Section>
  );
}

export function LpHotelWorkflowMotion({
  steps,
  kicker = "はじめかた",
  title = "3ステップで、客室に置ける案内になる",
  description = "専門知識は不要です。テンプレから始めて、今日聞かれやすい項目だけ整えれば公開できます。",
}: {
  steps: readonly Step[];
  kicker?: string;
  title?: string;
  description?: string;
}) {
  return (
    <Section
      id="how-it-works"
      kicker={kicker}
      title={title}
      description={description}
      variant="muted"
      popTitle
    >
      <ScrollReveal intensity="strong">
        <div className="relative">
          <ScrollProgressLine className="mb-10 hidden sm:block" />
          <FancyStagger className="grid gap-8 sm:grid-cols-3">
            {steps.map((item) => (
              <TiltCard
                key={item.step}
                className="relative rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-100/80"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-base font-bold text-white shadow-[0_10px_24px_rgba(16,185,129,0.3)]">
                  {item.step}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
              </TiltCard>
            ))}
          </FancyStagger>
        </div>
      </ScrollReveal>
    </Section>
  );
}

export function LpHotelBeforeAfterMotion({
  rows,
  kicker = "Before / After",
  title = "紙の館内案内から、スマホの運用へ",
  description = "機能の多さより、毎日の案内がどう変わるかを重視しています。",
}: {
  rows: readonly Row[];
  kicker?: string;
  title?: string;
  description?: string;
}) {
  return (
    <Section
      id="before-after"
      kicker={kicker}
      title={title}
      description={description}
      variant="muted"
      popTitle
    >
      <StickyBeforeAfter rows={rows} />
    </Section>
  );
}

export function LpHotelScenesMarquee({
  scenes,
  bullets,
  kicker = "こんな施設で",
  title = "シティホテルから、小規模宿まで",
  description = "大規模システム入れ替えではなく、まず1ページのインフォメーションから始められます。",
}: {
  scenes: readonly string[];
  bullets: readonly string[];
  kicker?: string;
  title?: string;
  description?: string;
}) {
  return (
    <Section
      id="properties"
      kicker={kicker}
      title={title}
      description={description}
      variant="white"
      popTitle
    >
      <StaggerReveal
        className="mb-10 flex flex-wrap justify-center gap-2.5 sm:gap-3"
        staggerDelay={0.05}
      >
        {scenes.map((scene) => (
          <span
            key={scene}
            className="inline-flex min-h-[44px] items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-100"
          >
            {scene}
          </span>
        ))}
      </StaggerReveal>
      <FancyStagger className="mx-auto grid max-w-3xl gap-3 text-sm text-slate-600 sm:grid-cols-2">
        {bullets.map((line) => (
          <div
            key={line}
            className="flex items-start gap-2 rounded-xl bg-white/90 px-3 py-2.5 ring-1 ring-slate-100"
          >
            <span className="mt-0.5 text-emerald-500" aria-hidden>
              ◆
            </span>
            <span>{line}</span>
          </div>
        ))}
      </FancyStagger>
    </Section>
  );
}
