"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { FadeIn } from "@/components/motion";
import { LP_POP_HEADING_CLASS } from "@/lib/lp/typography";

/** Single representative Infomii guest preview (flush device fit for phone shell). */
const GUEST_PREVIEW_SRC = "/demo/guest-live?embed=1&fit=device&variant=infomii-hotel";
const HERO_IMAGE_SRC = "/lp/hero/hotel-desk-qr.png";
const HERO_IMAGE_ALT =
  "ホテルフロントのQR案内。紙の館内案内に代わるスマホ向けインフォメーションの現場イメージ";

type LpHeroHotelProps = {
  ctaHref: string;
  samplePageHref?: string;
  demoEditorHref?: string;
};

/**
 * Border-bezel phone shell (matches PhoneDeviceFrame radii).
 * Iframe fills the screen; notch clearance is padding inside the guest page.
 */
function GuestPhoneMock({ src }: { src: string }) {
  const screenRadius = "1.55rem";

  return (
    <div className="relative mx-auto w-[min(100%,300px)] sm:w-[min(100%,320px)] lg:w-[336px]">
      <div className="relative aspect-[9/19.2] max-h-[min(72svh,640px)] w-full overflow-hidden rounded-[2.4rem] border-[10px] border-[#0b0f14] bg-[#0b0f14] shadow-[0_28px_64px_rgba(15,23,42,0.5),inset_0_0_0_1px_rgba(255,255,255,0.06)]">
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
 * Hotel LP hero: full-viewport photo + HTML copy + static CSS phone + live guest iframe.
 */
export function LpHeroHotel({
  ctaHref,
  demoEditorHref = "/demo/editor",
}: LpHeroHotelProps) {
  const popHeadingClass = LP_POP_HEADING_CLASS;

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
        className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/90 via-slate-950/55 to-slate-950/15 sm:via-slate-950/50 sm:to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-36 bg-gradient-to-t from-slate-950/45 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto flex h-full min-h-0 w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(260px,360px)] lg:gap-10 xl:gap-14">
          <div className="max-w-xl text-white">
            <FadeIn>
              <p className="text-sm font-medium tracking-wide text-white/80">
                ホテルのインフォメーションを、スマートに。
              </p>
            </FadeIn>
            <FadeIn delay={0.06}>
              <p className="mt-3 text-5xl font-black tracking-tight sm:text-6xl lg:text-[4.1rem]">
                Infom
                <span className="text-teal-300">ii</span>
              </p>
            </FadeIn>
            <FadeIn delay={0.12}>
              <h1
                className={`mt-4 text-[1.65rem] leading-snug text-white sm:text-3xl lg:text-[2.15rem] ${popHeadingClass}`}
              >
                紙の館内案内から、
                <span className="whitespace-nowrap text-teal-300">スマホのインフォメーションへ。</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.18}>
              <p className="mt-3 text-base text-white/85 sm:text-lg">差し替え不要。その場で更新。</p>
            </FadeIn>
            <FadeIn delay={0.24}>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Button
                  href={ctaHref}
                  size="lg"
                  className="lp-cta-attention min-h-[52px] w-full sm:w-auto !border-teal-500 !bg-teal-600 px-8 !text-base !text-white hover:!bg-teal-500 hover:!shadow-[0_12px_32px_rgba(13,148,136,0.35)]"
                >
                  無料で公開する
                </Button>
                <Link
                  href={demoEditorHref}
                  className="inline-flex min-h-[44px] items-center justify-center px-2 text-sm font-semibold text-teal-200 underline-offset-4 hover:text-white hover:underline"
                >
                  30秒デモを見る
                </Link>
              </div>
              <p className="mt-3 text-sm text-white/65">
                クレジットカード不要 · 登録だけで2ページまで公開
              </p>
            </FadeIn>
          </div>

          <div className="mx-auto w-full max-w-[360px] lg:mx-0 lg:justify-self-end">
            <GuestPhoneMock src={GUEST_PREVIEW_SRC} />
          </div>
        </div>
      </div>
    </section>
  );
}
