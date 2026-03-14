import type { ReactNode, ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  /** Use for links styled as buttons (render as <a> when href is set) */
  href?: string;
};

const baseClass =
  "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition shadow-sm";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-slate-900 text-white hover:bg-slate-800 border border-slate-900",
  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  ghost:
    "text-slate-600 hover:bg-slate-100",
};

/**
 * SaaS landing page–aligned button.
 * rounded-xl, soft shadow, same primary (slate-900) as LP.
 */
export function Button({
  children,
  variant = "primary",
  className = "",
  href,
  type = "button",
  ...rest
}: ButtonProps) {
  const combined = baseClass + " " + variantClass[variant] + " " + className;

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
