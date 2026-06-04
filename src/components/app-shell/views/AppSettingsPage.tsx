"use client";

import { BusinessAuditLogExport } from "@/components/settings/BusinessAuditLogExport";
import { AccountAuthLinkSection } from "@/components/settings/AccountAuthLinkSection";
import { BusinessPlanSection } from "@/components/settings/BusinessPlanSection";
import { LaunchOnboardingDevSection } from "@/components/settings/LaunchOnboardingDevSection";
import { ProfileDisplayNameSection } from "@/components/settings/ProfileDisplayNameSection";
import { useClientShell } from "../useClientShell";
import { AppSettingsAccountDeleteSection } from "../AppSettingsAccountDeleteSection";
import { AppSettingsLegalSection } from "../AppSettingsLegalSection";
import { AppSettingsPushSection } from "../AppSettingsPushSection";
import { AppSettingsRestorePurchasesSection } from "../AppSettingsRestorePurchasesSection";
import { AppSettingsSignOutSection } from "../AppSettingsSignOutSection";
import { AppSettingsShell } from "./AppSettingsShell";

export function AppSettingsPage() {
  const { isAppShell } = useClientShell();

  const settingsSections = (
    <>
      <ProfileDisplayNameSection />
      {!isAppShell ? <BusinessPlanSection /> : null}
      <AccountAuthLinkSection />
      <BusinessAuditLogExport />
      <LaunchOnboardingDevSection />
    </>
  );

  if (isAppShell) {
    return (
      <AppSettingsShell>
        <ProfileDisplayNameSection />
        <AccountAuthLinkSection />
        <BusinessAuditLogExport />
        <LaunchOnboardingDevSection />
        <AppSettingsLegalSection />
        <AppSettingsRestorePurchasesSection />
        <AppSettingsPushSection />
        <AppSettingsAccountDeleteSection />
        <AppSettingsSignOutSection />
      </AppSettingsShell>
    );
  }

  return (
    <div className="app-main-container space-y-6 pb-10">
      <header className="app-page-header">
        <h1 className="app-page-title">設定</h1>
        <p className="app-page-subtitle">プランの案内と、Business向けの設定項目です。</p>
      </header>
      {settingsSections}
      <AppSettingsLegalSection />
      <AppSettingsAccountDeleteSection />
    </div>
  );
}
