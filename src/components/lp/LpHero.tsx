"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Container } from "@/components/ui";
import { FadeIn } from "@/components/motion";
import { PERSONAL_HERO_TEMPLATES } from "@/lib/lp/personal-data";
import { LP_POP_HEADING_CLASS } from "@/lib/lp/typography";

function GuestPhoneFrame({ src }: { src: string }) {
  return (
    <div className="relative mx-auto aspect-[9/15] w-[min(330px,100%)] overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white p-[10px] shadow-[0_20px_50px_rgba(15,23,42,0.12)] sm:w-[min(360px,100%)] lg:w-[375px] lg:max-w-full">
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
            title="Infomii ページプレビュー"
            className="absolute inset-x-0 top-[10px] h-[calc(100%-10px)] w-full rounded-[1.5rem] border-0 bg-white"
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
  const [activeTemplateIndex, setActiveTemplateIndex] = useState(0);

  const activeTemplate = useMemo(
    () => PERSONAL_HERO_TEMPLATES[activeTemplateIndex] ?? PERSONAL_HERO_TEMPLATES[0],
    [activeTemplateIndex],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const variant = params.get("variant");
    if (variant) {
      const idx = PERSONAL_HERO_TEMPLATES.findIndex((t) => t.id === variant);
      if (idx >= 0) setActiveTemplateIndex(idx);
    }
    if (params.get("focus") === "use-cases") {
      document.getElementById("use-cases")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (params.get("focus") === "templates") {
      window.setTimeout(() => {
        document.getElementById("template-focus-anchor")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 160);
    }
  }, []);

  return (
    <section className="overflow-x-hidden border-b border-slate-100 bg-white">
      <Container className="py-10 sm:py-14 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,390px)] lg:gap-12">
          <FadeIn>
            <div className="max-w-xl">
              <p className="text-sm font-semibold tracking-wide text-emerald-700">旅行・推し活・おでかけ向け</p>
              <h1 className={`mt-4 text-3xl leading-[1.15] text-slate-900 sm:text-4xl lg:text-[2.75rem] ${popHeadingClass}`}>
                情報を、1ページに。
                <span className="mt-1 block text-emerald-700">共有をもっとシンプルに。</span>
              </h1>
              <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
                旅行のしおり、推し活の当日メモ、デートの予定まで。
                伝えたいことをスマホで見やすくまとめ、URLひとつで届けられます。
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  href={ctaHref}
                  size="lg"
                  className="min-h-[52px] w-full sm:w-auto !border-emerald-700 !bg-emerald-600 px-8 !text-base !text-white hover:!bg-emerald-700 hover:!shadow-[0_10px_28px_rgba(5,150,105,0.28)]"
                >
                  無料ではじめる
                </Button>
                <Button
                  href={demoEditorHref}
                  variant="secondary"
                  size="lg"
                  className="min-h-[52px] w-full sm:w-auto !text-base"
                >
                  30秒デモを見る
                </Button>
              </div>
              <p className="mt-3 text-sm text-slate-500">クレジットカード不要 · 登録だけで2ページまで公開</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.08}>
            <div id="template-focus-anchor" className="mx-auto w-full max-w-[390px]">
              <GuestPhoneFrame src={activeTemplate.previewHref || samplePageHref} />
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {PERSONAL_HERO_TEMPLATES.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTemplateIndex(index)}
                    className={
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition duration-200 " +
                      (index === activeTemplateIndex
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/40")
                    }
                  >
                    {item.tag}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-center text-xs text-slate-500">
                {activeTemplate.label} — {activeTemplate.description}
              </p>
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
