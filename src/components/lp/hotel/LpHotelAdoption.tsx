import { Section } from "@/components/ui";
import { ScrollReveal } from "@/components/motion";
import { HOTEL_LP_PROPERTY_TYPES } from "@/lib/lp/hotel-data";

export function LpHotelAdoption() {
  return (
    <Section
      id="properties"
      kicker="導入イメージ"
      title="ホテル・旅館・民泊の現場向け"
      description="大規模チェーンでなくても、少人数のフロント運用から始められます。"
      variant="muted"
      popTitle
    >
      <ScrollReveal>
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
          {HOTEL_LP_PROPERTY_TYPES.map((type) => (
            <span
              key={type}
              className="inline-flex min-h-[44px] items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-100 transition duration-200 motion-safe:hover:border-emerald-200 motion-safe:hover:bg-emerald-50/50"
            >
              {type}
            </span>
          ))}
        </div>
        <ul className="mx-auto mt-10 grid max-w-3xl gap-3 text-sm text-slate-600 sm:grid-cols-2">
          {[
            "フロント・館内案内・Wi-Fi・朝食",
            "チェックアウト・FAQ・多言語（Business）",
            "客室QR・共有URL・下書き公開",
            "テンプレから最短数分で公開",
          ].map((line) => (
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
