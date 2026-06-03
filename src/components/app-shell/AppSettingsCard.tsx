"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { useClientShell } from "./useClientShell";

type AppSettingsCardProps = {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
};

/** Settings / billing block: native grouped card in app shell, web Card elsewhere. */
export function AppSettingsCard({ children, className = "", padding = "lg" }: AppSettingsCardProps) {
  const { isAppShell } = useClientShell();

  if (isAppShell) {
    return (
      <section
        className={`app-settings-card app-shell-card app-shell-card--sparkle overflow-hidden ${className}`.trim()}
      >
        <div className="app-settings-card-inner">{children}</div>
      </section>
    );
  }

  return (
    <Card
      padding={padding}
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`.trim()}
    >
      {children}
    </Card>
  );
}
