"use client";

import { Section } from "@/components/ui";
import { ScrollReveal, StaggerReveal } from "@/components/motion";

type Row = { before: string; after: string };

type LpBeforeAfterSectionProps = {
  id?: string;
  kicker: string;
  title: string;
  description: string;
  rows: readonly Row[];
  variant?: "white" | "muted";
};

export function LpBeforeAfterSection({
  id = "before-after",
  kicker,
  title,
  description,
  rows,
  variant = "white",
}: LpBeforeAfterSectionProps) {
  return (
    <Section id={id} kicker={kicker} title={title} description={description} variant={variant} popTitle>
      <ScrollReveal>
        <StaggerReveal className="grid gap-4" staggerDelay={0.09}>
          {rows.map((row, index) => (
            <div
              key={row.before}
              className="lp-metric group grid overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100 transition duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md sm:grid-cols-[1fr_auto_1fr]"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="border-b border-slate-100 bg-slate-50/90 px-5 py-4 sm:border-b-0 sm:border-r">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Before</p>
                <p className="mt-2 text-sm font-medium text-slate-600">{row.before}</p>
              </div>
              <div className="hidden items-center justify-center bg-gradient-to-b from-slate-50 to-emerald-50/40 px-2 sm:flex" aria-hidden>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200 transition duration-300 group-hover:scale-110">
                  →
                </span>
              </div>
              <div className="bg-emerald-50/60 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">After</p>
                <p className="mt-2 text-sm font-semibold text-emerald-900">{row.after}</p>
              </div>
            </div>
          ))}
        </StaggerReveal>
      </ScrollReveal>
    </Section>
  );
}
