"use client";

import { AppShellLink } from "@/components/app-shell/AppShellLink";
import { getLegalPageUrl } from "@/lib/app-store-compliance";

export function AppPlanLegalFootnote() {
  return (
    <p className="app-plan-legal-footnote">
      <AppShellLink href={getLegalPageUrl("/terms", true)} className="app-plan-legal-link">
        利用規約
      </AppShellLink>
      <span aria-hidden> · </span>
      <AppShellLink href={getLegalPageUrl("/privacy", true)} className="app-plan-legal-link">
        プライバシーポリシー
      </AppShellLink>
    </p>
  );
}
