"use client";

import Link from "next/link";

export type LpHeroAudience = "personal" | "hotel";

const ITEMS: { id: LpHeroAudience; label: string; href: string }[] = [
  { id: "personal", label: "個人向け", href: "/lp/saas" },
  { id: "hotel", label: "ホテル向け", href: "/lp/business" },
];

type Props = {
  active: LpHeroAudience;
  className?: string;
  /** ヘッダー用のコンパクト表示 */
  compact?: boolean;
};

export function LpHeroAudienceSwitch({ active, className = "", compact = false }: Props) {
  const tabClass = compact
    ? "rounded-full px-2.5 py-1 text-[11px] font-semibold transition duration-200 sm:px-3 sm:py-1.5 sm:text-xs"
    : "rounded-full px-3.5 py-1.5 text-xs font-semibold transition duration-200 sm:px-4 sm:py-2 sm:text-sm";

  return (
    <div
      role="tablist"
      aria-label="向け先の切り替え"
      className={`inline-flex max-w-full rounded-full border border-slate-200/90 bg-slate-100/70 p-0.5 shadow-sm sm:p-1 ${className}`.trim()}
    >
      {ITEMS.map((item) => {
        const selected = item.id === active;
        return (
          <Link
            key={item.id}
            href={item.href}
            role="tab"
            aria-selected={selected}
            aria-current={selected ? "page" : undefined}
            className={`${tabClass} ${
              selected
                ? "bg-white text-slate-900 shadow-[0_1px_4px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/90"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
