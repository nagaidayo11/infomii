"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui";
import { ClipReveal, WordReveal } from "@/components/lp/hotel/LpHotelMotion";
import { LP_POP_HEADING_CLASS } from "@/lib/lp/typography";

const GUEST_PREVIEW_SRC = "/demo/guest-live?embed=1&fit=device&variant=infomii-hotel";
const HERO_IMAGE_SRC = "/lp/hero/hotel-desk-qr.png";
const HERO_IMAGE_ALT =
  "ホテルフロントのQR案内。紙の館内案内に代わるスマホ向けインフォメーションの現場イメージ";

type LpHeroHotelProps = {
  ctaHref: string;
  samplePageHref?: string;
  demoEditorHref?: string;
  eyebrow?: string;
  headlineLine1?: string;
  headlineLine2?: string;
  h1?: string;
  subline?: string;
  previewSrc?: string;
};

function GuestPhoneMock({ src }: { src: string }) {
  const screenRadius = "1.55rem";

  return (
    <div className="relative mx-auto w-[min(100%,300px)] sm:w-[min(100%,320px)] lg:w-[336px]">
      <div
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] bg-[radial-gradient(circle_at_50%_40%,rgba(45,212,191,0.28),transparent_62%)] blur-2xl"
        aria-hidden
      />
      <div className="relative aspect-[9/19.2] max-h-[min(72svh,640px)] w-full overflow-hidden rounded-[2.4rem] border-[10px] border-[#0b0f14] bg-[#0b0f14] shadow-[0_28px_64px_rgba(15,23,42,0.5),0_0_0_1px_rgba(45,212,191,0.12),inset_0_0_0_1px_rgba(255,255,255,0.06)]">
        <div
          className="pointer-events-none absolute left-1/2 top-2.5 z-30 h-7 w-[108px] -translate-x-1/2 rounded-full bg-black shadow-inner ring-1 ring-white/5"
          aria-hidden
        />
        <div
          className="absolute inset-0 overflow-hidden bg-white"
          style={{
            borderRadius: screenRadius,
            clipPath: `inset(0 round ${screenRadius})`,
          }}
        >
          <iframe
            src={src}
            title="Infomii ゲスト画面プレビュー"
            className="block h-full w-full border-0 bg-white"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Hotel LP hero: photo + copy + phone. Text entrance only — no parallax / float / draw frame.
 */
export function LpHeroHotel({
  ctaHref,
  demoEditorHref = "/demo/editor",
  eyebrow = "ホテル向け 案内運用OS",
  headlineLine1 = "ホテル案内を、",
  headlineLine2 = "現場が自分で回す。",
  h1 = "ホテル案内を、現場が自分で回す。",
  subline = "テンプレで数分公開。QR・多言語・チーム更新まで。",
  previewSrc = GUEST_PREVIEW_SRC,
}: LpHeroHotelProps) {
  const popHeadingClass = LP_POP_HEADING_CLASS;
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate h-[100svh] max-h-[100svh] overflow-hidden border-b border-slate-900/20">
      {/* eslint-disable-next-line @next/next/no-img-element -- static LP hero art */}
      <img
        src={HERO_IMAGE_SRC}
        alt={HERO_IMAGE_ALT}
        width={1536}
        height={1024}
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[62%_center]"
        draggable={false}
      />

      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/93 via-slate-950/60 to-slate-950/20 sm:via-slate-950/54 sm:to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-slate-950/55 to-transparent"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute -left-24 top-1/4 -z-10 h-72 w-72 rounded-full bg-teal-400/22 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-8 -z-10 h-80 w-80 rounded-full bg-emerald-300/16 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex h-full min-h-0 w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(260px,360px)] lg:gap-10 xl:gap-14">
          <div className="max-w-2xl text-white">
            <ClipReveal delay={0.05} duration={0.7}>
              <p className="text-sm font-medium tracking-[0.14em] text-white/75 sm:tracking-[0.18em]">
                {eyebrow}
              </p>
            </ClipReveal>

            <ClipReveal delay={0.12} duration={0.85} className="mt-4">
              <p className="text-5xl font-black tracking-tight sm:text-6xl lg:text-[4.35rem]">
                Infom
                <span className="bg-gradient-to-r from-teal-200 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                  ii
                </span>
              </p>
            </ClipReveal>

            <div className={`mt-5 text-[1.65rem] leading-snug text-white sm:text-3xl lg:text-[2.2rem] ${popHeadingClass}`}>
              <ClipReveal delay={0.22}>
                <span className="block">{headlineLine1}</span>
              </ClipReveal>
              <ClipReveal delay={0.32}>
                <span className="block whitespace-nowrap bg-gradient-to-r from-teal-200 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                  {headlineLine2}
                </span>
              </ClipReveal>
            </div>
            <h1 className="sr-only">{h1}</h1>

            <ClipReveal delay={0.42} className="mt-4">
              <p className="text-sm leading-snug text-white/80 sm:text-[15px] md:whitespace-nowrap lg:text-base">
                <WordReveal text={subline} delay={0.44} />
              </p>
            </ClipReveal>

            <ClipReveal delay={0.52} className="mt-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Button
                  href={ctaHref}
                  size="lg"
                  className="lp-cta-attention min-h-[52px] w-full sm:w-auto !border-teal-400/80 !bg-teal-500 px-8 !text-base !text-white shadow-[0_0_28px_rgba(45,212,191,0.22)] hover:!bg-teal-400 hover:!shadow-[0_12px_36px_rgba(13,148,136,0.4)]"
                >
                  無料で公開する
                </Button>
                <Link
                  href={demoEditorHref}
                  className="inline-flex min-h-[44px] items-center justify-center px-2 text-sm font-semibold text-teal-100/90 underline-offset-4 transition hover:text-white hover:underline"
                >
                  30秒デモを見る
                </Link>
              </div>
              <p className="mt-3 text-sm text-white/60">
                クレジットカード不要 · 登録だけで2ページまで公開
              </p>
            </ClipReveal>
          </div>

          <motion.div
            className="mx-auto w-full max-w-[360px] lg:mx-0 lg:justify-self-end"
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <GuestPhoneMock src={previewSrc} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
