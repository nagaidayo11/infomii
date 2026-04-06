import type { ReactNode, ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "inverted";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  /** Use for links styled as buttons (render as <a> when href is set) */
  href?: string;
};

const baseClass =
  "app-interactive inline-flex items-center justify-center rounded-ds font-semibold " +
  "transition-[transform,background-color,color,box-shadow,border-color] duration-200 ease-out " +
  "shadow-ds-sm " +
  "active:scale-[0.98] " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ds-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ds-card";

const sizeClass: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "border border-ds-primary/20 bg-ds-primary !text-white hover:bg-ds-primary-hover hover:shadow-ds-primary-glow motion-safe:hover:scale-[1.02]",
  secondary:
    "border border-ds-border bg-ds-card text-ds-foreground-secondary hover:border-ds-border-strong hover:bg-ds-bg hover:shadow-ds-sm motion-safe:hover:scale-[1.02]",
  ghost:
    "text-ds-muted shadow-none hover:bg-ds-bg hover:text-ds-foreground",
  inverted:
    "border border-ds-card bg-ds-card text-ds-foreground hover:bg-ds-bg hover:shadow-ds-md motion-safe:hover:scale-[1.02]",
};

/**
 * Product / LP 共通: ds-primary（青）とトークン上の neutrals。
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  href,
  type = "button",
  ...rest
}: ButtonProps) {
  const combined =
    baseClass +
    " " +
    sizeClass[size] +
    " " +
    variantClass[variant] +
    " " +
    className;

  if (href) {
    return (
      <a href={href} className={combined}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={combined} {...rest}>
      {children}
    </button>
  );
}
