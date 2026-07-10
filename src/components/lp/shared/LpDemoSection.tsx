"use client";

import { Button, Section } from "@/components/ui";
import { ScrollReveal } from "@/components/motion";

type LpDemoSectionProps = {
  ctaHref: string;
  demoEditorHref: string;
  samplePageHref: string;
  title?: string;
  description?: string;
};

export function LpDemoSection({
  ctaHref,
  demoEditorHref,
  samplePageHref,
  title = "登録前に、操作感だけ確かめる",
  description = "30秒デモかサンプルページで、軽さを先に体感できます。",
}: LpDemoSectionProps) {
  return (
    <Section id="live-demo" kicker="体験" title={title} description={description} variant="muted" popTitle>
      <ScrollReveal intensity="strong">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/50 p-6 shadow-sm ring-1 ring-emerald-100/80 sm:p-8">
          <div
            className="lp-glow-pulse pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-300/20 blur-2xl"
            aria-hidden
          />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              href={demoEditorHref}
              size="lg"
              className="lp-cta-attention min-h-[48px] flex-1 sm:flex-none !bg-emerald-600 hover:!bg-emerald-700"
            >
              30秒デモを開く
            </Button>
            <Button href={samplePageHref} variant="secondary" size="lg" className="min-h-[48px] flex-1 sm:flex-none">
              サンプルページを見る
            </Button>
            <Button href={ctaHref} variant="secondary" size="lg" className="min-h-[48px] flex-1 sm:flex-none">
              無料ではじめる
            </Button>
          </div>
          <p className="relative mt-4 text-sm text-slate-500">
            デモは体験用です。公開・QR共有は無料登録後のダッシュボードから。
          </p>
        </div>
      </ScrollReveal>
    </Section>
  );
}
