"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { APP_FAB_BOTTOM_OFFSET } from "./app-tab-metrics";

type AppFabPortalProps = {
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
};

/** Fixed FAB above the tab bar; portaled so tab transitions / scroll-reveal transforms cannot trap it. */
export function AppFabPortal({
  onClick,
  disabled = false,
  ariaLabel = "新規ページを作成",
}: AppFabPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="app-fab app-fab-portal ui-pop-tap fixed flex h-14 w-14 items-center justify-center rounded-full bg-[var(--app-accent)] text-2xl font-light text-white shadow-lg disabled:opacity-60"
      style={{
        right: "1rem",
        bottom: APP_FAB_BOTTOM_OFFSET,
      }}
      aria-label={ariaLabel}
    >
      +
    </button>,
    document.body,
  );
}
