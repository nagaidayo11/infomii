"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Container } from "@/components/ui";
import { FadeIn } from "@/components/motion";

type TemplatePreviewItem = {
  id: string;
  label: string;
  category: string;
  description: string;
  previewHref: string;
  openHref: string;
};

const HERO_TEMPLATE_PREVIEWS: TemplatePreviewItem[] = [
  {
    id: "city-hotel",
    label: "シティホテル案内",
    category: "宿泊",
    description: "館内案内・WiFi・朝食を1ページで整理",
    previewHref: "/demo/guest-live?embed=1&variant=city-hotel",
    openHref: "/demo/guest-live?variant=city-hotel",
  },
  {
    id: "resort",
    label: "リゾートホテル",
    category: "宿泊",
    description: "アクティビティと送迎案内を見やすく配置",
    previewHref: "/demo/guest-live?embed=1&variant=resort",
    openHref: "/demo/guest-live?variant=resort",
  },
  {
    id: "ryokan",
    label: "温泉旅館",
    category: "宿泊",
    description: "食事時間・館内ルール・温泉導線を集約",
    previewHref: "/demo/guest-live?embed=1&variant=ryokan",
    openHref: "/demo/guest-live?variant=ryokan",
  },
  {
    id: "business-hotel",
    label: "ビジネスホテル",
    category: "宿泊",
    description: "チェックイン導線と周辺情報を簡潔に表示",
    previewHref: "/demo/guest-live?embed=1&variant=business-hotel",
    openHref: "/demo/guest-live?variant=business-hotel",
  },
  {
    id: "glamping",
    label: "グランピング施設",
    category: "アウトドア",
    description: "持ち物・天候対応・食事案内をひとまとめ",
    previewHref: "/demo/guest-live?embed=1&variant=glamping",
    openHref: "/demo/guest-live?variant=glamping",
  },
  {
    id: "spa",
    label: "サウナ / スパ",
    category: "ウェルネス",
    description: "利用時間・プラン案内・注意事項を整理",
    previewHref: "/demo/guest-live?embed=1&variant=spa",
    openHref: "/demo/guest-live?variant=spa",
  },
  {
    id: "restaurant",
    label: "レストラン",
    category: "飲食",
    description: "メニューと注文導線をスマホ最適化",
    previewHref: "/demo/guest-live?embed=1&variant=restaurant",
    openHref: "/demo/guest-live?variant=restaurant",
  },
  {
    id: "cafe",
    label: "カフェ",
    category: "飲食",
    description: "日替わりメニューや席案内をコンパクトに表示",
    previewHref: "/demo/guest-live?embed=1&variant=cafe",
    openHref: "/demo/guest-live?variant=cafe",
  },
  {
    id: "salon",
    label: "美容サロン",
    category: "美容",
    description: "サービス一覧・料金・導線をわかりやすく",
    previewHref: "/demo/guest-live?embed=1&variant=salon",
    openHref: "/demo/guest-live?variant=salon",
  },
  {
    id: "clinic",
    label: "クリニック / 施設案内",
    category: "施設",
    description: "受付手順・注意事項・連絡先を整理",
    previewHref: "/demo/guest-live?embed=1&variant=clinic",
    openHref: "/demo/guest-live?variant=clinic",
  },
];

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
            src={src}
            title="Infomii guest page preview"
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
  /** 登録なしで触れるサンプル（公開ゲストページ） */
  samplePageHref: string;
  /** 登録なしで触れるデモエディタ */
  demoEditorHref?: string;
};

export function LpHero({
  ctaHref,
  samplePageHref,
  demoEditorHref = "/demo/editor",
}: LpHeroProps) {
  const popHeadingClass =
    "[font-family:'M_PLUS_Rounded_1c','Noto_Sans_JP',sans-serif] font-black tracking-tight drop-shadow-[0_4px_0_rgba(16,185,129,0.2)]";
  const [activeTemplateIndex, setActiveTemplateIndex] = useState(0);
  const [highlightTemplateButton, setHighlightTemplateButton] = useState(false);
  const [showTemplateGuide, setShowTemplateGuide] = useState(false);

  const activeTemplate = useMemo(
    () => HERO_TEMPLATE_PREVIEWS[activeTemplateIndex] ?? HERO_TEMPLATE_PREVIEWS[0],
    [activeTemplateIndex]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shouldFocusTemplate = params.get("focus") === "templates";
    if (!shouldFocusTemplate) return;
    let cancelled = false;

    const focusTarget = () => {
      if (cancelled) return;
      const target = document.getElementById("template-focus-anchor");
      if (!target) {
        window.requestAnimationFrame(focusTarget);
        return;
      }
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightTemplateButton(true);
      setShowTemplateGuide(true);
    };

    const scrollId = window.setTimeout(() => {
      focusTarget();
    }, 160);

    const clearHighlightId = window.setTimeout(() => {
      setHighlightTemplateButton(false);
    }, 3600);
    const clearGuideId = window.setTimeout(() => {
      setShowTemplateGuide(false);
    }, 4200);

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
                ホテル・旅館のフロント/運営担当向け
              </p>
              <p className={`mt-20 text-xl text-slate-800 sm:text-2xl ${popHeadingClass}`}>紙の館内案内、まだ配ってますか？</p>
              <h1 className={`mt-3 text-3xl leading-tight text-slate-900 sm:text-4xl lg:text-5xl ${popHeadingClass}`}>
                <span className="block lg:text-[0.92em]">QRひとつで「紙→スマホ案内」へ</span>
                <span className="mt-1 block text-emerald-700 lg:whitespace-nowrap lg:text-[0.92em]">最短3分で公開＆売上導線も作れる</span>
              </h1>
              <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
                WiFi・朝食・注文・設備案内を1ページに集約。
                <br />
                フロントの説明負担を減らしながら、追加売上も実現。
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button
                  href={ctaHref}
                  size="lg"
                  className="min-h-[48px] !border-emerald-700 !bg-emerald-600 px-6 !text-white hover:!bg-emerald-700 hover:!shadow-[0_10px_24px_rgba(5,150,105,0.35)]"
                >
                  無料でQR案内を作る
                </Button>
                <Button href={demoEditorHref} variant="secondary" size="lg" className="min-h-[48px] border-2">
                  30秒デモを見る
                </Button>
              </div>
              <p className="mt-3 text-sm font-medium text-slate-500">登録なしで体験できます</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.08}>
            <div id="template-focus-anchor" className="mx-auto w-full max-w-[390px]">
              <GuestPhoneFrame src={activeTemplate?.previewHref || samplePageHref} />
              <div className="mt-3 text-center">
                {showTemplateGuide ? (
                  <div className="mb-1.5 flex flex-col items-center">
                    <span className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white shadow-[0_8px_18px_rgba(5,150,105,0.3)] animate-pulse">
                      ここをタップでテンプレート切替
                    </span>
                    <span className="mt-0.5 text-emerald-600 animate-bounce" aria-hidden>
                      ↓
                    </span>
                  </div>
                ) : null}
                <button
                  id="template-cycle-trigger"
                  type="button"
                  onClick={() => setActiveTemplateIndex((prev) => (prev + 1) % HERO_TEMPLATE_PREVIEWS.length)}
                  className={`inline-flex items-center rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50 ${
                    highlightTemplateButton
                      ? "animate-pulse border-emerald-500 bg-emerald-50 shadow-[0_0_0_6px_rgba(16,185,129,0.28),0_12px_24px_rgba(5,150,105,0.2)]"
                      : ""
                  }`}
                >
                  クリックして別パターンを見る
                </button>
              </div>
              <p className="mt-2 text-center text-[11px] text-slate-500">{activeTemplate.category} | {activeTemplate.label}</p>
            </div>
          </FadeIn>
        </div>
      </Container>
      <div className="sr-only" aria-live="polite">
        現在のテンプレート: {activeTemplate.label}
      </div>
    </section>
  );
}
