import { Section } from "@/components/ui";
import { ScrollReveal } from "@/components/motion";

type FaqRow = { q: string; a: string };

type LpFaqSectionProps = {
  items: readonly FaqRow[];
  variant?: "white" | "muted";
};

export function LpFaqSection({ items, variant = "white" }: LpFaqSectionProps) {
  return (
    <Section id="faq" kicker="FAQ" title="よくある質問" variant={variant} popTitle>
      <ScrollReveal>
        <div className="mx-auto max-w-3xl space-y-3">
          {items.map((row) => (
            <details
              key={row.q}
              className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm ring-1 ring-slate-100 transition duration-200 motion-safe:hover:border-emerald-200/60 motion-safe:hover:shadow-md open:border-emerald-200/50"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                <span className="inline-flex w-full items-center justify-between gap-4">
                  {row.q}
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{row.a}</p>
            </details>
          ))}
        </div>
      </ScrollReveal>
    </Section>
  );
}
