import { Section } from "@/components/ui";
import { ScrollReveal, StaggerReveal } from "@/components/motion";
import { HOTEL_LP_BEFORE_AFTER } from "@/lib/lp/hotel-data";

export function LpHotelBeforeAfter() {
  return (
    <Section
      id="before-after"
      kicker="Before / After"
      title="運用の変化が、現場に伝わる"
      description="派手な機能より、日々の案内業務がどう軽くなるかを重視しています。"
      popTitle
    >
      <ScrollReveal>
        <StaggerReveal className="grid gap-4" staggerDelay={0.08}>
          {HOTEL_LP_BEFORE_AFTER.map((row) => (
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
