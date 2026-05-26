import { Section } from "@/components/ui";
import { ScrollReveal, StaggerReveal } from "@/components/motion";
import { HOTEL_LP_QR_PLACEMENTS } from "@/lib/lp/hotel-data";

export function LpHotelQrPlacement() {
  return (
    <Section
      id="qr-placement"
      kicker="QR設置"
      title="置き場所は、いつもの導線でOK"
      description="客室・フロント・館内の見える場所にQRを置くだけ。案内の入口を1つにそろえます。"
      popTitle
    >
      <ScrollReveal>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <StaggerReveal className="grid gap-3 sm:grid-cols-2" staggerDelay={0.08}>
            {HOTEL_LP_QR_PLACEMENTS.map((item) => (
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
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white shadow-md">
              <div className="grid grid-cols-4 gap-1 p-2">
                {Array.from({ length: 16 }).map((_, i) => (
                  <span key={i} className={`h-2 w-2 rounded-sm ${i % 3 === 0 ? "bg-slate-900" : "bg-slate-200"}`} />
                ))}
              </div>
            </div>
            <p className="mt-6 text-sm font-semibold text-slate-800">QR → スマホで館内案内</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Wi-Fi・朝食・FAQ・チェックアウトを、ひとつのURLに集約
            </p>
          </div>
        </div>
      </ScrollReveal>
    </Section>
  );
}
