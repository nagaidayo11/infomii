"use client";

import { PageHelp } from "@/components/help/PageHelp";
import { PAGE_HELP } from "@/lib/page-help-content";

/** Dashboard header help (includes live-ops tips). */
export function LiveOpsDashboardHelp({ className = "" }: { className?: string }) {
  const help = PAGE_HELP.dashboard;
  return (
    <PageHelp
      className={className}
      title={help.title}
      description={help.description}
      items={[...help.items]}
      label="ダッシュボードの説明"
    />
  );
}
