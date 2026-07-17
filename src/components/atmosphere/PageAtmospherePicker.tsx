"use client";

import {
  PAGE_ATMOSPHERE_OPTIONS,
  type PageAtmosphereId,
} from "@/lib/page-atmosphere";

type PageAtmospherePickerProps = {
  value: PageAtmosphereId;
  onChange: (id: PageAtmosphereId) => void;
};

/** Compact chips for soft guest-page atmosphere motifs. */
export function PageAtmospherePicker({ value, onChange }: PageAtmospherePickerProps) {
  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-sm font-semibold text-slate-700">ページの雰囲気</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          ゲストページ背景に、控えめなイラストを添えます。
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {PAGE_ATMOSPHERE_OPTIONS.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={
                "rounded-lg border px-3 py-2.5 text-left transition " +
                (selected
                  ? "border-teal-500/70 bg-teal-50/80 ring-1 ring-teal-400/40"
                  : "border-slate-200 bg-white hover:bg-slate-50")
              }
              aria-pressed={selected}
            >
              <span className="block text-sm font-medium text-slate-800">{opt.label}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{opt.hint}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
