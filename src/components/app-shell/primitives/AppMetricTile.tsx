"use client";

import type { ReactNode } from "react";
import { AppShellLink } from "../AppShellLink";

type AppMetricTileProps = {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  href?: string;
  className?: string;
};

/** Compact metric tile with deformed icon — analytics / team summaries. */
export function AppMetricTile({ icon, label, value, sub, href, className = "" }: AppMetricTileProps) {
  const shellClass = ("app-metric-tile app-pressable " + className).trim();
  const body = (
    <>
      <span className="app-metric-tile-icon">{icon}</span>
      <div className="app-metric-tile-copy min-w-0">
        <p className="app-metric-tile-label">{label}</p>
        <p className="app-metric-tile-value">{value}</p>
        {sub ? <p className="app-metric-tile-sub">{sub}</p> : null}
      </div>
    </>
  );

  if (href) {
    return (
      <AppShellLink href={href} className={shellClass}>
        {body}
      </AppShellLink>
    );
  }

  return <div className={shellClass}>{body}</div>;
}
