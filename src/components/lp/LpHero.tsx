"use client";

import { Button, Container } from "@/components/ui";
import { FadeIn } from "@/components/motion";

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

type LpHeroProps = {
  ctaHref: string;
  /** 登録なしで触れるサンプル（公開ゲストページ） */
  samplePageHref: string;
  /** 「ホテル完成イメージを開く」遷移先（スマホ幅プレビュー用） */
  samplePageOpenHref?: string;
  /** 登録なしで触れるデモエディタ */
  demoEditorHref?: string;
};

export function LpHero({
  ctaHref,
  samplePageHref,
  samplePageOpenHref,
  demoEditorHref = "/demo/editor",
}: LpHeroProps) {
  const popHeadingClass =
    "[font-family:'M_PLUS_Rounded_1c','Noto_Sans_JP',sans-serif] font-black tracking-tight drop-shadow-[0_4px_0_rgba(16,185,129,0.2)]";

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
              <p className="mt-3 text-sm text-slate-600">
                実際のデモページ：
                <a
                  href={samplePageOpenHref ?? "/demo/guest-live"}
                  className="ml-1 font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-800"
                >
                  ホテル完成イメージを開く
                </a>
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.08}>
            <div className="mx-auto w-full max-w-[390px]">
              <GuestPhoneFrame src={samplePageHref} />
              <p className="mt-3 text-center text-xs text-slate-500">※ログイン不要でそのまま操作できます</p>
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
