import Link from "next/link";
import { Container } from "@/components/ui";
import { LpHeroHotel } from "@/components/lp/LpHeroHotel";
import { LpSaasHeader } from "@/components/lp/LpSaasHeader";
import {
  LpHotelBeforeAfterMotion,
  LpHotelScenesMarquee,
  LpHotelTrustMarquee,
  LpHotelValueMotion,
  LpHotelWorkflowMotion,
} from "@/components/lp/hotel/LpHotelAnimatedSections";
import { LpDemoSection } from "@/components/lp/shared/LpDemoSection";
import { LpFaqSection } from "@/components/lp/shared/LpFaqSection";
import { LpFinalCtaSection } from "@/components/lp/shared/LpFinalCtaSection";
import { LpPricing } from "@/components/lp/shared/LpPricing";
import {
  HOTEL_LP_BEFORE_AFTER,
  HOTEL_LP_FAQ,
  HOTEL_LP_PROPERTY_TYPES,
  HOTEL_LP_TRUST_POINTS,
  HOTEL_LP_VALUE_POINTS,
  HOTEL_LP_WORKFLOW_STEPS,
  HOTEL_PLANS,
} from "@/lib/lp/hotel-data";
import { LP_PAGE_TYPOGRAPHY_CLASS } from "@/lib/lp/typography";

const SAMPLE_PAGE_HREF = "/demo/guest-live?embed=1&fit=device&variant=infomii-hotel";
const SAMPLE_PAGE_FULL_HREF = "/demo/guest-live?variant=infomii-hotel";
const DEMO_EDITOR_HREF = "/demo/editor";
const HUB_BLOG_HREF = "/blog/hotel-information-smartphone";

const HOTEL_SCENE_BULLETS = [
  "客室のQRから、滞在中の案内をまとめて見せられる",
  "Wi-Fi・食事時間・館内・周辺を1ページでそろえられる",
  "変更はその場で更新。紙の差し替えが不要になる",
  "Freeでまず1ページ公開してから広げられる",
] as const;

export default function LpHotelSaaSPage() {
  const loginHref = "/login?ref=lp-business";
  const ctaHref = "/login?ref=lp-business&next=%2Fdashboard%3Ftab%3Dcreate";
  const hasProAnnual = !!process.env.STRIPE_PRO_ANNUAL_PRICE_ID;
  const hasBusinessAnnual = !!process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID;

  return (
    <main
      className={
        "lp-page lp-hotel-surface min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-[#f4faf7] text-slate-900 antialiased " +
        "font-['M_PLUS_Rounded_1c','Noto_Sans_JP',system-ui,sans-serif] " +
        LP_PAGE_TYPOGRAPHY_CLASS
      }
    >
      <LpSaasHeader loginHref={loginHref} ctaHref={ctaHref} variant="business" />

      <LpHeroHotel ctaHref={ctaHref} samplePageHref={SAMPLE_PAGE_HREF} demoEditorHref={DEMO_EDITOR_HREF} />

      <LpHotelTrustMarquee points={HOTEL_LP_TRUST_POINTS} />

      <LpHotelValueMotion items={HOTEL_LP_VALUE_POINTS} />

      <LpHotelWorkflowMotion steps={HOTEL_LP_WORKFLOW_STEPS} />

      <LpDemoSection
        ctaHref={ctaHref}
        demoEditorHref={DEMO_EDITOR_HREF}
        samplePageHref={SAMPLE_PAGE_FULL_HREF}
        title="登録前に、作り心地だけ確かめる"
        description="30秒デモか、上の枠のようなサンプル案内を開いて、軽さを先に体感できます。"
      />

      <LpHotelScenesMarquee scenes={HOTEL_LP_PROPERTY_TYPES} bullets={HOTEL_SCENE_BULLETS} />

      <LpHotelBeforeAfterMotion rows={HOTEL_LP_BEFORE_AFTER} />

      <div className="bg-slate-50/90 py-6 text-center text-sm text-slate-600">
        <Container>
          置き換えの手順や想定導入事例は
          <Link
            href={HUB_BLOG_HREF}
            className="mx-1 font-semibold text-emerald-800 underline decoration-emerald-300/80 underline-offset-2 hover:text-emerald-950"
          >
            ホテルのインフォメーションをスマホで見せる方法
          </Link>
          にもまとめています。
        </Container>
      </div>

      <LpPricing
        plans={HOTEL_PLANS}
        freeSignupHref={ctaHref}
        hasProAnnual={hasProAnnual}
        hasBusinessAnnual={hasBusinessAnnual}
      />

      <LpFaqSection items={HOTEL_LP_FAQ} variant="white" />

      <LpFinalCtaSection
        ctaHref={ctaHref}
        loginHref={loginHref}
        demoEditorHref={DEMO_EDITOR_HREF}
        title="まずは無料で、1ページ作ってみる"
        description={
          <>
            上のスマホ枠のようなホテル案内を、テンプレから始められます。
            <br className="hidden sm:inline" />
            クレジットカード不要。公開まで数分です。
          </>
        }
        trustPoints={HOTEL_LP_TRUST_POINTS}
        revealIntensity="strong"
      />

      <footer className="border-t border-slate-200 bg-slate-50/80 py-8">
        <Container className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Infomii</p>
          <div className="flex flex-wrap gap-6 text-sm">
            <Link
              href="/terms"
              className="text-slate-600 underline decoration-transparent underline-offset-4 transition hover:text-emerald-700 hover:decoration-emerald-400/80"
            >
              利用規約
            </Link>
            <Link
              href="/privacy"
              className="text-slate-600 underline decoration-transparent underline-offset-4 transition hover:text-emerald-700 hover:decoration-emerald-400/80"
            >
              プライバシーポリシー
            </Link>
            <Link
              href={loginHref}
              className="text-slate-600 underline decoration-transparent underline-offset-4 transition hover:text-emerald-700 hover:decoration-emerald-400/80"
            >
              ログイン
            </Link>
          </div>
        </Container>
      </footer>
    </main>
  );
}
