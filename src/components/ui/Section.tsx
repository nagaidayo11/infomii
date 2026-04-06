"use client";

import type { ReactNode } from "react";
import { ScrollReveal } from "@/components/motion";

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
  /** Background: card or shell (muted) */
  variant?: "white" | "muted";
  className?: string;
};

const kickerClass =
  "text-xs font-semibold uppercase tracking-wider text-ds-muted";
const titleClass =
  "mt-3 text-3xl font-bold tracking-tight text-ds-foreground sm:text-4xl";
const descriptionClass = "mt-4 max-w-2xl text-lg leading-relaxed text-ds-muted-fg";

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
  const bgClass = variant === "muted" ? "bg-ds-shell" : "bg-ds-card";
  const sectionClass =
    "border-b border-ds-border/80 " + bgClass + " py-16 sm:py-20 transition-colors duration-200 " + className;

  return (
    <section id={id} className={sectionClass}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal intensity="subtle">
          <div>
            {kicker != null && kicker !== "" && (
              <p className={kickerClass}>{kicker}</p>
            )}
            <h2 className={titleClass}>{title}</h2>
            {description != null && description !== "" && (
              <p className={descriptionClass}>{description}</p>
            )}
          </div>
        </ScrollReveal>
        <div className="mt-10 sm:mt-12">{children}</div>
      </div>
    </section>
  );
}
