import { Section } from "@/components/ui";
import { ScrollReveal, StaggerReveal } from "@/components/motion";

type Step = { step: string; title: string; desc: string };

type LpWorkflowSectionProps = {
  id?: string;
  kicker: string;
  title: string;
  description?: string;
  steps: readonly Step[];
  variant?: "white" | "muted";
};

export function LpWorkflowSection({
  id = "how-it-works",
  kicker,
  title,
  description,
  steps,
  variant = "muted",
}: LpWorkflowSectionProps) {
  return (
    <Section id={id} kicker={kicker} title={title} description={description} variant={variant} popTitle>
      <ScrollReveal>
        <StaggerReveal className="grid gap-8 sm:grid-cols-3" staggerDelay={0.1}>
          {steps.map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-100/80 transition duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-base font-bold text-emerald-700 ring-1 ring-emerald-100">
                {item.step}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
            </div>
          ))}
        </StaggerReveal>
      </ScrollReveal>
    </Section>
  );
}
