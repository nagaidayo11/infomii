"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AppIconCompose } from "./icons/AppIconSet";
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
      className="app-fab app-fab-portal app-circle ui-pop-tap fixed flex items-center justify-center bg-[var(--app-accent)] text-white shadow-lg disabled:opacity-60"
      style={{
        right: "1rem",
        bottom: APP_FAB_BOTTOM_OFFSET,
      }}
      aria-label={ariaLabel}
    >
      <AppIconCompose size={26} />
    </button>,
    document.body,
  );
}
