"use client";

import { motion } from "framer-motion";
import { Button, Container } from "@/components/ui";
import { FadeIn } from "@/components/motion";

function HeroVisuals() {
  return (
    <motion.div
      className="relative flex flex-wrap items-end justify-center gap-4 sm:gap-6 lg:gap-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="w-full max-w-[280px] overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] lg:max-w-[320px]"
        aria-hidden
        whileHover={{
          scale: 1.02,
          boxShadow: "0 12px 40px rgba(0,0,0,0.1)",
          transition: { duration: 0.2 },
        }}
      >
        <div className="flex border-b border-slate-100 px-3 py-2">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="h-2 w-2 rounded-full bg-slate-300" />
          </div>
          <span className="ml-3 text-[10px] font-medium text-slate-400">
            ページエディタ
          </span>
        </div>
        <div className="flex gap-0 p-2">
          <div className="w-8 shrink-0 rounded-l-lg bg-slate-50 py-2" />
          <div className="min-h-[140px] flex-1 space-y-2 rounded-r-lg border border-slate-100 bg-white p-3">
            <div className="h-4 w-3/4 rounded bg-slate-100" />
            <div className="h-3 w-full rounded bg-slate-50" />
            <div className="h-3 w-5/6 rounded bg-slate-50" />
            <div className="mt-3 h-8 w-full rounded-lg bg-ds-primary/10" />
          </div>
        </div>
      </motion.div>
      <motion.div
        className="relative w-[160px] shrink-0 overflow-hidden rounded-[1.25rem] border-[6px] border-slate-800 bg-slate-800 shadow-xl sm:w-[180px]"
        aria-hidden
        whileHover={{
          scale: 1.03,
          rotate: -2,
          transition: { duration: 0.2 },
        }}
      >
        <div className="absolute left-1/2 top-2 h-5 w-14 -translate-x-1/2 rounded-full bg-slate-900" />
        <div className="mt-6 min-h-[200px] bg-[#fafaf9] p-3">
          <div className="mb-2 h-2.5 w-16 rounded bg-slate-200" />
          <div className="h-3 w-full rounded bg-slate-100" />
          <div className="mt-2 h-3 w-4/5 rounded bg-slate-100" />
          <div className="mt-4 h-9 w-full rounded-xl bg-ds-primary/20" />
        </div>
      </motion.div>
      <motion.div
        className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-white shadow-sm sm:h-28 sm:w-28"
        aria-hidden
        whileHover={{ scale: 1.08, rotate: 5, transition: { duration: 0.2 } }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-12 w-12 text-slate-700 sm:h-14 sm:w-14"
          fill="currentColor"
        >
          <rect x="2" y="2" width="5" height="5" />
          <rect x="11" y="2" width="5" height="5" />
          <rect x="2" y="11" width="5" height="5" />
          <rect x="8" y="8" width="2" height="2" />
          <rect x="14" y="8" width="2" height="2" />
          <rect x="8" y="14" width="2" height="2" />
          <rect x="11" y="11" width="5" height="5" />
          <rect x="14" y="14" width="2" height="2" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

type LpHeroProps = {
  ctaHref: string;
};

export function LpHero({ ctaHref }: LpHeroProps) {
  return (
    <section className="border-b border-slate-200/80 bg-white">
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <FadeIn>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              ホテル案内ページを3分で作成
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl">
              WiFi・朝食・施設案内を、1枚のQRページでゲストに共有。
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button href={ctaHref} size="lg">
                無料でページを作成
              </Button>
              <Button href="#live-demo" variant="secondary" size="lg">
                デモを見る
              </Button>
            </div>
          </FadeIn>
        </div>
        <div className="mt-14 lg:mt-16">
          <HeroVisuals />
        </div>
      </Container>
    </section>
  );
}
