import Link from "next/link";
import { Container } from "@/components/ui";
import { LpHashScroll } from "@/components/lp/LpHashScroll";
import { LpHero } from "@/components/lp/LpHero";
import { LpSaasHeader } from "@/components/lp/LpSaasHeader";
import { LpTemplates } from "@/components/lp/LpTemplates";
import { LpUseCases } from "@/components/lp/LpUseCases";
import { LpBeforeAfterSection } from "@/components/lp/shared/LpBeforeAfterSection";
import { LpContentGridSection } from "@/components/lp/shared/LpContentGridSection";
import { LpDemoSection } from "@/components/lp/shared/LpDemoSection";
import { LpFaqSection } from "@/components/lp/shared/LpFaqSection";
import { LpFinalCtaSection } from "@/components/lp/shared/LpFinalCtaSection";
import { LpPlacementSection } from "@/components/lp/shared/LpPlacementSection";
import { LpPricing } from "@/components/lp/shared/LpPricing";
import { LpScenesSection } from "@/components/lp/shared/LpScenesSection";
import { LpTrustStrip } from "@/components/lp/shared/LpTrustStrip";
import { LpWorkflowSection } from "@/components/lp/shared/LpWorkflowSection";
import {
  PERSONAL_LP_BEFORE_AFTER,
  PERSONAL_LP_BENEFITS,
  PERSONAL_LP_FAQ,
  PERSONAL_LP_PAIN_POINTS,
  PERSONAL_LP_SHARING,
  PERSONAL_LP_TRUST_POINTS,
  PERSONAL_LP_WORKFLOW_STEPS,
  PERSONAL_LP_SCENES,
  PERSONAL_PLANS,
} from "@/lib/lp/personal-data";
import { LP_PAGE_TYPOGRAPHY_CLASS } from "@/lib/lp/typography";

const SAMPLE_PAGE_HREF = "/demo/guest-live?embed=1&variant=travel";
const SAMPLE_PAGE_DEMO_HREF = "/lp/saas?focus=templates";
const DEMO_EDITOR_HREF = "/demo/editor";

export default function LpPersonalSaaSPage() {
  const loginHref = "/login?ref=lp-saas";
  const ctaHref = "/login?ref=lp-saas&next=%2Fdashboard%3Ftab%3Dcreate";
  const hasProAnnual = !!process.env.STRIPE_PRO_ANNUAL_PRICE_ID;
  const hasBusinessAnnual = !!process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID;

  return (
    <main
      className={
        "lp-page min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-white text-slate-900 antialiased " +
        "font-['M_PLUS_Rounded_1c','Noto_Sans_JP',system-ui,sans-serif] " +
        LP_PAGE_TYPOGRAPHY_CLASS
      }
    >
      <LpSaasHeader loginHref={loginHref} ctaHref={ctaHref} />

      <LpHero ctaHref={ctaHref} samplePageHref={SAMPLE_PAGE_HREF} demoEditorHref={DEMO_EDITOR_HREF} />

      <LpTrustStrip points={PERSONAL_LP_TRUST_POINTS} />

      <LpContentGridSection
        id="pain-points"
        kicker="いまの困りごと"
        title="共有が、ちょっと面倒になっていませんか"
        description="旅行のしおりも推し活の予定も、届け方がバラバラだと負担が増えます。"
        items={PERSONAL_LP_PAIN_POINTS}
        variant="muted"
      />

      <LpContentGridSection
        id="benefits"
        kicker="シンプルに届ける"
        title="「作れる」より、伝わりやすく・更新しやすく"
        description="高機能ツールではなく、1ページにまとめて軽く共有するための設計です。"
        items={PERSONAL_LP_BENEFITS}
        titleAccent
      />

      <LpUseCases />

      <LpWorkflowSection
        kicker="操作の流れ"
        title="3ステップで、1ページができる"
        description="難しい設定は不要。テンプレから数分で公開まで進められます。"
        steps={PERSONAL_LP_WORKFLOW_STEPS}
        variant="muted"
      />

      <LpDemoSection
        ctaHref={ctaHref}
        demoEditorHref={DEMO_EDITOR_HREF}
        samplePageHref={SAMPLE_PAGE_DEMO_HREF}
      />

      <LpPlacementSection
        id="sharing"
        kicker="共有のしかた"
        title="URL・QR・SNS、好きな渡し方で"
        description="相手にアプリを入れてもらう必要はありません。ブラウザで開くだけです。"
        placements={PERSONAL_LP_SHARING}
        visualTitle="1リンクで、予定と案内を届ける"
        visualBody="旅行・推し活・イベント — 必要な情報だけをスマホで読みやすく"
        visualMode="flow"
        hidePlacements
        visualImageSrc="/templates/previews/travel/travel-itinerary.jpg"
        visualImageAlt="予定表スタイルの旅程ページプレビュー"
      />

      <LpTemplates ctaHref={ctaHref} demoHref={SAMPLE_PAGE_DEMO_HREF} />

      <LpScenesSection
        id="scenes"
        kicker="こんな使い方"
        title="個人の整理から、宿泊施設の案内まで"
        description="個人利用が中心。ホテル・旅館の館内案内は別ページで詳しく紹介しています。"
        scenes={PERSONAL_LP_SCENES}
        bullets={[
          "予定・MAP・リンクを1ページに",
          "URL / QR / SNSで共有",
          "無料で3ページまで公開",
          "宿泊施設向けは /lp/business へ",
        ]}
        variant="muted"
      />

      <div className="border-b border-slate-100 bg-white py-8">
        <Container className="text-center">
          <p className="text-sm text-slate-600">
            ホテル・旅館・民泊の館内案内は{" "}
            <Link href="/lp/business" className="font-semibold text-emerald-700 underline hover:no-underline">
              宿泊施設向けページ
            </Link>
            をご覧ください。
          </p>
        </Container>
      </div>

      <LpBeforeAfterSection
        kicker="Before / After"
        title="共有のストレスが、減る"
        description="メモやDMのやりとりから、1ページ運用へ。"
        rows={PERSONAL_LP_BEFORE_AFTER}
        variant="muted"
      />

      <LpHashScroll id="pricing" />
      <LpPricing
        plans={PERSONAL_PLANS}
        freeSignupHref={ctaHref}
        hasProAnnual={hasProAnnual}
        hasBusinessAnnual={hasBusinessAnnual}
        title="まず無料で、1ページ作ってみる"
        description="個人のしおりから小規模運用まで。有料プランは必要になったらで大丈夫です。"
        compareHint="迷ったら無料登録から"
      />

      <LpFaqSection items={PERSONAL_LP_FAQ} variant="muted" />

      <LpFinalCtaSection
        ctaHref={ctaHref}
        loginHref={loginHref}
        demoEditorHref={DEMO_EDITOR_HREF}
        title="無料で、最初の1ページを作る"
        description={
          <>
            旅行・推し活・おでかけの情報を、きれいに1ページに。
            <br className="hidden sm:inline" />
            クレジットカード不要で、数分から公開できます。
          </>
        }
        trustPoints={PERSONAL_LP_TRUST_POINTS}
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
