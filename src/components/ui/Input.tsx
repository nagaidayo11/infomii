"use client";

import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const baseClass =
  "w-full rounded-xl border border-ds-border bg-ds-card px-3 py-2 text-sm text-slate-800 outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-slate-400 focus:border-ds-primary focus:ring-2 focus:ring-ds-primary/20 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]";

/**
 * Modern SaaS input. rounded-xl, soft focus ring.
 */
export function Input({ label, error, className = "", id, ...rest }: InputProps) {
  const inputId = id ?? label?.replace(/\s/g, "-").toLowerCase();
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-medium text-slate-500">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={baseClass + " " + (error ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 " : "") + className}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
