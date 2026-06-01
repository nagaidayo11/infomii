"use client";

import { BusinessAuditLogExport } from "@/components/settings/BusinessAuditLogExport";
import { AccountAuthLinkSection } from "@/components/settings/AccountAuthLinkSection";
import { BusinessPlanSection } from "@/components/settings/BusinessPlanSection";
import { ProfileDisplayNameSection } from "@/components/settings/ProfileDisplayNameSection";
import { useClientShell } from "../useClientShell";
import { AppSettingsShell } from "./AppSettingsShell";

export function AppSettingsPage() {
  const { isAppShell } = useClientShell();

  const content = (
    <>
      <ProfileDisplayNameSection />
      {!isAppShell ? <BusinessPlanSection /> : null}
      <AccountAuthLinkSection />
      <BusinessAuditLogExport />
    </>
  );

  if (isAppShell) {
    return <AppSettingsShell>{content}</AppSettingsShell>;
  }

  return (
    <div className="app-main-container space-y-6 pb-10">
      <header className="app-page-header">
        <h1 className="app-page-title">設定</h1>
        <p className="app-page-subtitle">プランの案内と、Business向けの設定項目です。</p>
      </header>
      {content}
    </div>
  );
}
