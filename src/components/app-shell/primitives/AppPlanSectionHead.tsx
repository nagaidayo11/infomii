"use client";

import type { ReactNode } from "react";

type AppPlanSectionHeadProps = {
  icon: ReactNode;
  title: string;
  step?: number;
};

export function AppPlanSectionHead({ icon, title, step }: AppPlanSectionHeadProps) {
  return (
    <div className="app-plan-section-head">
      <span className="app-plan-section-icon">{icon}</span>
      <p className="app-plan-section-label">
        {step != null ? <span className="app-plan-section-step">{step}.</span> : null}
        {title}
      </p>
    </div>
  );
}
