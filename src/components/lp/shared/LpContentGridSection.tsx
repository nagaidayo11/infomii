"use client";

import { Section } from "@/components/ui";
import { ScrollReveal, StaggerReveal } from "@/components/motion";

type Item = { title: string; body: string };

type LpContentGridSectionProps = {
  id: string;
  kicker: string;
  title: string;
  description: string;
  items: readonly Item[];
  variant?: "white" | "muted";
  titleAccent?: boolean;
  revealIntensity?: "subtle" | "default" | "strong";
};

export function LpContentGridSection({
  id,
  kicker,
  title,
  description,
  items,
  variant = "white",
  titleAccent = false,
  revealIntensity = "default",
}: LpContentGridSectionProps) {
  return (
    <Section id={id} kicker={kicker} title={title} description={description} variant={variant} popTitle>
      <ScrollReveal intensity={revealIntensity}>
        <StaggerReveal
          className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3"
          itemClassName="h-full"
          staggerDelay={0.08}
        >
          {items.map((item, index) => (
            <div
              key={item.title}
              className={
                "group flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm ring-1 transition duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md sm:p-6 " +
                (titleAccent
                  ? "border-emerald-100/80 ring-slate-100/60 motion-safe:hover:border-emerald-200/80"
                  : "border-slate-200/90 ring-slate-100/80")
              }
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100 transition duration-300 group-hover:scale-110 group-hover:bg-emerald-100">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className={`text-base font-semibold ${titleAccent ? "text-emerald-900" : "text-slate-900"}`}>
                {item.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </div>
          ))}
        </StaggerReveal>
      </ScrollReveal>
    </Section>
  );
}
