import { Card, Section } from "@/components/ui";
import { ScrollReveal, StaggerReveal } from "@/components/motion";
import { HOTEL_LP_PAIN_POINTS } from "@/lib/lp/hotel-data";

export function LpHotelPainPoints() {
  return (
    <Section
      id="pain-points"
      kicker="現場の悩み"
      title="フロントが抱える、いつもの負担"
      description="紙・口頭・多言語のばらつきが、忙しい現場の負荷になっていませんか。"
      variant="muted"
      popTitle
    >
      <ScrollReveal>
        <StaggerReveal className="grid gap-4 sm:grid-cols-3" staggerDelay={0.08}>
          {HOTEL_LP_PAIN_POINTS.map((item) => (
            <Card
              key={item.title}
              padding="lg"
              className="rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80 transition duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md"
            >
              <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </Card>
          ))}
        </StaggerReveal>
      </ScrollReveal>
    </Section>
  );
}
