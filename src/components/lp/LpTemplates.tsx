"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";
import { ScrollReveal, StaggerReveal } from "@/components/motion";
import { LP_STARTER_TEMPLATES } from "@/lib/lp/data";
import {
  LP_POP_SECTION_TITLE_CLASS,
  LP_SECTION_DESCRIPTION_CLASS,
  LP_SECTION_KICKER_CLASS,
} from "@/lib/lp/typography";

type LpTemplatesProps = {
  ctaHref: string;
  demoHref?: string;
};

export function LpTemplates({ ctaHref, demoHref = "/lp/saas?focus=templates" }: LpTemplatesProps) {
  return (
    <section id="templates" className="border-b border-emerald-100/60 bg-[#F2FBF7] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal intensity="subtle">
          <p className={LP_SECTION_KICKER_CLASS}>テンプレ</p>
          <h2 className={LP_POP_SECTION_TITLE_CLASS}>すぐ使えるテンプレート</h2>
          <p className={LP_SECTION_DESCRIPTION_CLASS}>
            白紙からではなく、用途に合った土台から始められます。
          </p>
        </ScrollReveal>

        <StaggerReveal className="mt-10 grid gap-4 lg:grid-cols-3" staggerDelay={0.08}>
          {LP_STARTER_TEMPLATES.map((tpl) => (
            <article
              key={tpl.id}
              className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b ${tpl.accent} p-6 shadow-[0_1px_4px_rgba(15,23,42,0.04)]`}
            >
              {tpl.badge ? (
                <span className="absolute right-4 top-4 z-10 rounded-full border border-slate-200/80 bg-white/90 px-2.5 py-0.5 text-[10px] font-medium text-slate-600">
                  {tpl.badge}
                </span>
              ) : null}
              <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-xl border border-slate-200/60 bg-white/60">
                <Image
                  src={tpl.imageSrc}
                  alt={tpl.imageAlt}
                  fill
                  unoptimized
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{tpl.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{tpl.description}</p>
              <Link
                href={tpl.href}
                className="mt-4 inline-flex text-sm font-semibold text-emerald-700 underline decoration-emerald-200 underline-offset-2 hover:decoration-emerald-400"
              >
                このテンプレで始める →
              </Link>
              {tpl.badge ? (
                <p className="mt-2 text-xs text-slate-500">
                  <Link
                    href="/lp/business"
                    className="font-medium text-emerald-700 underline decoration-emerald-200/80 underline-offset-2 hover:decoration-emerald-400"
                  >
                    宿泊施設向けの詳しい案内はこちら
                  </Link>
                </p>
              ) : null}
            </article>
          ))}
        </StaggerReveal>

        <ScrollReveal intensity="subtle" className="mt-8 flex flex-wrap items-center gap-3">
          <Button
            href={ctaHref}
            size="lg"
            className="min-h-[44px] !border-emerald-700/90 !bg-emerald-600 !text-white hover:!bg-emerald-700"
          >
            無料ではじめる
          </Button>
          <Button href={demoHref} variant="secondary" size="lg" className="min-h-[44px]">
            サンプルを見る
          </Button>
        </ScrollReveal>
      </div>
    </section>
  );
}
