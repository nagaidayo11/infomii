import { Card, Section } from "@/components/ui";
import { ScrollReveal, StaggerReveal } from "@/components/motion";
import { HOTEL_LP_OPERATIONS_BENEFITS } from "@/lib/lp/hotel-data";

export function LpHotelOperations() {
  return (
    <Section
      id="operations"
      kicker="現場がラクになる"
      title="「QRで作れる」より、運用が軽くなる"
      description="館内案内の更新・説明・多言語を、フロントの日常業務に馴染む形でまとめます。"
      popTitle
    >
      <ScrollReveal>
        <StaggerReveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.06}>
          {HOTEL_LP_OPERATIONS_BENEFITS.map((item) => (
            <Card
              key={item.title}
              padding="lg"
              className="rounded-2xl border border-emerald-100/80 bg-white shadow-sm ring-1 ring-slate-100/60 transition duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-emerald-200/80 motion-safe:hover:shadow-md"
            >
              <h3 className="text-base font-semibold text-emerald-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </Card>
          ))}
        </StaggerReveal>
      </ScrollReveal>
    </Section>
  );
}
