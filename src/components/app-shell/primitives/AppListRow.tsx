"use client";

import type { ReactNode } from "react";
import { AppShellLink } from "../AppShellLink";

type AppListRowProps = {
  title: string;
  subtitle?: string;
  href: string;
  trailing?: ReactNode;
  className?: string;
};

function Chevron() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-[var(--app-text-muted)] opacity-60"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function AppListRow({ title, subtitle, href, trailing, className = "" }: AppListRowProps) {
  return (
    <AppShellLink
      href={href}
      className={
        "app-list-row app-pressable flex min-h-[var(--app-tap-min)] w-full items-center gap-3 px-4 py-3 " +
        className
      }
    >
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-base font-medium text-[var(--app-text)]">{title}</p>
        {subtitle ? (
          <p className="mt-0.5 truncate text-sm text-[var(--app-text-muted)]">{subtitle}</p>
        ) : null}
      </div>
      {trailing ?? <Chevron />}
    </AppShellLink>
  );
}
