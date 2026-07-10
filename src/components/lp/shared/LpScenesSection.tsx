"use client";

import { Section } from "@/components/ui";
import { ScrollReveal, StaggerReveal } from "@/components/motion";

type LpScenesSectionProps = {
  id: string;
  kicker: string;
  title: string;
  description: string;
  scenes: readonly string[];
  bullets: readonly string[];
  variant?: "white" | "muted";
};

export function LpScenesSection({
  id,
  kicker,
  title,
  description,
  scenes,
  bullets,
  variant = "muted",
}: LpScenesSectionProps) {
  return (
    <Section id={id} kicker={kicker} title={title} description={description} variant={variant} popTitle>
      <ScrollReveal>
        <StaggerReveal className="flex flex-wrap justify-center gap-2.5 sm:gap-3" staggerDelay={0.05}>
          {scenes.map((scene) => (
            <span
              key={scene}
              className="inline-flex min-h-[44px] items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-100 transition duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-emerald-200 motion-safe:hover:bg-emerald-50/50 motion-safe:hover:shadow-md"
            >
              {scene}
            </span>
          ))}
        </StaggerReveal>
        <StaggerReveal className="mx-auto mt-10 grid max-w-3xl gap-3 text-sm text-slate-600 sm:grid-cols-2" staggerDelay={0.07}>
          {bullets.map((line) => (
            <div
              key={line}
              className="flex items-start gap-2 rounded-xl bg-white/90 px-3 py-2.5 ring-1 ring-slate-100 transition duration-200 motion-safe:hover:ring-emerald-200/70"
            >
              <span className="mt-0.5 text-emerald-600" aria-hidden>
                ✓
              </span>
              {line}
            </div>
          ))}
        </StaggerReveal>
      </ScrollReveal>
    </Section>
  );
}
