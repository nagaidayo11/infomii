"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/motion";
import { LP_SOCIAL_PROOF } from "@/lib/lp/data";
import {
  LP_POP_SECTION_TITLE_CLASS,
  LP_SECTION_KICKER_CLASS,
} from "@/lib/lp/typography";

export function LpSocialProof() {
  return (
    <section id="social-proof" className="border-b border-slate-200/60 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal intensity="subtle">
          <p className={LP_SECTION_KICKER_CLASS}>導入例</p>
          <h2 className={`${LP_POP_SECTION_TITLE_CLASS} text-2xl sm:text-3xl`}>
            実際に宿泊施設でも使われています
          </h2>
          <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
            個人の情報整理にも使えます。ホテル・旅館では、館内案内の運用例もあります。
          </p>
        </ScrollReveal>

        <ul className="mt-8 grid gap-3 sm:grid-cols-3">
          {LP_SOCIAL_PROOF.map((item) => (
            <li
              key={item.label}
              className="rounded-2xl border border-slate-200/70 bg-slate-50/40 px-5 py-4 text-sm"
            >
              <p className="font-medium text-slate-800">{item.label}</p>
              <p className="mt-1 text-slate-600">{item.detail}</p>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-sm text-slate-500">
          <Link
            href="/lp/business"
            className="font-medium text-emerald-700 underline decoration-emerald-200 underline-offset-2 hover:decoration-emerald-400"
          >
            宿泊施設向けの詳しい導入事例
          </Link>
          を見る
        </p>
      </div>
    </section>
  );
}
