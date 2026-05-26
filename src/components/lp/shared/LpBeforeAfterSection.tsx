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
        <StaggerReveal className="grid gap-4" staggerDelay={0.08}>
          {rows.map((row) => (
            <div
              key={row.before}
              className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100 sm:grid-cols-2"
            >
              <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:border-b-0 sm:border-r">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Before</p>
                <p className="mt-2 text-sm font-medium text-slate-600">{row.before}</p>
              </div>
              <div className="bg-emerald-50/50 px-5 py-4">
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
