"use client";

import type { ReactNode } from "react";
import { AppSection } from "./AppSection";

type AppScreenSectionProps = {
  title: string;
  icon?: ReactNode;
  subtitle?: string;
  id?: string;
  children: ReactNode;
  className?: string;
  revealDelay?: number;
  /** When false, children render without the card shell (e.g. metric grid). */
  card?: boolean;
};

/** Icon-led in-screen section — settings/plan tone for feature pages. */
export function AppScreenSection({
  title,
  icon,
  subtitle,
  id,
  children,
  className = "",
  revealDelay = 0,
  card = true,
}: AppScreenSectionProps) {
  return (
    <AppSection revealDelay={revealDelay} className={className}>
      <div id={id} className="app-screen-section">
        <div className="app-screen-section-head">
          {icon ? <span className="app-screen-section-icon">{icon}</span> : null}
          <div className="min-w-0 flex-1">
            <h2 className="app-screen-section-title">{title}</h2>
            {subtitle ? <p className="app-screen-section-sub">{subtitle}</p> : null}
          </div>
        </div>
        {card ? <div className="app-shell-card app-screen-section-body overflow-hidden">{children}</div> : children}
      </div>
    </AppSection>
  );
}
