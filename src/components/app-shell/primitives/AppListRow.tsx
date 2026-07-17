"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { AppShellLink } from "../AppShellLink";

type Shared = {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  className?: string;
};

type AsLink = Shared & {
  href: string;
};

type AsButton = Shared & {
  href?: undefined;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  disabled?: boolean;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  "aria-label"?: string;
};

export type AppListRowProps = AsLink | AsButton;

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

function RowBody({
  title,
  subtitle,
  leading,
  trailing,
}: Pick<Shared, "title" | "subtitle" | "leading" | "trailing">) {
  return (
    <>
      {leading ? <div className="shrink-0 text-[var(--app-accent)]">{leading}</div> : null}
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-base font-medium text-[var(--app-text)]">{title}</p>
        {subtitle ? (
          <p className="mt-0.5 truncate text-sm text-[var(--app-text-muted)]">{subtitle}</p>
        ) : null}
      </div>
      {trailing ?? <Chevron />}
    </>
  );
}

/** List row for settings / link items. Link (`href`) or button (`onClick`). */
export function AppListRow(props: AppListRowProps) {
  const { title, subtitle, leading, trailing, className = "" } = props;
  const rowClass =
    "app-list-row app-pressable flex min-h-[var(--app-tap-min)] w-full items-center gap-3 px-4 py-3 " +
    className;

  if ("href" in props && props.href) {
    return (
      <AppShellLink href={props.href} className={rowClass}>
        <RowBody title={title} subtitle={subtitle} leading={leading} trailing={trailing} />
      </AppShellLink>
    );
  }

  const buttonProps = props as AsButton;
  return (
    <button
      type={buttonProps.type ?? "button"}
      className={rowClass}
      onClick={buttonProps.onClick}
      disabled={buttonProps.disabled}
      aria-label={buttonProps["aria-label"]}
    >
      <RowBody title={title} subtitle={subtitle} leading={leading} trailing={trailing} />
    </button>
  );
}
