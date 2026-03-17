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
  "inline-flex items-center justify-center rounded-xl font-semibold " +
  "transition-[transform,background-color,color,box-shadow,border-color] duration-200 ease-out " +
  "shadow-sm " +
  "active:scale-[0.98] " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const sizeClass: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-slate-900 !text-white border border-slate-900 hover:bg-slate-800 hover:shadow-[0_2px_8px_rgba(15,23,42,0.2)] motion-safe:hover:scale-[1.02]",
  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm motion-safe:hover:scale-[1.02]",
  ghost:
    "text-slate-600 shadow-none hover:bg-slate-100 hover:text-slate-900",
  inverted:
    "bg-white text-slate-900 border border-white hover:bg-slate-100 hover:shadow-md motion-safe:hover:scale-[1.02]",
};

/**
 * SaaS landing page–aligned button.
 * rounded-xl, soft shadow, same primary (slate-900) as LP.
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
