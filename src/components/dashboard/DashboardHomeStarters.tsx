import Link from "next/link";
import type { CSSProperties } from "react";
import { buildTemplatesPath, LP_STARTER_TEMPLATE_SLUGS } from "@/lib/template-marketplace-meta";

/** Web dashboard — hotel template quick picks (BtoC categories are app-only). */
const STARTERS = [
  {
    href: buildTemplatesPath("business", LP_STARTER_TEMPLATE_SLUGS.hotel),
    image: "/templates/previews/business/hotel-guest-guide.jpg",
    kicker: "宿泊",
    title: "ゲスト案内",
    body: "Wi-Fi・朝食・館内案内",
  },
  {
    href: buildTemplatesPath("ryokan"),
    image: "/templates/previews/ryokan/case-onsen-ryokan.jpg",
    kicker: "旅館",
    title: "おもてなし案内",
    body: "温泉・食事・館内の流れ",
  },
  {
    href: buildTemplatesPath("inbound"),
    image: "/templates/previews/inbound/hotel-inbound-multilingual.jpg",
    kicker: "多言語",
    title: "インバウンド",
    body: "英語・中国語ゲスト向け",
  },
] as const;

/** Web dashboard — template quick picks when starting from zero. */
export function DashboardHomeStarters() {
  return (
    <section className="saas-card overflow-hidden">
      <div className="flex items-end justify-between gap-2 border-b border-[#e6e8eb] px-4 py-3 sm:px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">テンプレから始める</p>
          <h2 className="mt-0.5 text-sm font-semibold text-slate-900">施設に近い型を選ぶ</h2>
        </div>
        <Link href="/templates?category=business" className="text-xs font-medium text-slate-500 hover:text-slate-800">
          すべて
        </Link>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
        {STARTERS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative overflow-hidden rounded-xl border border-[#e6e8eb] bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
            style={
              {
                backgroundImage: `linear-gradient(to top, rgb(15 23 42 / 0.72), rgb(15 23 42 / 0.2)), url(${item.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              } as CSSProperties
            }
          >
            <span className="inline-flex rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-800">
              {item.kicker}
            </span>
            <p className="mt-8 text-base font-semibold text-white">{item.title}</p>
            <p className="mt-0.5 text-xs text-white/85">{item.body}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
