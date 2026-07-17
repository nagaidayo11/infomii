import type { ReactNode } from "react";
import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  /** Primary CTA — button or link node */
  action?: ReactNode;
  /** Optional secondary link under the action */
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
  compact?: boolean;
};

/**
 * Quiet empty / onboarding state for web SaaS screens (no emoji).
 */
export function EmptyState({
  title,
  description,
  action,
  secondaryHref,
  secondaryLabel,
  className = "",
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={
        "rounded-lg border border-dashed border-[#e6e8eb] bg-slate-50/60 text-center " +
        (compact ? "px-5 py-8" : "px-6 py-12") +
        (className ? ` ${className}` : "")
      }
    >
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">{description}</p>
      {action ? <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{action}</div> : null}
      {secondaryHref && secondaryLabel ? (
        <p className="mt-3">
          <Link href={secondaryHref} className="text-sm font-medium text-slate-600 hover:text-slate-900">
            {secondaryLabel}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
