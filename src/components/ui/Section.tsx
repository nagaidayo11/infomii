import type { ReactNode } from "react";

type SectionProps = {
  children: ReactNode;
  /** Optional anchor id for in-page links */
  id?: string;
  /** Small label above title (e.g. 機能, 料金) */
  kicker?: string;
  /** Section heading */
  title: string;
  /** Optional description below title */
  description?: string;
  /** Background: white or muted (#fafafa) */
  variant?: "white" | "muted";
  className?: string;
};

const kickerClass =
  "text-xs font-semibold uppercase tracking-wider text-slate-500";
const titleClass =
  "mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl";
const descriptionClass = "mt-4 max-w-2xl text-lg leading-relaxed text-slate-600";

/**
 * SaaS landing page–aligned section.
 * Consistent padding (py-16 sm:py-20), border-b, optional kicker/title/description.
 */
export function Section({
  children,
  id,
  kicker,
  title,
  description,
  variant = "white",
  className = "",
}: SectionProps) {
  const bgClass =
    variant === "muted" ? "bg-[#fafafa]" : "bg-white";
  const sectionClass =
    "border-b border-slate-200/80 " + bgClass + " py-16 sm:py-20 transition-colors duration-200 " + className;

  return (
    <section id={id} className={sectionClass}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {kicker != null && kicker !== "" && (
          <p className={kickerClass}>{kicker}</p>
        )}
        <h2 className={titleClass}>{title}</h2>
        {description != null && description !== "" && (
          <p className={descriptionClass}>{description}</p>
        )}
        <div className="mt-10 sm:mt-12">{children}</div>
      </div>
    </section>
  );
}
