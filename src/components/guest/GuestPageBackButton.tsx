"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PublicFooterBackButton } from "@/components/public-footer-back-button";
import { guestParentSlugFromReferer } from "@/lib/guest-page-link";

type GuestPageBackButtonProps = {
  /** Server-resolved back control (preferred). */
  serverBack?: ReactNode;
  currentSlug: string;
};

/**
 * Ensures a back control appears after parent → child navigation even when
 * `?from=` / Referer were missing on the SSR pass (client soft-nav / privacy).
 */
export function GuestPageBackButton({ serverBack, currentSlug }: GuestPageBackButtonProps) {
  const [clientBack, setClientBack] = useState<ReactNode>(null);

  useEffect(() => {
    if (serverBack) return;
    const parent = guestParentSlugFromReferer(
      typeof document !== "undefined" ? document.referrer : null,
      currentSlug,
    );
    if (!parent) return;
    setClientBack(
      <PublicFooterBackButton
        fallbackHref={`/v/${encodeURIComponent(parent)}`}
        label="← 戻る"
      />,
    );
  }, [serverBack, currentSlug]);

  const node = serverBack ?? clientBack;
  if (!node) return null;
  return <>{node}</>;
}
