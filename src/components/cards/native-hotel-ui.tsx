"use client";

import type { ReactNode } from "react";
import { AppSectionHeader } from "@/components/app-shell/primitives";

/** Label + value row used by hotel facility blocks in native UI. */
export function NativeKvRow({
  label,
  children,
  href,
}: {
  label: string;
  children: ReactNode;
  /** When set (guest mode), wraps the value as a link */
  href?: string | null;
}) {
  const value = href ? (
    <a href={href} className="app-native-kv-value guest-page-link">
      {children}
    </a>
  ) : (
    <div className="app-native-kv-value">{children}</div>
  );
  return (
    <div className="app-native-kv-row">
      <span className="app-native-kv-label">{label}</span>
      {value}
    </div>
  );
}

export function NativeKvList({ children }: { children: ReactNode }) {
  return <div className="app-native-kv-list">{children}</div>;
}

export function NativeHotelSection({
  title,
  icon,
  children,
  onActivate,
}: {
  title: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  onActivate?: () => void;
}) {
  return (
    <div className="app-native-section app-native-guest-card" onClick={onActivate}>
      {title ? <AppSectionHeader title={title} icon={icon} as="div" /> : null}
      {children}
    </div>
  );
}
