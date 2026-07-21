"use client";

type LpTrustStripProps = {
  points: readonly string[];
};

export function LpTrustStrip({ points }: LpTrustStripProps) {
  return (
    <div className="border-b border-emerald-100/80 bg-gradient-to-r from-emerald-50/90 via-white to-teal-50/70 py-5">
      <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-0.5 px-4 text-sm font-medium text-slate-700 sm:gap-x-10">
        {points.map((point) => (
          <li key={point} className="inline-flex items-center gap-2 py-1">
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200/80"
              aria-hidden
            >
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
