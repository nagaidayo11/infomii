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
import { BUSINESS_LP_CONTENT, type HotelLpContent } from "@/lib/lp/vertical-data";
import { LP_PAGE_TYPOGRAPHY_CLASS } from "@/lib/lp/typography";

const DEMO_EDITOR_HREF = "/demo/editor";

type LpHotelSaaSPageProps = {
  content?: HotelLpContent;
};

export default function LpHotelSaaSPage({ content = BUSINESS_LP_CONTENT }: LpHotelSaaSPageProps) {
  const loginHref = `/login?ref=${content.loginRef}`;
  const ctaHref = `/login?ref=${content.loginRef}&next=%2Fdashboard%3Ftab%3Dcreate`;
  const hasProAnnual = !!process.env.STRIPE_PRO_ANNUAL_PRICE_ID;
  const hasBusinessAnnual = !!process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID;
  const samplePageFullHref = content.hero.previewSrc.replace("embed=1&fit=device&", "");

  return (
    <main
      className={
        "lp-page lp-hotel-surface min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-[#f4faf7] text-slate-900 antialiased " +
        "font-['M_PLUS_Rounded_1c','Noto_Sans_JP',system-ui,sans-serif] " +
        LP_PAGE_TYPOGRAPHY_CLASS
      }
    >
      <LpSaasHeader loginHref={loginHref} ctaHref={ctaHref} />

      <LpHeroHotel
        ctaHref={ctaHref}
        demoEditorHref={DEMO_EDITOR_HREF}
        eyebrow={content.hero.eyebrow}
        headlineLine1={content.hero.headlineLine1}
        headlineLine2={content.hero.headlineLine2}
        h1={content.hero.h1}
        subline={content.hero.subline}
        previewSrc={content.hero.previewSrc}
      />

      <LpHotelTrustMarquee points={content.trustPoints} />

      <LpHotelValueMotion
        items={content.valuePoints}
        kicker={content.sections.value.kicker}
        title={content.sections.value.title}
        description={content.sections.value.description}
      />

      <LpHotelWorkflowMotion
        steps={content.workflowSteps}
        kicker={content.sections.workflow.kicker}
        title={content.sections.workflow.title}
        description={content.sections.workflow.description}
      />

      <LpDemoSection
        ctaHref={ctaHref}
        demoEditorHref={DEMO_EDITOR_HREF}
        samplePageHref={samplePageFullHref}
        title={content.sections.demo.title}
        description={content.sections.demo.description}
      />

      <LpHotelScenesMarquee
        scenes={content.propertyTypes}
        bullets={content.sceneBullets}
        kicker={content.sections.scenes.kicker}
        title={content.sections.scenes.title}
        description={content.sections.scenes.description}
      />

      <LpHotelBeforeAfterMotion
        rows={content.beforeAfter}
        kicker={content.sections.beforeAfter.kicker}
        title={content.sections.beforeAfter.title}
        description={content.sections.beforeAfter.description}
      />

      <div className="bg-slate-50/90 py-6 text-center text-sm text-slate-600">
        <Container>
          置き換えの手順や想定導入事例は
          <Link
            href={content.hubBlogHref}
            className="mx-1 font-semibold text-emerald-800 underline decoration-emerald-300/80 underline-offset-2 hover:text-emerald-950"
          >
            {content.hubBlogAnchorLabel}
          </Link>
          にもまとめています。
        </Container>
      </div>

      <LpPricing
        plans={content.plans}
        freeSignupHref={ctaHref}
        hasProAnnual={hasProAnnual}
        hasBusinessAnnual={hasBusinessAnnual}
      />

      <LpFaqSection items={content.faq} variant="white" />

      <LpFinalCtaSection
        ctaHref={ctaHref}
        loginHref={loginHref}
        demoEditorHref={DEMO_EDITOR_HREF}
        title={content.sections.finalCta.title}
        description={
          <>
            {content.sections.finalCta.description}
          </>
        }
        trustPoints={content.trustPoints}
        revealIntensity="strong"
      />

      <footer className="border-t border-slate-200 bg-slate-50/80 py-8">
        <Container className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Infomii</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm sm:justify-end">
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
