"use client";

type AppSwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  /** Visible label beside the switch */
  label?: string;
  /** Overrides default aria-label when label is hidden */
  ariaLabel?: string;
  /** Light track for dark headers (editor top bar) */
  variant?: "default" | "on-dark";
  /** Header row: no 44px min-height on label row */
  compact?: boolean;
  className?: string;
};

export function AppSwitch({
  checked,
  onCheckedChange,
  disabled = false,
  loading = false,
  label,
  ariaLabel = "公開",
  variant = "default",
  compact = false,
  className = "",
}: AppSwitchProps) {
  const busy = disabled || loading;

  return (
    <label
      className={
        "inline-flex shrink-0 cursor-pointer items-center gap-1.5 " +
        (compact ? "min-h-0 " : "min-h-[44px] gap-2 ") +
        (busy ? "cursor-not-allowed opacity-50" : "") +
        " " +
        className
      }
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {label ? (
        <span
          className={
            (compact ? "text-xs font-medium " : "text-sm font-medium ") +
            (variant === "on-dark" ? "text-white/95" : "text-[var(--app-text)]")
          }
        >
          {label}
        </span>
      ) : null}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-busy={loading || undefined}
        aria-label={label ? undefined : ariaLabel}
        disabled={busy}
        className={
          "app-switch relative shrink-0 " +
          (variant === "on-dark" ? "app-switch--on-dark " : "") +
          (checked ? "app-switch--on " : "")
        }
        onClick={(e) => {
          e.stopPropagation();
          if (!busy) {
            // TODO: native haptic light (Expo bridge) on toggle
            onCheckedChange(!checked);
          }
        }}
      >
        {loading ? (
          <span className="app-switch-spinner" aria-hidden />
        ) : (
          <span className="app-switch-thumb" aria-hidden />
        )}
      </button>
    </label>
  );
}
