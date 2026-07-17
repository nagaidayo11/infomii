"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type AppOptionCardProps = {
  label: string;
  hint?: string;
  selected?: boolean;
  /** Optional visual preview (e.g. 2-col / 3-col icon) */
  preview?: ReactNode;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

/** Selectable card used for column count, layout options, etc. */
export function AppOptionCard({
  label,
  hint,
  selected = false,
  preview,
  className = "",
  type = "button",
  ...rest
}: AppOptionCardProps) {
  return (
    <button
      type={type}
      role="radio"
      aria-checked={selected}
      className={
        "app-option-card ui-pop-tap " +
        (selected ? "app-option-card--selected " : "") +
        className
      }
      {...rest}
    >
      <div className="flex w-full items-start gap-2">
        {preview ? <div className="shrink-0 text-[var(--app-accent)]">{preview}</div> : null}
        <div className="min-w-0 flex-1">
          <p className="app-option-card__label">{label}</p>
          {hint ? <p className="app-option-card__hint mt-0.5">{hint}</p> : null}
        </div>
        <span className="app-option-card__radio" aria-hidden />
      </div>
    </button>
  );
}

type AppOptionCardRowProps = {
  children: ReactNode;
  className?: string;
  role?: "radiogroup";
  "aria-label"?: string;
};

export function AppOptionCardRow({
  children,
  className = "",
  role = "radiogroup",
  "aria-label": ariaLabel,
}: AppOptionCardRowProps) {
  return (
    <div className={"app-option-card-row " + className} role={role} aria-label={ariaLabel}>
      {children}
    </div>
  );
}
