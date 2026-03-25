"use client";

import { motion } from "framer-motion";
import { Button, Container } from "@/components/ui";
import { FadeIn } from "@/components/motion";

function HeroVisuals() {
  return (
    <motion.div
      className="relative mx-auto grid w-full max-w-[1480px] grid-cols-1 items-center gap-10 sm:gap-12 lg:grid-cols-[minmax(0,2.15fr)_minmax(280px,1fr)] lg:gap-10 xl:gap-14"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Left: large editor visual */}
      <div className="flex min-w-0 flex-col items-center gap-3">
        <motion.div
          className="w-full overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
          whileHover={{
            scale: 1.01,
            boxShadow: "0 12px 40px rgba(0,0,0,0.1)",
            transition: { duration: 0.2 },
          }}
        >
          <img
            src="/lp-editor-screenshot.png"
            alt="ページエディタ画面"
            className="block h-auto w-full object-cover object-top"
            loading="eager"
          />
        </motion.div>
        <p className="text-center text-sm font-semibold text-slate-700">ページエディタ</p>
      </div>

      {/* Right: guest phone + QR */}
      <div className="flex w-full flex-col items-center gap-6 lg:gap-8">
        <div className="flex w-full flex-col items-center gap-2">
          <motion.div
            className="relative mx-auto aspect-[9/18] w-[min(330px,100%)] overflow-hidden rounded-[1.9rem] shadow-md ring-1 ring-slate-200/80 sm:w-[min(360px,100%)] lg:w-[min(100%,360px)]"
            whileHover={{
              scale: 1.03,
              rotate: -1.5,
              transition: { duration: 0.2 },
            }}
          >
            <img
              src="/lp-guest-phone-screenshot.png"
              alt="ゲストのスマホ画面"
              className="h-full w-full object-cover object-[center_45%]"
              loading="eager"
            />
          </motion.div>
          <p className="text-center text-sm font-semibold text-slate-700">ゲストのスマホ画面</p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <motion.div
            className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white p-2 shadow-md sm:h-24 sm:w-24"
            whileHover={{ scale: 1.08, rotate: 5, transition: { duration: 0.2 } }}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[70%] w-[70%] shrink-0 text-slate-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <path d="M14 14h1v4h4v-4" />
              <path d="M14 17h4" />
            </svg>
          </motion.div>
          <p className="text-center text-sm font-semibold text-slate-700">QRコード</p>
        </div>
      </div>
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
    <section className="border-b border-slate-200/80 bg-white overflow-x-hidden">
      {/* コピー・CTAは従来どおりコンテナ幅 */}
      <Container className="pt-16 sm:pt-20 lg:pt-24">
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
      </Container>

      {/* ビジュアル：フルブリード背景の上に幅90%で配置 */}
      <div
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] pb-16 pt-10 sm:pb-20 sm:pt-12 lg:pb-24 lg:pt-14"
        aria-label="プロダクト画面の例"
      >
        <div className="mx-auto w-[90%] max-w-[100%] px-4 sm:px-6">
          <HeroVisuals />
        </div>
      </div>
    </section>
  );
}
