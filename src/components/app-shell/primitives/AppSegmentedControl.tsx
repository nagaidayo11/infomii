"use client";

export type AppSegmentOption = {
  id: string;
  label: string;
};

type AppSegmentedControlProps = {
  options: readonly AppSegmentOption[];
  value: string;
  onChange: (id: string) => void;
  /** Accessible label for the tablist */
  ariaLabel?: string;
  className?: string;
};

export function AppSegmentedControl({
  options,
  value,
  onChange,
  ariaLabel = "カテゴリ",
  className = "",
}: AppSegmentedControlProps) {
  return (
    <div
      className={"app-segmented -mx-4 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden " + className}
      role="tablist"
      aria-label={ariaLabel}
    >
      <div className="flex w-max min-w-full gap-1 sm:w-auto sm:flex-wrap">
        {options.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(opt.id)}
              className={
                "app-segmented-item ui-pop-tap shrink-0 " + (active ? "app-segmented-item--active" : "")
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
