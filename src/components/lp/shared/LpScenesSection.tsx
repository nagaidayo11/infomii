import { Section } from "@/components/ui";
import { ScrollReveal } from "@/components/motion";

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
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
          {scenes.map((scene) => (
            <span
              key={scene}
              className="inline-flex min-h-[44px] items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-100 transition duration-200 motion-safe:hover:border-emerald-200 motion-safe:hover:bg-emerald-50/50"
            >
              {scene}
            </span>
          ))}
        </div>
        <ul className="mx-auto mt-10 grid max-w-3xl gap-3 text-sm text-slate-600 sm:grid-cols-2">
          {bullets.map((line) => (
            <li key={line} className="flex items-start gap-2 rounded-xl bg-white/80 px-3 py-2 ring-1 ring-slate-100">
              <span className="mt-0.5 text-emerald-600" aria-hidden>
                ✓
              </span>
              {line}
            </li>
          ))}
        </ul>
      </ScrollReveal>
    </Section>
  );
}
