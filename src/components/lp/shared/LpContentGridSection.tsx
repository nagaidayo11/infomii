import { Card, Section } from "@/components/ui";
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
};

export function LpContentGridSection({
  id,
  kicker,
  title,
  description,
  items,
  variant = "white",
  titleAccent = false,
}: LpContentGridSectionProps) {
  return (
    <Section id={id} kicker={kicker} title={title} description={description} variant={variant} popTitle>
      <ScrollReveal>
        <StaggerReveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.06}>
          {items.map((item) => (
            <Card
              key={item.title}
              padding="lg"
              className={
                "rounded-2xl border bg-white shadow-sm ring-1 transition duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md " +
                (titleAccent
                  ? "border-emerald-100/80 ring-slate-100/60 motion-safe:hover:border-emerald-200/80"
                  : "border-slate-200/90 ring-slate-100/80")
              }
            >
              <h3 className={`text-base font-semibold ${titleAccent ? "text-emerald-900" : "text-slate-900"}`}>
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </Card>
          ))}
        </StaggerReveal>
      </ScrollReveal>
    </Section>
  );
}
