"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button, Container } from "@/components/ui";
import { FadeIn } from "@/components/motion";
import { HOTEL_HERO_TEMPLATES } from "@/lib/lp/hotel-data";
import { LP_POP_HEADING_CLASS } from "@/lib/lp/typography";

function GuestPhoneFrame({ src }: { src: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="lp-float relative mx-auto aspect-[9/15] w-[min(330px,100%)] overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white p-[10px] shadow-[0_24px_56px_rgba(15,23,42,0.12)] sm:w-[min(360px,100%)] lg:w-[375px] lg:max-w-full"
      initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute left-1/2 top-[12px] z-10 h-1.5 w-14 -translate-x-1/2 rounded-full bg-slate-300/90" />
      <div className="relative h-full w-full overflow-hidden rounded-[1.65rem] bg-white p-0 pt-2.5 shadow-inner ring-1 ring-slate-200/70">
        <div
          className="absolute inset-0 overflow-hidden rounded-[1.5rem]"
          style={{
            clipPath: "inset(0 round 1.5rem)",
            WebkitMaskImage: "-webkit-radial-gradient(white, black)",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={src}
              className="absolute inset-x-0 top-[10px] h-[calc(100%-10px)] w-full"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <iframe
                src={src}
                title="Infomii ホテル案内プレビュー"
                className="h-full w-full rounded-[1.5rem] border-0 bg-white"
                loading="lazy"
                scrolling="yes"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

type LpHeroHotelProps = {
  ctaHref: string;
  samplePageHref: string;
  demoEditorHref?: string;
};

export function LpHeroHotel({
  ctaHref,
  samplePageHref,
  demoEditorHref = "/demo/editor",
}: LpHeroHotelProps) {
  const popHeadingClass = LP_POP_HEADING_CLASS;
  const reduceMotion = useReducedMotion();
  const [activeTemplateIndex, setActiveTemplateIndex] = useState(0);

  const activeTemplate = useMemo(
    () => HOTEL_HERO_TEMPLATES[activeTemplateIndex] ?? HOTEL_HERO_TEMPLATES[0],
    [activeTemplateIndex],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("focus") !== "templates") return;
    const id = window.setTimeout(() => {
      document.getElementById("template-focus-anchor")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 160);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setActiveTemplateIndex((prev) => (prev + 1) % HOTEL_HERO_TEMPLATES.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <section className="lp-hero-shell relative isolate min-h-[100svh] overflow-hidden border-b border-emerald-100/80 bg-[#f4fbf8]">
      <div
        className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top_left,_#d1fae5_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_right,_#ccfbf1_0%,_transparent_50%),linear-gradient(180deg,#f8fffc_0%,#eef8f3_48%,#f4fbf8_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />
      <div
        className="lp-glow-pulse pointer-events-none absolute -left-20 top-10 -z-10 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl"
        aria-hidden
      />
      <div
        className="lp-glow-pulse pointer-events-none absolute -right-16 bottom-8 -z-10 h-80 w-80 rounded-full bg-teal-100/60 blur-3xl"
        style={{ animationDelay: "1.2s" }}
        aria-hidden
      />

      <Container className="relative flex min-h-[100svh] flex-col justify-center py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,390px)] lg:gap-14">
          <div className="max-w-xl">
            <FadeIn>
              <p className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Infomii
              </p>
            </FadeIn>
            <FadeIn delay={0.08}>
              <p className="mt-4 text-sm font-semibold tracking-[0.18em] text-emerald-700 uppercase">
                ホテル・旅館・民泊の現場向け
              </p>
            </FadeIn>
            <FadeIn delay={0.14}>
              <h1
                className={`mt-4 text-3xl leading-[1.18] text-slate-900 sm:text-4xl lg:text-[2.85rem] ${popHeadingClass}`}
              >
                フロントの説明を減らす、
                <span className="mt-1 block text-emerald-700">館内案内の軽い運用</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.22}>
              <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
                Wi-Fi・朝食・FAQ・チェックアウトを1ページに。
                紙の差し替えや口頭説明を減らし、QRひとつで案内をそろえます。
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  href={ctaHref}
                  size="lg"
                  className="lp-cta-attention min-h-[52px] w-full sm:w-auto !border-emerald-700 !bg-emerald-600 px-8 !text-base !text-white hover:!bg-emerald-700 hover:!shadow-[0_12px_32px_rgba(5,150,105,0.28)]"
                >
                  無料ではじめる
                </Button>
                <Button
                  href={demoEditorHref}
                  variant="secondary"
                  size="lg"
                  className="min-h-[52px] w-full !text-base sm:w-auto"
                >
                  30秒デモを見る
                </Button>
              </div>
              <p className="mt-4 text-sm text-slate-500">クレジットカード不要 · 登録だけで3ページまで公開</p>
            </FadeIn>
          </div>

          <div id="template-focus-anchor" className="mx-auto w-full max-w-[390px]">
            <GuestPhoneFrame src={activeTemplate.previewHref || samplePageHref} />
            <FadeIn delay={0.35}>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {HOTEL_HERO_TEMPLATES.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTemplateIndex(index)}
                    className={
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition duration-200 " +
                      (index === activeTemplateIndex
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/50")
                    }
                  >
                    {item.category}
                  </button>
                ))}
              </div>
              <p className="mt-2.5 text-center text-xs text-slate-500">
                {activeTemplate.label} — {activeTemplate.description}
              </p>
            </FadeIn>
          </div>
        </div>
      </Container>
    </section>
  );
}
