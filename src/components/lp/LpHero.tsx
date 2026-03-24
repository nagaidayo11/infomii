"use client";

import { motion } from "framer-motion";
import { Button, Container } from "@/components/ui";
import { FadeIn } from "@/components/motion";

function HeroVisuals({ samplePageHref }: { samplePageHref: string }) {
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
          <iframe
            src={samplePageHref}
            title="Infomii sample page desktop preview"
            className="h-[170px] w-full rounded-lg border border-slate-100"
            loading="lazy"
          />
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
          <iframe
            src={samplePageHref}
            title="Infomii sample page mobile preview"
            className="h-[200px] w-full rounded-[0.8rem] border border-slate-200"
            loading="lazy"
          />
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
};

export function LpHero({ ctaHref, samplePageHref }: LpHeroProps) {
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
              <Button href={samplePageHref} size="lg">
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
          <HeroVisuals samplePageHref={samplePageHref} />
        </div>
      </Container>
    </section>
  );
}
