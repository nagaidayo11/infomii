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
    <section className="lp-cta-shell relative overflow-hidden bg-slate-900 py-16 sm:py-20">
      <ScrollReveal intensity="subtle">
        <Container size="sm" className="text-center">
          <h2 className={`text-3xl text-white sm:text-4xl ${LP_POP_HEADING_CLASS}`}>
            あなたの情報を、もっと見やすく。
          </h2>
          <p className="mx-auto mt-4 max-w-md text-lg font-medium leading-relaxed text-slate-300">
            旅行のしおりも、推し活の予定も、イベントの案内も。まずは無料で、1ページ作ってみてください。
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href={ctaHref} variant="inverted" size="lg" className="min-h-[48px] px-8">
              無料ではじめる
            </Button>
            <Button
              href={demoEditorHref}
              variant="secondary"
              size="lg"
              className="min-h-[48px] border-slate-600 bg-transparent !text-white hover:bg-white/10 hover:!text-white"
            >
              デモを触る
            </Button>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            クレジットカード不要 ·{" "}
            <Link href={loginHref} className="font-medium text-white underline hover:no-underline">
              ログイン
            </Link>
          </p>
        </Container>
      </ScrollReveal>
    </section>
  );
}
