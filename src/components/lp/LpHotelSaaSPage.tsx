import Link from "next/link";
import { Container } from "@/components/ui";
import { LpHeroHotel } from "@/components/lp/LpHeroHotel";
import { LpSaasHeader } from "@/components/lp/LpSaasHeader";
import { LpBeforeAfterSection } from "@/components/lp/shared/LpBeforeAfterSection";
import { LpContentGridSection } from "@/components/lp/shared/LpContentGridSection";
import { LpDemoSection } from "@/components/lp/shared/LpDemoSection";
import { LpFaqSection } from "@/components/lp/shared/LpFaqSection";
import { LpFinalCtaSection } from "@/components/lp/shared/LpFinalCtaSection";
import { LpPricing } from "@/components/lp/shared/LpPricing";
import { LpScenesSection } from "@/components/lp/shared/LpScenesSection";
import { LpTrustStrip } from "@/components/lp/shared/LpTrustStrip";
import { LpWorkflowSection } from "@/components/lp/shared/LpWorkflowSection";
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

const SAMPLE_PAGE_HREF = "/demo/guest-live?embed=1&variant=city-hotel";
const SAMPLE_PAGE_DEMO_HREF = "/lp/business?focus=templates";
const DEMO_EDITOR_HREF = "/demo/editor";

const HOTEL_SCENE_BULLETS = [
  "フロント・館内案内・Wi-Fi・朝食",
  "チェックアウト・FAQ・多言語（Business）",
  "客室QR・共有URL・下書き公開",
  "テンプレから最短数分で公開",
] as const;

export default function LpHotelSaaSPage() {
  const loginHref = "/login?ref=lp-business";
  const ctaHref = "/login?ref=lp-business&next=%2Fdashboard%3Ftab%3Dcreate";
  const hasProAnnual = !!process.env.STRIPE_PRO_ANNUAL_PRICE_ID;
  const hasBusinessAnnual = !!process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID;

  return (
    <main
      className={
        "lp-page min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-[#f7fbf9] text-slate-900 antialiased " +
        "font-['M_PLUS_Rounded_1c','Noto_Sans_JP',system-ui,sans-serif] " +
        LP_PAGE_TYPOGRAPHY_CLASS
      }
    >
      <LpSaasHeader loginHref={loginHref} ctaHref={ctaHref} variant="business" />

      <LpHeroHotel ctaHref={ctaHref} samplePageHref={SAMPLE_PAGE_HREF} demoEditorHref={DEMO_EDITOR_HREF} />

      <LpTrustStrip points={HOTEL_LP_TRUST_POINTS} />

      <LpContentGridSection
        id="operations"
        kicker="現場がラクになる"
        title="説明・印刷・多言語の負担を、QR運用にまとめる"
        description="同じ説明の繰り返しや紙の差し替えを減らし、館内案内を1ページでそろえます。"
        items={HOTEL_LP_VALUE_POINTS}
        titleAccent
        variant="white"
      />

      <LpWorkflowSection
        kicker="操作の流れ"
        title="3ステップで、今日から案内を統一"
        description="難しい設定は不要。テンプレ選びから公開まで、現場目線で進められます。"
        steps={HOTEL_LP_WORKFLOW_STEPS}
        variant="muted"
      />

      <LpDemoSection
        ctaHref={ctaHref}
        demoEditorHref={DEMO_EDITOR_HREF}
        samplePageHref={SAMPLE_PAGE_DEMO_HREF}
        title="登録前に、操作感だけ確かめる"
      />

      <LpScenesSection
        id="properties"
        kicker="導入イメージ"
        title="ホテル・旅館・民泊の現場向け"
        description="大規模チェーンでなくても、少人数のフロント運用から始められます。"
        scenes={HOTEL_LP_PROPERTY_TYPES}
        bullets={HOTEL_SCENE_BULLETS}
        variant="white"
      />

      <LpBeforeAfterSection
        kicker="Before / After"
        title="運用の変化が、現場に伝わる"
        description="派手な機能より、日々の案内業務がどう軽くなるかを重視しています。"
        rows={HOTEL_LP_BEFORE_AFTER}
        variant="muted"
      />

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
        title="まず無料で、1ページ作ってみる"
        description={
          <>
            ホテル現場で一番軽く使える案内ツールとして。
            <br className="hidden sm:inline" />
            クレジットカード不要で、数分から公開できます。
          </>
        }
        trustPoints={HOTEL_LP_TRUST_POINTS}
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
