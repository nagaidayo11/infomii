"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Container } from "@/components/ui";
import { FadeIn } from "@/components/motion";
import { HERO_TEMPLATE_PREVIEWS } from "@/lib/lp/data";
import { LP_POP_HEADING_CLASS } from "@/lib/lp/typography";

function GuestPhoneFrame({ src }: { src: string }) {
  return (
    <div className="relative mx-auto aspect-[9/15] w-[min(330px,100%)] overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-[10px] shadow-[0_18px_42px_rgba(15,23,42,0.16)] sm:w-[min(360px,100%)] lg:w-[375px] lg:max-w-full">
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
            key={src}
            src={src}
            title="Infomii page preview"
            className="absolute inset-x-0 top-[10px] h-[calc(100%-10px)] w-full rounded-[1.5rem] border-0 bg-white transition-opacity duration-300"
            loading="lazy"
            scrolling="yes"
          />
        </div>
      </div>
    </div>
  );
}

type LpHeroProps = {
  ctaHref: string;
  samplePageHref: string;
  demoEditorHref?: string;
};

export function LpHero({
  ctaHref,
  samplePageHref,
  demoEditorHref = "/demo/editor",
}: LpHeroProps) {
  const popHeadingClass = LP_POP_HEADING_CLASS;
  const [activeId, setActiveId] = useState(HERO_TEMPLATE_PREVIEWS[0]?.id ?? "travel");
  const [highlightPreviewTabs, setHighlightPreviewTabs] = useState(false);
  const [showPreviewGuide, setShowPreviewGuide] = useState(false);

  const activeTemplate = useMemo(
    () => HERO_TEMPLATE_PREVIEWS.find((t) => t.id === activeId) ?? HERO_TEMPLATE_PREVIEWS[0],
    [activeId]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const focus = params.get("focus");
    const variant = params.get("variant");

    if (variant && HERO_TEMPLATE_PREVIEWS.some((t) => t.id === variant)) {
      setActiveId(variant);
    }

    if (focus === "use-cases") {
      document.getElementById("use-cases")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (focus !== "templates") return;

    if (!variant) {
      setActiveId("travel");
    }

    let cancelled = false;
    const focusHeroPreview = () => {
      if (cancelled) return;
      const target = document.getElementById("template-focus-anchor");
      if (!target) {
        window.requestAnimationFrame(focusHeroPreview);
        return;
      }
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightPreviewTabs(true);
      setShowPreviewGuide(true);
    };

    const scrollId = window.setTimeout(focusHeroPreview, 160);
    const clearHighlightId = window.setTimeout(() => setHighlightPreviewTabs(false), 3600);
    const clearGuideId = window.setTimeout(() => setShowPreviewGuide(false), 4200);

    return () => {
      cancelled = true;
      window.clearTimeout(scrollId);
      window.clearTimeout(clearHighlightId);
      window.clearTimeout(clearGuideId);
    };
  }, []);

  return (
    <section className="overflow-x-hidden border-b border-emerald-100 bg-gradient-to-b from-[#F2FBF7] via-[#FAFFFC] to-[#F2FBF7]">
      <Container className="py-10 sm:py-12 lg:py-14">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,390px)] lg:gap-10">
          <FadeIn>
            <div className="max-w-2xl">
              <p className={`text-2xl leading-none text-emerald-700 sm:text-3xl lg:text-4xl ${popHeadingClass}`}>
                旅行・推し活・おでかけ向け
              </p>
              <p className={`mt-9 text-xl text-slate-800 sm:mt-14 sm:text-2xl lg:mt-20 ${popHeadingClass}`}>
                予定やリンク、まだバラバラに送ってますか？
              </p>
              <h1 className={`mt-2 text-3xl leading-tight text-slate-900 sm:mt-3 sm:text-4xl lg:text-5xl ${popHeadingClass}`}>
                <span className="block lg:text-[0.92em]">情報を、1ページに。</span>
                <span className="mt-1 block text-emerald-700 lg:whitespace-nowrap lg:text-[0.92em]">
                  共有をもっとシンプルに。
                </span>
              </h1>
              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:mt-5 sm:text-lg">
                旅行のしおり、推し活の当日メモ、デートの予定まで。
                <br />
                伝えたいことをスマホで見やすくまとめて、URLひとつで届けられます。
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:mt-7 sm:gap-3">
                <Button
                  href={ctaHref}
                  size="lg"
                  className="min-h-[48px] !border-emerald-700 !bg-emerald-600 px-6 !text-white hover:!bg-emerald-700 hover:!shadow-[0_10px_24px_rgba(5,150,105,0.35)]"
                >
                  無料ではじめる
                </Button>
                <Button href={demoEditorHref} variant="secondary" size="lg" className="min-h-[48px] border-2">
                  30秒デモを見る
                </Button>
              </div>
              <p className="mt-3 text-sm text-slate-500">登録なしで体験できます</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.08}>
            <div id="template-focus-anchor" className="mx-auto w-full max-w-[390px]">
              <GuestPhoneFrame src={activeTemplate?.previewHref || samplePageHref} />
              <div className="mt-3 text-center">
                {showPreviewGuide ? (
                  <div className="mb-1.5 flex flex-col items-center">
                    <span className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white shadow-[0_8px_18px_rgba(5,150,105,0.3)] animate-pulse">
                      下のタブで用途サンプルを切り替え
                    </span>
                    <span className="mt-0.5 text-emerald-600 animate-bounce" aria-hidden>
                      ↓
                    </span>
                  </div>
                ) : null}
                <div
                  className={`flex flex-wrap justify-center gap-1.5 rounded-2xl px-1 py-1 transition duration-300 ${
                    highlightPreviewTabs
                      ? "animate-pulse bg-emerald-50/90 shadow-[0_0_0_6px_rgba(16,185,129,0.22)] ring-2 ring-emerald-400/50"
                      : ""
                  }`}
                  role="tablist"
                  aria-label="用途プレビュー"
                >
                  {HERO_TEMPLATE_PREVIEWS.map((item) => {
                    const selected = item.id === activeId;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => {
                          setActiveId(item.id);
                          setHighlightPreviewTabs(false);
                          setShowPreviewGuide(false);
                        }}
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition duration-200 sm:px-3 sm:py-1.5 ${
                          selected
                            ? "border-emerald-300/90 bg-white text-emerald-800 shadow-[0_1px_4px_rgba(16,185,129,0.12)]"
                            : "border-transparent bg-white/50 text-slate-500 hover:border-slate-200/80 hover:bg-white hover:text-slate-700"
                        }`}
                      >
                        {item.tag}
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="mt-2 text-center text-[11px] text-slate-500">
                {activeTemplate.label} | {activeTemplate.description}
              </p>
            </div>
          </FadeIn>
        </div>
      </Container>
      <div className="sr-only" aria-live="polite">
        現在のプレビュー: {activeTemplate.label}
      </div>
    </section>
  );
}
