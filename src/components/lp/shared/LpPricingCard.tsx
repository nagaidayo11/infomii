"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { CheckoutButton } from "@/components/lp/CheckoutButton";
import { PLAN_PRICE_DISPLAY } from "@/lib/plan-pricing";
import type { LpPlanDefinition } from "@/lib/lp/plans";

type LpPricingCardProps = {
  plan: LpPlanDefinition;
  freeSignupHref: string;
  hasProAnnual?: boolean;
  hasBusinessAnnual?: boolean;
};

export function LpPricingCard({ plan, freeSignupHref, hasProAnnual, hasBusinessAnnual }: LpPricingCardProps) {
  const isFree = plan.id === "free";
  const isPro = plan.id === "pro";
  const isBusiness = plan.id === "business";

  const shellClass = [
    "flex h-full flex-col rounded-3xl border p-6 sm:p-8 transition duration-300 motion-safe:hover:-translate-y-1",
    plan.highlighted
      ? "border-2 border-emerald-400 bg-gradient-to-b from-emerald-50/90 to-white shadow-lg shadow-emerald-100/40 ring-1 ring-emerald-200/60 sm:scale-[1.02]"
      : plan.recommended
        ? "border border-emerald-200 bg-white shadow-md ring-1 ring-emerald-100 motion-safe:hover:shadow-lg"
        : "border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100 motion-safe:hover:shadow-md",
  ].join(" ");

  return (
    <article className={shellClass} aria-label={`${plan.name}プラン`}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{plan.name}</p>
        {plan.highlighted ? (
          <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold text-white">まずはここから</span>
        ) : null}
        {plan.recommended ? (
          <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-bold text-white">おすすめ</span>
        ) : null}
      </div>

      <p className="mt-3 text-sm font-medium text-slate-600">{plan.tagline}</p>

      <p className="mt-4 flex items-baseline gap-1">
        <span
          className={
            plan.highlighted
              ? "text-4xl font-extrabold tracking-tight text-emerald-700 sm:text-5xl"
              : "text-3xl font-bold text-slate-900 sm:text-4xl"
          }
        >
          {plan.priceLabel}
        </span>
        {plan.priceSuffix ? <span className="text-base font-medium text-slate-500">{plan.priceSuffix}</span> : null}
      </p>

      <ul className="mt-6 flex-1 space-y-2.5 text-sm text-slate-700">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span className="shrink-0 text-emerald-600" aria-hidden>
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-2">
        {isFree ? (
          <Button
            href={freeSignupHref}
            size="lg"
            className="min-h-[52px] w-full !border-emerald-700 !bg-emerald-600 !text-base !text-white hover:!bg-emerald-700"
          >
            {plan.ctaLabel}
          </Button>
        ) : isPro ? (
          <>
            <CheckoutButton
              plan="pro"
              variant="secondary"
              className="min-h-[52px] w-full !text-base"
            >
              {plan.ctaLabel}
              {hasProAnnual ? "（月払い）" : ""}
            </CheckoutButton>
            {hasProAnnual ? (
              <CheckoutButton plan="pro" interval="yearly" variant="secondary" className="min-h-[44px] w-full">
                {PLAN_PRICE_DISPLAY.pro.annualButton}
              </CheckoutButton>
            ) : null}
          </>
        ) : isBusiness ? (
          <>
            <CheckoutButton
              plan="business"
              variant="secondary"
              className="min-h-[52px] w-full !text-base"
              adaptiveBusinessCta
              showUpgradeHint
            >
              {plan.ctaLabel}
            </CheckoutButton>
            {hasBusinessAnnual ? (
              <CheckoutButton plan="business" interval="yearly" variant="secondary" className="min-h-[44px] w-full">
                {PLAN_PRICE_DISPLAY.business.annualButton}
              </CheckoutButton>
            ) : null}
          </>
        ) : null}

        {plan.footnote ? <p className="text-center text-xs text-slate-500">{plan.footnote}</p> : null}
      </div>
    </article>
  );
}

export function LpPricingCompareLink({ hint = "迷ったらまず無料登録から" }: { hint?: string }) {
  return (
    <p className="mt-6 text-center text-sm text-slate-600">
      <Link
        href="#pricing-details"
        className="font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-800"
      >
        機能の詳細比較を見る
      </Link>
      <span className="mx-2 text-slate-300" aria-hidden>
        ·
      </span>
      {hint}
    </p>
  );
}
