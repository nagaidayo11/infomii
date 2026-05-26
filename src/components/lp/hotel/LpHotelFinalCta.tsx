import Link from "next/link";
import { Button, Container } from "@/components/ui";
import { ScrollReveal } from "@/components/motion";
import { HOTEL_LP_TRUST_POINTS } from "@/lib/lp/hotel-data";

type LpHotelFinalCtaProps = {
  ctaHref: string;
  loginHref: string;
  demoEditorHref: string;
};

export function LpHotelFinalCta({ ctaHref, loginHref, demoEditorHref }: LpHotelFinalCtaProps) {
  return (
    <section id="final-cta" className="border-t border-slate-200 bg-white py-16 sm:py-20">
      <ScrollReveal intensity="subtle">
        <Container size="sm" className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">はじめ方</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            まず無料で、1ページ作ってみる
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            ホテル現場で一番軽く使える案内ツールとして。
            <br className="hidden sm:inline" />
            クレジットカード不要で、数分から公開できます。
          </p>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-slate-600">
            {HOTEL_LP_TRUST_POINTS.map((point) => (
              <li
                key={point}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 ring-1 ring-slate-100"
              >
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button
              href={ctaHref}
              size="lg"
              className="min-h-[52px] px-8 !text-base !border-emerald-700 !bg-emerald-600 !text-white hover:!bg-emerald-700"
            >
              無料ではじめる
            </Button>
            <Button href={demoEditorHref} variant="secondary" size="lg" className="min-h-[52px] !text-base">
              登録なしで触る（30秒デモ）
            </Button>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            すでにアカウントをお持ちの方は{" "}
            <Link href={loginHref} className="font-medium text-emerald-700 underline hover:no-underline">
              ログイン
            </Link>
          </p>
        </Container>
      </ScrollReveal>
    </section>
  );
}
