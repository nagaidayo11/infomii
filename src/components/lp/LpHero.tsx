"use client";

import { motion } from "framer-motion";
import { Button, Container } from "@/components/ui";
import { FadeIn } from "@/components/motion";

function HeroVisuals() {
  return (
    <motion.div
      className="relative mx-auto grid w-fit grid-cols-2 items-center justify-items-center gap-4 sm:gap-6 lg:gap-8"
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
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="h-2 w-2 rounded-full bg-slate-300" />
          </div>
          <span className="ml-3 text-[10px] font-medium text-slate-400">
            ページエディタ
          </span>
        </div>
        <div className="p-2">
          <div className="h-[170px] rounded-lg border border-slate-100 bg-white p-3">
            <p className="text-[10px] font-semibold text-slate-400">ご案内ページ（編集側）</p>
            <div className="mt-2 h-2.5 w-2/3 rounded bg-slate-200" />
            <div className="mt-1 h-2 w-full rounded bg-slate-100" />
            <div className="mt-1 h-2 w-4/5 rounded bg-slate-100" />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-md bg-emerald-50 p-2 ring-1 ring-emerald-100">
                <p className="text-[10px] font-semibold text-emerald-800">WiFi</p>
                <p className="mt-0.5 text-[9px] text-emerald-700">Guest / welcome2026</p>
              </div>
              <div className="rounded-md bg-slate-50 p-2 ring-1 ring-slate-200">
                <p className="text-[10px] font-semibold text-slate-800">朝食</p>
                <p className="mt-0.5 text-[9px] text-slate-600">6:30-9:30 / 1F</p>
              </div>
            </div>
            <div className="mt-2 h-7 w-full rounded-lg bg-slate-900/90" />
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
        <div className="mt-6 min-h-[200px] bg-[#fafaf9] p-1.5">
          <div className="h-[200px] rounded-[0.8rem] border border-slate-200 bg-white p-2.5">
            <p className="text-[9px] font-semibold text-slate-500">ゲストのスマホ表示</p>
            <p className="mt-1 text-[9px] font-semibold text-slate-800">Infomii Hotel</p>
            <p className="text-[8px] text-slate-500">チェックイン後のご案内</p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <div className="rounded-md bg-emerald-50 p-1.5 ring-1 ring-emerald-100">
                <div className="h-2 w-3/4 rounded bg-emerald-200/80" />
                <div className="mt-1 h-1.5 w-full rounded bg-emerald-100" />
              </div>
              <div className="rounded-md bg-slate-50 p-1.5 ring-1 ring-slate-200">
                <div className="h-2 w-3/4 rounded bg-slate-200" />
                <div className="mt-1 h-1.5 w-full rounded bg-slate-100" />
              </div>
            </div>
            <div className="mt-2 rounded-md bg-slate-50 p-1.5 ring-1 ring-slate-200">
              <div className="h-2 w-1/2 rounded bg-slate-200" />
              <div className="mt-1 h-1.5 w-full rounded bg-slate-100" />
            </div>
            <div className="mt-2 h-6 w-full rounded-md bg-slate-900/90" />
          </div>
        </div>
      </motion.div>
      <motion.div
        className="col-span-2 mx-auto flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white shadow-sm sm:h-36 sm:w-36"
        aria-hidden
        whileHover={{ scale: 1.08, rotate: 5, transition: { duration: 0.2 } }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-14 w-14 text-slate-700 sm:h-16 sm:w-16"
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
  /** 登録なしで触れるサンプル（公開ゲストページ） */
  samplePageHref: string;
  /** 登録なしで触れるデモエディタ */
  demoEditorHref?: string;
};

export function LpHero({ ctaHref, samplePageHref, demoEditorHref = "/demo/editor" }: LpHeroProps) {
  return (
    <section className="border-b border-slate-200/80 bg-white">
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
              ビジネスホテル・少人数運営・外国人対応に強い
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              <span className="block text-2xl sm:text-3xl lg:text-4xl">
                フロント対応、まだ口頭でやってますか？
              </span>
              <span className="mt-5 block">
                QRひとつで
                <span className="text-emerald-600">「全部伝わる館内案内」</span>
                を3分で。
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl">
              WiFi・朝食・設備案内を1ページに集約。
              <br className="hidden sm:block" />
              説明・紙・更新の手間をゼロに近づけます。
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Button href={demoEditorHref} size="lg">
                30秒で試す（登録なし）
              </Button>
              <Button href="#live-demo" variant="secondary" size="lg">
                実際の画面を見る
              </Button>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              すぐに作成するなら{" "}
              <a
                href={ctaHref}
                className="font-semibold text-emerald-700 underline decoration-emerald-300/80 underline-offset-2 hover:text-emerald-800"
              >
                無料でページを作成
              </a>
            </p>
          </FadeIn>
        </div>
        <div className="mt-14 lg:mt-16">
          <HeroVisuals />
        </div>
      </Container>
    </section>
  );
}
