"use client";

import { useState } from "react";
import { useClientShell } from "@/components/app-shell/useClientShell";

type GuestShareButtonProps = {
  title?: string;
  /** Absolute or path URL to share; defaults to current location */
  url?: string;
  className?: string;
  disabled?: boolean;
};

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  );
}

/**
 * Compact share control for guest header (native/app). Uses Web Share API with clipboard fallback.
 */
export function GuestShareButton({
  title = "Infomii",
  url,
  className = "",
  disabled = false,
}: GuestShareButtonProps) {
  const { isNativeUi } = useClientShell();
  const [feedback, setFeedback] = useState<"idle" | "copied" | "shared">("idle");

  if (!isNativeUi) return null;

  const resolveUrl = () => {
    if (url && url.trim()) {
      if (url.startsWith("http://") || url.startsWith("https://")) return url.trim();
      if (typeof window !== "undefined") return new URL(url, window.location.origin).toString();
    }
    if (typeof window !== "undefined") return window.location.href;
    return "";
  };

  const flash = (state: "copied" | "shared") => {
    setFeedback(state);
    window.setTimeout(() => setFeedback("idle"), 1600);
  };

  const handleShare = async () => {
    if (disabled) return;
    const shareUrl = resolveUrl();
    if (!shareUrl) return;
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title, url: shareUrl });
        flash("shared");
        return;
      }
    } catch (err) {
      // User cancel — ignore
      if (err instanceof DOMException && err.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      flash("copied");
    } catch {
      // no-op
    }
  };

  const label =
    feedback === "copied" ? "コピー済み" : feedback === "shared" ? "共有済み" : "共有";

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={disabled}
      className={
        "ui-pop-tap inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-[12px] font-medium text-[var(--app-text-muted)] transition hover:text-[var(--app-text)] disabled:opacity-50 " +
        className
      }
      aria-label="ページを共有"
    >
      <ShareIcon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
