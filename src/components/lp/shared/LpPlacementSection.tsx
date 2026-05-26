import { Section } from "@/components/ui";
import { ScrollReveal, StaggerReveal } from "@/components/motion";

type Placement = { place: string; detail: string };

type LpPlacementSectionProps = {
  id: string;
  kicker: string;
  title: string;
  description: string;
  placements: readonly Placement[];
  visualTitle: string;
  visualBody: string;
  variant?: "white" | "muted";
};

export function LpPlacementSection({
  id,
  kicker,
  title,
  description,
  placements,
  visualTitle,
  visualBody,
  variant = "white",
}: LpPlacementSectionProps) {
  return (
    <Section id={id} kicker={kicker} title={title} description={description} variant={variant} popTitle>
      <ScrollReveal>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <StaggerReveal className="grid gap-3 sm:grid-cols-2" staggerDelay={0.08}>
            {placements.map((item) => (
              <div
                key={item.place}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm ring-1 ring-slate-100 transition duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md"
              >
                <p className="text-sm font-semibold text-emerald-800">{item.place}</p>
                <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
              </div>
            ))}
          </StaggerReveal>
          <div className="mx-auto flex aspect-[4/5] w-full max-w-sm flex-col items-center justify-center rounded-3xl border border-dashed border-emerald-200 bg-gradient-to-b from-emerald-50/80 to-white p-8 text-center shadow-sm">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-3xl shadow-md">
              ↗
            </div>
            <p className="mt-6 text-sm font-semibold text-slate-800">{visualTitle}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{visualBody}</p>
          </div>
        </div>
      </ScrollReveal>
    </Section>
  );
}
