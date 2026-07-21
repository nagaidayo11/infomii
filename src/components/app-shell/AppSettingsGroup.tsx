"use client";

import type { ReactNode } from "react";

type AppSettingsGroupProps = {
  title?: string;
  icon?: ReactNode;
  footer?: string;
  children: ReactNode;
  className?: string;
};

/** iOS Settings–style section with optional icon, label and footnote. */
export function AppSettingsGroup({ title, icon, footer, children, className = "" }: AppSettingsGroupProps) {
  return (
    <section className={`app-settings-group ${className}`.trim()}>
      {title ? (
        <div className="app-settings-group-head">
          {icon ? <span className="app-settings-group-icon">{icon}</span> : null}
          <h2 className="app-settings-group-label">{title}</h2>
        </div>
      ) : null}
      <div className="app-settings-group-body">{children}</div>
      {footer ? <p className="app-settings-group-footer">{footer}</p> : null}
    </section>
  );
}
