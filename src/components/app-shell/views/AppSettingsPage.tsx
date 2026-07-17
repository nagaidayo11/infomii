"use client";

import { AccountAuthLinkSection } from "@/components/settings/AccountAuthLinkSection";
import { BusinessAuditLogExport } from "@/components/settings/BusinessAuditLogExport";
import { BusinessPlanSection } from "@/components/settings/BusinessPlanSection";
import { ProfileDisplayNameSection } from "@/components/settings/ProfileDisplayNameSection";
import { useClientShell } from "../useClientShell";
import { AppSettingsAccountDeleteSection } from "../AppSettingsAccountDeleteSection";
import { AppSettingsGroup } from "../AppSettingsGroup";
import { AppSettingsLegalSection } from "../AppSettingsLegalSection";
import { AppSettingsPushSection } from "../AppSettingsPushSection";
import { AppSettingsRestorePurchasesSection } from "../AppSettingsRestorePurchasesSection";
import { AppSettingsSignOutSection } from "../AppSettingsSignOutSection";
import { AppSettingsShell } from "./AppSettingsShell";
import { PageHelp } from "@/components/help/PageHelp";
import { PAGE_HELP } from "@/lib/page-help-content";

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

        <AppSettingsGroup title="一般">
          <AppSettingsPushSection />
        </AppSettingsGroup>

        <AppSettingsGroup
          title="App Store"
          footer="同じ Infomii アカウントでログインしていれば、プランは通常自動で共有されます。反映されない場合のみご利用ください。"
        >
          <AppSettingsRestorePurchasesSection />
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
      <header className="app-page-header flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="app-page-title">設定</h1>
          <p className="app-page-subtitle">プランの案内と、Business向けの設定項目です。</p>
        </div>
        <PageHelp
          className="shrink-0 self-start sm:self-auto"
          title={PAGE_HELP.settings.title}
          description={PAGE_HELP.settings.description}
          items={[...PAGE_HELP.settings.items]}
        />
      </header>
      {settingsSections}
      <AppSettingsLegalSection />
      <AppSettingsAccountDeleteSection />
    </div>
  );
}
