"use client";

import { ScrollReveal, StaggerReveal } from "@/components/motion";
import { LP_FEATURES } from "@/lib/lp/data";
import {
  LP_POP_SECTION_TITLE_CLASS,
  LP_SECTION_DESCRIPTION_CLASS,
  LP_SECTION_KICKER_CLASS,
} from "@/lib/lp/typography";

export function LpFeatures() {
  return (
    <section id="features" className="border-b border-slate-200/60 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal intensity="subtle">
          <p className={LP_SECTION_KICKER_CLASS}>機能</p>
          <h2 className={LP_POP_SECTION_TITLE_CLASS}>必要な情報だけを、わかりやすく。</h2>
          <p className={LP_SECTION_DESCRIPTION_CLASS}>
            機能の羅列ではなく、伝えたい場面に合わせて使える設計です。
          </p>
        </ScrollReveal>

        <StaggerReveal className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.06}>
          {LP_FEATURES.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white to-slate-50/40 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
            >
              <p className="text-xs font-medium text-emerald-700/90">{item.scene}</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
            </article>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
