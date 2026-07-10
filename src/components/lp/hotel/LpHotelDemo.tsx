import { Button, Section } from "@/components/ui";
import { ScrollReveal } from "@/components/motion";

type LpHotelDemoProps = {
  ctaHref: string;
  demoEditorHref: string;
  samplePageHref: string;
};

export function LpHotelDemo({ ctaHref, demoEditorHref, samplePageHref }: LpHotelDemoProps) {
  return (
    <Section
      id="live-demo"
      kicker="体験"
      title="登録前に、操作感だけ確かめる"
      description="30秒デモかサンプルページで、現場向けの軽さを先に体感できます。"
      variant="muted"
      popTitle
    >
      <ScrollReveal>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              href={demoEditorHref}
              size="lg"
              className="min-h-[48px] flex-1 sm:flex-none !bg-emerald-600 hover:!bg-emerald-700"
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
          <p className="mt-4 text-sm text-slate-500">デモは体験用です。QR公開・本番運用は無料登録後のダッシュボードから。</p>
        </div>
      </ScrollReveal>
    </Section>
  );
}
