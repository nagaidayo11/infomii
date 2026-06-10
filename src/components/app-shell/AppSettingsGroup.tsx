"use client";

import type { ReactNode } from "react";

type AppSettingsGroupProps = {
  title?: string;
  footer?: string;
  children: ReactNode;
  className?: string;
};

/** iOS Settings–style section with optional label and footnote. */
export function AppSettingsGroup({ title, footer, children, className = "" }: AppSettingsGroupProps) {
  return (
    <section className={`app-settings-group ${className}`.trim()}>
      {title ? <h2 className="app-settings-group-label">{title}</h2> : null}
      <div className="app-settings-group-body">{children}</div>
      {footer ? <p className="app-settings-group-footer">{footer}</p> : null}
    </section>
  );
}
