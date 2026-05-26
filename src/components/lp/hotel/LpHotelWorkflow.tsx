import { Section } from "@/components/ui";
import { ScrollReveal, StaggerReveal } from "@/components/motion";
import { HOTEL_LP_WORKFLOW_STEPS } from "@/lib/lp/hotel-data";

export function LpHotelWorkflow() {
  return (
    <Section
      id="how-it-works"
      kicker="操作の流れ"
      title="3ステップで、今日から案内を統一"
      description="難しい設定は不要。テンプレ選びからQR設置まで、現場目線で進められます。"
      variant="muted"
      popTitle
    >
      <ScrollReveal>
        <StaggerReveal className="grid gap-8 sm:grid-cols-3" staggerDelay={0.1}>
          {HOTEL_LP_WORKFLOW_STEPS.map((item) => (
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
