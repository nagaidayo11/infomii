import type { ReactNode } from "react";

type AppEmptyStateProps = {
  /** @deprecated Prefer `icon` — soft deformed pictogram */
  emoji?: string | null;
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

export function AppEmptyState({ emoji, icon, title, description, action }: AppEmptyStateProps) {
  const visual = icon ?? (emoji ? <span className="text-4xl">{emoji}</span> : null);

  return (
    <div className="app-shell-hero flex flex-col items-center px-6 py-10 text-center">
      {visual ? (
        <div className="app-empty-state-icon" aria-hidden>
          {visual}
        </div>
      ) : null}
      <h3 className={(visual ? "mt-4 " : "") + "text-lg font-bold text-[var(--app-text)]"}>{title}</h3>
      <p className="mt-2 max-w-sm text-base leading-relaxed text-[var(--app-text-muted)]">{description}</p>
      {action ? <div className="mt-6 w-full max-w-xs">{action}</div> : null}
    </div>
  );
}
