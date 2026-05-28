import Image from "next/image";
import { Section } from "@/components/ui";
import { ScrollReveal, StaggerReveal } from "@/components/motion";

type Placement = { place: string; detail: string };

type LpPlacementSectionProps = {
  id: string;
  kicker: string;
  title: string;
  description: string;
  placements: readonly Placement[];
  visualTitle: string;
  visualBody: string;
  visualImageSrc?: string;
  visualImageAlt?: string;
  visualMode?: "preview" | "flow";
  hidePlacements?: boolean;
  variant?: "white" | "muted";
};

export function LpPlacementSection({
  id,
  kicker,
  title,
  description,
  placements,
  visualTitle,
  visualBody,
  visualImageSrc,
  visualImageAlt,
  visualMode = "preview",
  hidePlacements = false,
  variant = "white",
}: LpPlacementSectionProps) {
  const isFlowWide = visualMode === "flow" && hidePlacements;
  return (
    <Section id={id} kicker={kicker} title={title} description={description} variant={variant} popTitle>
      <ScrollReveal>
        <div className={isFlowWide ? "grid gap-8" : "grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center"}>
          {!hidePlacements ? (
            <StaggerReveal className="grid gap-3 sm:grid-cols-2" staggerDelay={0.08}>
              {placements.map((item) => (
                <div
                  key={item.place}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm ring-1 ring-slate-100 transition duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md"
                >
                  <p className="text-sm font-semibold text-emerald-800">{item.place}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                </div>
              ))}
            </StaggerReveal>
          ) : null}
          <div className={isFlowWide ? "mx-auto w-full max-w-5xl rounded-3xl border border-emerald-200 bg-gradient-to-b from-emerald-50/80 to-white p-5 shadow-sm" : "mx-auto aspect-[4/5] w-full max-w-sm rounded-3xl border border-emerald-200 bg-gradient-to-b from-emerald-50/80 to-white p-4 shadow-sm"}>
            <div className="flex h-full flex-col rounded-[1.4rem] border border-slate-200 bg-white p-3 shadow-inner">
              {visualMode === "flow" ? (
                <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <svg viewBox="0 0 720 260" className="h-auto w-full" aria-label="URL・QR・SNSの共有フロー図" role="img">
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                      </marker>
                    </defs>

                    <line x1="230" y1="132" x2="396" y2="66" stroke="#94a3b8" strokeWidth="3" markerEnd="url(#arrow)" />
                    <line x1="238" y1="132" x2="404" y2="130" stroke="#94a3b8" strokeWidth="3" markerEnd="url(#arrow)" />
                    <line x1="230" y1="132" x2="396" y2="194" stroke="#94a3b8" strokeWidth="3" markerEnd="url(#arrow)" />

                    <rect x="40" y="60" rx="16" ry="16" width="208" height="146" fill="#ecfdf5" stroke="#34d399" strokeWidth="2" />
                    <text x="144" y="98" textAnchor="middle" fontSize="22" fill="#065f46" fontWeight="700">
                      Infomii
                    </text>
                    <text x="144" y="126" textAnchor="middle" fontSize="18" fill="#047857">
                      1リンク
                    </text>
                    <text x="144" y="154" textAnchor="middle" fontSize="13" fill="#0f766e">
                      旅行のしおり
                    </text>
                    <text x="144" y="182" textAnchor="middle" fontSize="11.2" fill="#334155">
                      日程・MAP・持ち物をまとめて
                    </text>

                    <rect x="410" y="24" rx="14" ry="14" width="270" height="66" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
                    <circle cx="438" cy="48" r="13" fill="#06C755" />
                    <path d="M438 40.7c-3.9 0-6.7 2.3-6.7 5.4 0 2.7 2.2 4.8 5.2 5.3l.2 2.7 2.3-2.4c3.3-.1 5.8-2.3 5.8-5.5 0-3.1-2.8-5.5-6.8-5.5z" fill="#ffffff" />
                    <text x="556" y="52" textAnchor="middle" fontSize="15" fill="#0f172a" fontWeight="700">
                      LINE / DM
                    </text>
                    <text x="556" y="73" textAnchor="middle" fontSize="13" fill="#475569">
                      URLひとつで予定とリンクを渡す
                    </text>

                    <rect x="410" y="98" rx="14" ry="14" width="270" height="66" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
                    <defs>
                      <radialGradient id="igBrand" cx="0.3" cy="1" r="1.2">
                        <stop offset="0" stopColor="#FEDA75" />
                        <stop offset="0.36" stopColor="#FA7E1E" />
                        <stop offset="0.66" stopColor="#D62976" />
                        <stop offset="1" stopColor="#4F5BD5" />
                      </radialGradient>
                      <linearGradient id="igShine" x1="425" y1="109" x2="451" y2="135" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#FEDA75" />
                        <stop offset="1" stopColor="#D62976" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <rect x="425" y="109" width="26" height="26" rx="8" fill="url(#igBrand)" />
                    <rect x="425" y="109" width="26" height="26" rx="8" fill="url(#igShine)" />
                    <rect x="431.4" y="115.4" width="13.2" height="13.2" rx="4.2" fill="none" stroke="#ffffff" strokeWidth="1.8" />
                    <circle cx="438" cy="122" r="3.2" fill="none" stroke="#ffffff" strokeWidth="1.8" />
                    <circle cx="443.8" cy="116.2" r="1.2" fill="#ffffff" />
                    <text x="556" y="126" textAnchor="middle" fontSize="15" fill="#0f172a" fontWeight="700">
                      Instagram
                    </text>
                    <text x="556" y="147" textAnchor="middle" fontSize="13" fill="#475569">
                      プロフィールに1リンクを置く
                    </text>

                    <rect x="410" y="172" rx="14" ry="14" width="270" height="66" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
                    <circle cx="438" cy="196" r="13" fill="#ffffff" stroke="#2563eb" strokeWidth="2.2" />
                    <path d="M438 189.4c-3.6 0-6.6 2.9-6.6 6.6 0 4.4 6.6 9.8 6.6 9.8s6.6-5.4 6.6-9.8c0-3.7-3-6.6-6.6-6.6z" fill="#2563eb" />
                    <circle cx="438" cy="196" r="2" fill="#ffffff" />
                    <text x="556" y="200" textAnchor="middle" fontSize="15" fill="#0f172a" fontWeight="700">
                      イベント会場
                    </text>
                    <text x="556" y="221" textAnchor="middle" fontSize="13" fill="#475569">
                      QR掲示で当日案内を統一
                    </text>
                  </svg>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                    <span className="h-2 w-2 rounded-full bg-slate-300" aria-hidden />
                    <span className="h-2 w-2 rounded-full bg-slate-300" aria-hidden />
                    <span className="ml-2 text-[10px] font-medium text-slate-500">infomii.com/plan</span>
                  </div>

                  <div className="relative mb-3 h-36 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    {visualImageSrc ? (
                      <Image
                        src={visualImageSrc}
                        alt={visualImageAlt ?? visualTitle}
                        fill
                        sizes="(max-width: 1024px) 340px, 380px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-500">プレビュー</div>
                    )}
                  </div>
                </>
              )}

              <p className="text-sm font-semibold text-slate-800">{visualTitle}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{visualBody}</p>

              <div className="mt-auto pt-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
                  <span>URL / QR / SNS</span>
                  <span aria-hidden>→</span>
                  <span>すぐ共有</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </Section>
  );
}
