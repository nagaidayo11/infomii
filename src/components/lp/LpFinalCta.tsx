"use client";

import Link from "next/link";
import { Button, Container } from "@/components/ui";
import { ScrollReveal } from "@/components/motion";
import { LP_POP_HEADING_CLASS } from "@/lib/lp/typography";

type LpFinalCtaProps = {
  ctaHref: string;
  demoEditorHref: string;
  loginHref: string;
};

export function LpFinalCta({ ctaHref, demoEditorHref, loginHref }: LpFinalCtaProps) {
  return (
    <section className="border-t border-emerald-100/80 bg-gradient-to-b from-[#F2FBF7] to-white py-20 sm:py-24">
      <ScrollReveal intensity="subtle">
        <Container size="sm" className="text-center">
          <h2 className={`text-3xl sm:text-4xl ${LP_POP_HEADING_CLASS}`}>あなたの情報を、もっと見やすく。</h2>
          <p className="mx-auto mt-4 max-w-md text-lg font-medium leading-relaxed text-slate-600">
            旅行のしおりも、推し活の予定も、ホテル案内も。まずは無料で、1ページ作ってみてください。
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              href={ctaHref}
              size="lg"
              className="min-h-[48px] !border-emerald-700/90 !bg-emerald-600 px-8 !text-white hover:!bg-emerald-700"
            >
              無料ではじめる
            </Button>
            <Button href={demoEditorHref} variant="secondary" size="lg" className="min-h-[48px]">
              デモを触る
            </Button>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            クレジットカード不要 ·{" "}
            <Link href={loginHref} className="font-medium text-emerald-700 underline decoration-emerald-200 underline-offset-2">
              ログイン
            </Link>
          </p>
        </Container>
      </ScrollReveal>
    </section>
  );
}
