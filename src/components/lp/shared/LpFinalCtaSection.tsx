"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Button, Container } from "@/components/ui";
import { ScrollReveal, StaggerReveal } from "@/components/motion";

type LpFinalCtaSectionProps = {
  ctaHref: string;
  loginHref: string;
  demoEditorHref: string;
  title: string;
  description: ReactNode;
  trustPoints: readonly string[];
};

export function LpFinalCtaSection({
  ctaHref,
  loginHref,
  demoEditorHref,
  title,
  description,
  trustPoints,
}: LpFinalCtaSectionProps) {
  return (
    <section
      id="final-cta"
      className="relative isolate overflow-hidden border-t border-emerald-900/10 bg-[linear-gradient(145deg,#064e3b_0%,#0f172a_55%,#065f46_100%)] py-16 sm:py-20"
    >
      <div
        className="lp-glow-pulse pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl"
        aria-hidden
      />
      <div
        className="lp-glow-pulse pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-teal-300/15 blur-3xl"
        style={{ animationDelay: "0.8s" }}
        aria-hidden
      />
      <ScrollReveal intensity="subtle">
        <Container size="sm" className="relative text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/90">はじめ方</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-emerald-50/85">{description}</p>
          <StaggerReveal className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm font-medium" staggerDelay={0.06}>
            {trustPoints.map((point) => (
              <span
                key={point}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-emerald-50 backdrop-blur-sm"
              >
                {point}
              </span>
            ))}
          </StaggerReveal>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button
              href={ctaHref}
              size="lg"
              className="lp-cta-attention min-h-[52px] px-8 !text-base !border-emerald-300 !bg-emerald-500 !text-white hover:!bg-emerald-400"
            >
              無料ではじめる
            </Button>
            <Button
              href={demoEditorHref}
              variant="secondary"
              size="lg"
              className="min-h-[52px] border-white/25 bg-white/10 !text-base !text-white hover:bg-white/20"
            >
              登録なしで触る（30秒デモ）
            </Button>
          </div>
          <p className="mt-4 text-sm text-emerald-100/70">
            すでにアカウントをお持ちの方は{" "}
            <Link href={loginHref} className="font-medium text-emerald-200 underline hover:no-underline">
              ログイン
            </Link>
          </p>
        </Container>
      </ScrollReveal>
    </section>
  );
}
