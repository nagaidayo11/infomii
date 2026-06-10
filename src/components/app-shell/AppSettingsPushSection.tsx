"use client";

import { AppSettingsCard } from "@/components/app-shell/AppSettingsCard";

/** Push is prepared on the native shell; token sync will ship in a later release. */
export function AppSettingsPushSection() {
  return (
    <AppSettingsCard className="app-settings-push-card">
      <div className="app-settings-push-row">
        <div className="app-settings-push-copy">
          <p className="app-settings-push-title">プッシュ通知</p>
          <p className="app-settings-push-desc">公開リマインドなど（準備中）</p>
        </div>
        <span className="app-settings-status-pill app-settings-status-pill--off">近日公開</span>
      </div>
    </AppSettingsCard>
  );
}
