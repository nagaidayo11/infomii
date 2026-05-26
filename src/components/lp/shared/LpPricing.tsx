import { Section } from "@/components/ui";
import { ScrollReveal, StaggerReveal } from "@/components/motion";
import { LpPricingCard, LpPricingCompareLink } from "@/components/lp/shared/LpPricingCard";
import { LpPricingDetails } from "@/components/lp/shared/LpPricingDetails";
import type { LpPlanDefinition } from "@/lib/lp/plans";

type LpPricingProps = {
  plans: LpPlanDefinition[];
  freeSignupHref: string;
  hasProAnnual?: boolean;
  hasBusinessAnnual?: boolean;
  title?: string;
  description?: string;
  compareHint?: string;
};

export function LpPricing({
  plans,
  freeSignupHref,
  hasProAnnual,
  hasBusinessAnnual,
  title = "安心して、無料から始められます",
  description = "比較表より先に、まず1ページ作って試す。それが一番確実です。",
  compareHint,
}: LpPricingProps) {
  return (
    <Section id="pricing" kicker="料金" title={title} description={description} variant="muted" popTitle>
      <ScrollReveal>
        <StaggerReveal className="grid gap-6 lg:grid-cols-3 lg:items-stretch" staggerDelay={0.1}>
          {plans.map((plan) => (
            <LpPricingCard
              key={plan.id}
              plan={plan}
              freeSignupHref={freeSignupHref}
              hasProAnnual={plan.id === "pro" ? hasProAnnual : undefined}
              hasBusinessAnnual={plan.id === "business" ? hasBusinessAnnual : undefined}
            />
          ))}
        </StaggerReveal>

        <LpPricingCompareLink hint={compareHint} />

        <LpPricingDetails
          freeSignupHref={freeSignupHref}
          hasProAnnual={hasProAnnual}
          hasBusinessAnnual={hasBusinessAnnual}
        />
      </ScrollReveal>
    </Section>
  );
}
