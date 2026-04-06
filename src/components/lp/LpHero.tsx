"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button, Container } from "@/components/ui";
import { FadeIn } from "@/components/motion";

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h12" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function IconQr({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
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
  );
}

function EditorPreviewFrame({ src }: { src: string }) {
  return (
    <div className="relative h-[440px] w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_44px_rgba(15,23,42,0.12)] lg:h-[520px] xl:h-[560px]">
      <div className="flex items-center justify-between border-b border-slate-200/70 bg-slate-50/70 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          <span className="h-2 w-2 rounded-full bg-slate-300" />
        </div>
        <p className="text-[11px] font-medium text-slate-500">デモエディタ（実画面）</p>
      </div>
      <div className="relative h-[calc(100%-43px)] overflow-hidden bg-white">
        {/* Keep desktop editor layout even inside narrower LP frame */}
        <div className="absolute left-1/2 top-0 h-[980px] w-[1400px] -translate-x-1/2 origin-top scale-[0.36] sm:scale-[0.41] lg:scale-[0.45] xl:scale-[0.49]">
          <iframe
            src={src}
            title="Infomii demo editor preview"
            className="h-full w-full border-0 bg-white"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

function GuestPhoneFrame({ src }: { src: string }) {
  return (
    <div className="relative mx-auto aspect-[9/18] w-[min(330px,100%)] overflow-hidden rounded-[2rem] border border-slate-300/70 bg-[#dbe3ed] p-[10px] shadow-[0_18px_42px_rgba(15,23,42,0.2)] sm:w-[min(360px,100%)] lg:h-[520px] lg:w-[375px] lg:max-w-full lg:aspect-auto xl:h-[560px]">
      <div className="absolute left-1/2 top-[12px] z-10 h-1.5 w-14 -translate-x-1/2 rounded-full bg-slate-300/90" />
      <div className="relative h-full w-full overflow-hidden rounded-[1.65rem] bg-white p-0 pt-2.5 shadow-inner ring-1 ring-slate-200/70">
        <div
          className="absolute inset-0 overflow-hidden rounded-[1.5rem]"
          style={{
            clipPath: "inset(0 round 1.5rem)",
            WebkitMaskImage: "-webkit-radial-gradient(white, black)",
          }}
        >
          <iframe
            src={src}
            title="Infomii guest page preview"
            className="absolute inset-x-0 top-[10px] h-[calc(100%-10px)] w-full rounded-[1.5rem] border-0 bg-white"
            loading="lazy"
            scrolling="yes"
          />
        </div>
      </div>
    </div>
  );
}

function HeroVisuals({ demoEditorHref, samplePageHref }: { demoEditorHref: string; samplePageHref: string }) {
  const reduceMotion = useReducedMotion();
  const hoverLift = reduceMotion
    ? undefined
    : {
      scale: 1.02,
      boxShadow: "0 20px 52px rgba(15,23,42,0.16)",
      transition: { duration: 0.2 },
    };
  const hoverQr = reduceMotion ? undefined : { scale: 1.05, transition: { duration: 0.2 } };
  const hoverPhone = reduceMotion
    ? undefined
    : { scale: 1.02, transition: { duration: 0.2 } };

  return (
    <motion.div
      className="relative mx-auto grid w-full max-w-[1540px] grid-cols-1 items-center gap-10 sm:gap-12 lg:items-stretch lg:grid-cols-[minmax(0,1.2fr)_20px_minmax(0,0.18fr)_20px_360px] lg:gap-5 xl:gap-6"
      initial={false}
    >
      {/* Left: large editor visual */}
      <motion.div
        className="flex min-w-0 flex-col items-center gap-3 lg:h-full"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
      >
        <motion.div
          className="w-full"
          whileHover={hoverLift}
        >
          <EditorPreviewFrame src={demoEditorHref} />
        </motion.div>
        <p className="text-center text-sm font-semibold text-slate-700">ページエディタ</p>
      </motion.div>

      {/* Arrow (editor -> QR) */}
      <motion.div
        className="hidden lg:flex items-center justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
      >
        <motion.span
          animate={reduceMotion ? undefined : { x: [0, 4, 0] }}
          transition={reduceMotion ? undefined : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <IconArrowRight className="h-10 w-10 text-slate-300" />
        </motion.span>
      </motion.div>

      {/* Middle: QR */}
      <motion.div
        className="flex min-w-0 flex-col items-center justify-center gap-3 lg:h-full lg:justify-self-center"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.35 }}
      >
        <motion.div
          className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white p-2 shadow-md sm:h-24 sm:w-24"
          whileHover={hoverQr}
        >
          <IconQr className="h-[70%] w-[70%] shrink-0 text-slate-700" />
        </motion.div>
        <p className="text-center text-sm font-semibold text-slate-700">QRコード</p>
      </motion.div>

      {/* Arrow (QR -> guest) */}
      <motion.div
        className="hidden lg:flex items-center justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.55 }}
      >
        <motion.span
          animate={reduceMotion ? undefined : { x: [0, 4, 0] }}
          transition={reduceMotion ? undefined : { duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        >
          <IconArrowRight className="h-10 w-10 text-slate-300" />
        </motion.span>
      </motion.div>

      {/* Right: guest phone */}
      <motion.div
        className="flex min-w-0 flex-col items-center gap-3 lg:h-full"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.75 }}
      >
        <motion.div
          className="w-full"
          whileHover={hoverPhone}
        >
          <GuestPhoneFrame src={samplePageHref} />
        </motion.div>
        <p className="text-center text-sm font-semibold text-slate-700">ゲストのスマホ画面</p>
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
  const lpEditorPreviewHref = demoEditorHref.includes("?")
    ? `${demoEditorHref}&lp=1`
    : `${demoEditorHref}?lp=1`;

  return (
    <section className="border-b border-ds-border/80 bg-ds-card overflow-x-hidden">
      {/* コピー・CTAは従来どおりコンテナ幅 */}
      <Container className="pt-16 sm:pt-20 lg:pt-24">
        <div className="mx-auto max-w-5xl text-center">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-wider text-ds-accent-strong">
              ビジネスホテル・少人数運営・外国人対応に強い
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-ds-foreground sm:text-4xl lg:text-5xl">
              <span className="block text-2xl sm:text-3xl lg:text-4xl">
                フロント対応、まだ口頭でやってますか？
              </span>
              <span className="mt-5 block">
                QRひとつで
                <span className="text-ds-accent">「全部伝わる館内案内」</span>
                を3分で。
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ds-muted-fg sm:text-xl">
              WiFi・朝食・設備案内を1ページに集約。
              <br className="hidden sm:block" />
              説明・紙・更新の手間をゼロに近づけます。
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Button
                href={demoEditorHref}
                size="lg"
                className="!border-ds-accent/30 !bg-ds-accent hover:!bg-ds-accent-strong hover:!shadow-[0_2px_8px_rgba(5,150,105,0.22)]"
              >
                30秒で試す（登録なし）
              </Button>
              <Button href="#live-demo" variant="secondary" size="lg">
                実際の画面を見る
              </Button>
            </div>
            <p className="mt-4 text-sm text-ds-muted">
              すぐに作成するなら{" "}
              <a
                href={ctaHref}
                className="font-semibold text-ds-accent-strong underline decoration-ds-accent/35 underline-offset-2 hover:text-ds-accent-fg"
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
          <HeroVisuals demoEditorHref={lpEditorPreviewHref} samplePageHref={samplePageHref} />
          <p className="mt-3 text-center text-xs text-ds-muted">※デモ環境の実画面を表示しています</p>
        </div>
      </div>
    </section>
  );
}
