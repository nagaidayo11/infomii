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
        kicker="現場のあるあるを、そのまま軽くする"
        title="ホテルのインフォメーションを、スマホで回す"
        description="上の画面のような案内ページを作ると、フロントの繰り返し説明と紙の差し替えが減ります。"
        items={HOTEL_LP_VALUE_POINTS}
        titleAccent
        variant="white"
      />

      <LpWorkflowSection
        kicker="はじめかた"
        title="3ステップで、客室に置ける案内になる"
        description="専門知識は不要です。テンプレから始めて、今日聞かれやすい項目だけ整えれば公開できます。"
        steps={HOTEL_LP_WORKFLOW_STEPS}
        variant="muted"
      />

      <LpDemoSection
        ctaHref={ctaHref}
        demoEditorHref={DEMO_EDITOR_HREF}
        samplePageHref={SAMPLE_PAGE_FULL_HREF}
        title="登録前に、作り心地だけ確かめる"
        description="30秒デモか、上の枠のようなサンプル案内を開いて、軽さを先に体感できます。"
      />

      <LpScenesSection
        id="properties"
        kicker="こんな施設で"
        title="シティホテルから、小規模宿まで"
        description="大規模システム入れ替えではなく、まず1ページのインフォメーションから始められます。"
        scenes={HOTEL_LP_PROPERTY_TYPES}
        bullets={HOTEL_SCENE_BULLETS}
        variant="white"
      />

      <LpBeforeAfterSection
        kicker="Before / After"
        title="紙の館内案内から、スマホの運用へ"
        description="機能の多さより、毎日の案内がどう変わるかを重視しています。"
        rows={HOTEL_LP_BEFORE_AFTER}
        variant="muted"
      />

      <div className="bg-slate-50/90 py-6 text-center text-sm text-slate-600">
        <Container>
          置き換えの手順は
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
