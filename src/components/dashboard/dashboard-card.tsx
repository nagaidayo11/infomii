import type { ReactNode } from "react";

type DashboardCardProps = {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
};

const paddingClass = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

/**
 * SaaS LP–aligned card: rounded-xl, light border, soft shadow.
 */
export function DashboardCard({
  children,
  className = "",
  padding = "md",
}: DashboardCardProps) {
  return (
    <div
      className={
        "app-interactive app-page-enter rounded-xl border border-slate-200/80 bg-white " +
        "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.02)] " +
        "transition-[box-shadow,border-color] duration-200 ease-out " +
        paddingClass[padding] +
        " " +
        className
      }
    >
      {children}
    </div>
  );
}

type DashboardCardHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function DashboardCardHeader({
  title,
  description,
  action,
}: DashboardCardHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

type StatTileProps = {
  label: string;
  value: string | number;
  sub?: string;
};

export function DashboardStatTile({ label, value, sub }: StatTileProps) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-3 transition-colors duration-200 hover:border-slate-200/80 hover:bg-slate-50">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
