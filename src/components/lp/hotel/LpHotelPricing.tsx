import { Section } from "@/components/ui";
import { ScrollReveal, StaggerReveal } from "@/components/motion";
import { HOTEL_PLANS } from "@/lib/lp/hotel-data";
import { LpHotelPricingCard, LpHotelPricingCompareLink } from "@/components/lp/hotel/LpHotelPricingCard";
import { LpHotelPricingDetails } from "@/components/lp/hotel/LpHotelPricingDetails";

type LpHotelPricingProps = {
  freeSignupHref: string;
  hasProAnnual?: boolean;
  hasBusinessAnnual?: boolean;
};

export function LpHotelPricing({ freeSignupHref, hasProAnnual, hasBusinessAnnual }: LpHotelPricingProps) {
  return (
    <Section
      id="pricing"
      kicker="料金"
      title="安心して、無料から始められます"
      description="比較表より先に、まず1ページ作って現場で試す。それが一番確実です。"
      variant="muted"
      popTitle
    >
      <ScrollReveal>
        <StaggerReveal className="grid gap-6 lg:grid-cols-3 lg:items-stretch" staggerDelay={0.1}>
          {HOTEL_PLANS.map((plan) => (
            <LpHotelPricingCard
              key={plan.id}
              plan={plan}
              freeSignupHref={freeSignupHref}
              hasProAnnual={plan.id === "pro" ? hasProAnnual : undefined}
            />
          ))}
        </StaggerReveal>

        <LpHotelPricingCompareLink />

        <LpHotelPricingDetails
          freeSignupHref={freeSignupHref}
          hasProAnnual={hasProAnnual}
          hasBusinessAnnual={hasBusinessAnnual}
        />
      </ScrollReveal>
    </Section>
  );
}
