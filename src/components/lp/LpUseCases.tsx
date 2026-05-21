"use client";

import Image from "next/image";
import { Card } from "@/components/ui";
import { ScrollReveal, StaggerReveal } from "@/components/motion";
import { LP_USE_CASES } from "@/lib/lp/data";
import {
  LP_POP_SECTION_TITLE_CLASS,
  LP_SECTION_DESCRIPTION_CLASS,
  LP_SECTION_KICKER_CLASS,
} from "@/lib/lp/typography";

export function LpUseCases() {
  return (
    <section id="use-cases" className="border-b border-emerald-100/60 bg-[#FAFFFC] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal intensity="subtle">
          <p className={LP_SECTION_KICKER_CLASS}>用途</p>
          <h2 className={LP_POP_SECTION_TITLE_CLASS}>使い方は、ひとつじゃない。</h2>
          <p className={LP_SECTION_DESCRIPTION_CLASS}>
            旅行のしおりから、ホテル案内、推し活の予定まで。必要な情報だけを、美しく届けます。
          </p>
        </ScrollReveal>

        <StaggerReveal className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" staggerDelay={0.05}>
          {LP_USE_CASES.map((item) => (
            <Card
              key={item.title}
              padding="none"
              className="group overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] ring-1 ring-slate-100/60 transition duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-emerald-200/50 motion-safe:hover:shadow-[0_4px_12px_rgba(16,185,129,0.06)]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                <Image
                  src={item.bannerSrc}
                  alt={item.bannerAlt}
                  fill
                  unoptimized
                  className="object-cover object-center transition duration-300 motion-safe:group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent"
                  aria-hidden
                />
              </div>
              <div className="px-4 py-3.5 sm:px-4 sm:py-4">
                <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </div>
            </Card>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
