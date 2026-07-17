"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type AppChipProps = {
  children: ReactNode;
  active?: boolean;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

/** Pill chip for category filters (誰が何やるか, etc.). */
export function AppChip({
  children,
  active = false,
  className = "",
  type = "button",
  ...rest
}: AppChipProps) {
  return (
    <button
      type={type}
      className={
        "app-chip ui-pop-tap " + (active ? "app-chip--active " : "") + className
      }
      aria-pressed={active}
      {...rest}
    >
      {children}
    </button>
  );
}
