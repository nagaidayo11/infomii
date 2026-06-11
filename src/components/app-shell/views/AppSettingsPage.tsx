"use client";

import { BusinessAuditLogExport } from "@/components/settings/BusinessAuditLogExport";
import { AccountAuthLinkSection } from "@/components/settings/AccountAuthLinkSection";
import { BusinessPlanSection } from "@/components/settings/BusinessPlanSection";
import { ProfileDisplayNameSection } from "@/components/settings/ProfileDisplayNameSection";
import { useClientShell } from "../useClientShell";
import { AppSettingsAccountDeleteSection } from "../AppSettingsAccountDeleteSection";
import { AppSettingsGroup } from "../AppSettingsGroup";
import { AppSettingsLegalSection } from "../AppSettingsLegalSection";
import { AppSettingsPushSection } from "../AppSettingsPushSection";
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
    </>
  );

  if (isAppShell) {
    return (
      <AppSettingsShell>
        <AppSettingsGroup title="プロフィール">
          <ProfileDisplayNameSection />
        </AppSettingsGroup>

        <AppSettingsGroup
          title="アカウント"
          footer="Google を連携すると、次回から Google でもログインできます。"
        >
          <AccountAuthLinkSection />
        </AppSettingsGroup>

        <BusinessAuditLogExport />

        <AppSettingsGroup title="一般">
          <AppSettingsPushSection />
        </AppSettingsGroup>

        <AppSettingsGroup title="サポート">
          <AppSettingsLegalSection />
        </AppSettingsGroup>

        <AppSettingsGroup>
          <AppSettingsSignOutSection />
        </AppSettingsGroup>

        <AppSettingsGroup
          footer="削除するとワークスペースのデータにアクセスできなくなります。有料プランは先に解約してください。"
        >
          <AppSettingsAccountDeleteSection />
        </AppSettingsGroup>
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
