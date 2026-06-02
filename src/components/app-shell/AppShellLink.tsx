"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { withAppClientQuery } from "@/lib/app-href";
import { useClientShell } from "./useClientShell";

type AppShellLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

/** In-app navigation link; keeps ?client=app in browser preview. */
export function AppShellLink({ href, className = "", ...props }: AppShellLinkProps) {
  const { isAppShell } = useClientShell();
  const resolved = isAppShell && href.startsWith("/") ? withAppClientQuery(href) : href;
  const mergedClassName =
    isAppShell && !className.includes("ui-pop-tap")
      ? `ui-pop-tap ${className}`.trim()
      : className;
  return <Link href={resolved} className={mergedClassName} {...props} />;
}
