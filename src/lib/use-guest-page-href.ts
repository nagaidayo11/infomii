"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { resolveGuestPageHref } from "@/lib/guest-page-link";

export function useGuestPageHref() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return useCallback(
    (href: string) => resolveGuestPageHref(href, { pathname, searchParams }),
    [pathname, searchParams],
  );
}
