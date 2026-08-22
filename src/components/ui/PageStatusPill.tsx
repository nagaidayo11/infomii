type PageStatusPillProps = {
  status: "draft" | "published";
  className?: string;
};

/** Unified draft / published badge for SaaS lists. */
export function PageStatusPill({ status, className = "" }: PageStatusPillProps) {
  const published = status === "published";
  return (
    <span
      className={
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none " +
        (published
          ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80"
          : "bg-slate-100 text-slate-600 ring-1 ring-slate-200/80") +
        (className ? ` ${className}` : "")
      }
    >
      {published ? "公開中" : "下書き"}
    </span>
  );
}
