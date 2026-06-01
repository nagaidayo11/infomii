import type { ReactNode } from "react";

type AppEmptyStateProps = {
  emoji?: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function AppEmptyState({ emoji = "✨", title, description, action }: AppEmptyStateProps) {
  return (
    <div className="app-shell-hero flex flex-col items-center px-6 py-10 text-center">
      <span className="text-4xl" aria-hidden>
        {emoji}
      </span>
      <h3 className="mt-4 text-lg font-bold text-[var(--app-text)]">{title}</h3>
      <p className="mt-2 max-w-sm text-base leading-relaxed text-[var(--app-text-muted)]">{description}</p>
      {action ? <div className="mt-6 w-full max-w-xs">{action}</div> : null}
    </div>
  );
}
