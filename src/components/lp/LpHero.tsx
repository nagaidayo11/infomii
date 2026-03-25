"use client";

import { motion } from "framer-motion";
import { Button, Container } from "@/components/ui";
import { FadeIn } from "@/components/motion";

function HeroVisuals() {
  return (
    <motion.div
      className="relative mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-8 sm:gap-10 lg:flex-row lg:items-center lg:justify-center lg:gap-8 xl:gap-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="order-1 w-full max-w-[340px] shrink-0 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] lg:max-w-[520px] xl:max-w-[600px]"
        aria-hidden
        whileHover={{
          scale: 1.02,
          boxShadow: "0 12px 40px rgba(0,0,0,0.1)",
          transition: { duration: 0.2 },
        }}
      >
        <img
          src="/lp-editor-screenshot.png"
          alt="ページエディタ画面"
          className="block h-auto w-full object-cover"
          loading="eager"
        />
      </motion.div>
      <motion.div
        className="order-2 w-[170px] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-md sm:w-[190px] lg:order-2 lg:w-[210px]"
        aria-hidden
        whileHover={{
          scale: 1.03,
          rotate: -1.5,
          transition: { duration: 0.2 },
        }}
      >
        <img
          src="/lp-guest-phone-screenshot.png"
          alt="ゲストのスマホ表示"
          className="block h-auto w-full rounded-[0.85rem] object-cover"
          loading="eager"
        />
      </motion.div>
      <motion.div
        className="order-3 relative flex h-24 w-24 shrink-0 items-center justify-center self-center rounded-2xl border-2 border-slate-200 bg-white shadow-md sm:h-28 sm:w-28 lg:order-3 lg:h-32 lg:w-32 xl:h-32 xl:w-32"
        aria-hidden
        whileHover={{ scale: 1.08, rotate: 5, transition: { duration: 0.2 } }}
      >
        <svg
          viewBox="0 0 24 24"
          className="absolute inset-0 m-auto h-[58%] w-[58%] text-slate-700"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <path d="M14 14h1v4h4v-4" />
          <path d="M14 17h4" />
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
