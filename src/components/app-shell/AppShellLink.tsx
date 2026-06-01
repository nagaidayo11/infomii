"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { withAppClientQuery } from "@/lib/app-href";
import { useClientShell } from "./useClientShell";

type AppShellLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

/** In-app navigation link; keeps ?client=app in browser preview. */
export function AppShellLink({ href, ...props }: AppShellLinkProps) {
  const { isAppShell } = useClientShell();
  const resolved = isAppShell && href.startsWith("/") ? withAppClientQuery(href) : href;
  return <Link href={resolved} {...props} />;
}
