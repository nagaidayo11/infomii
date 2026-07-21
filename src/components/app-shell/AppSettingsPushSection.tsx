"use client";

import { AppSettingsCard } from "@/components/app-shell/AppSettingsCard";
import { AppSettingsIconNotifications } from "./icons/AppSettingsIcons";

/** Push is prepared on the native shell; token sync will ship in a later release. */
export function AppSettingsPushSection() {
  return (
    <AppSettingsCard className="app-settings-push-card">
      <div className="app-settings-push-row">
        <span className="app-settings-row-icon">
          <AppSettingsIconNotifications size={26} />
        </span>
        <div className="app-settings-push-copy min-w-0 flex-1">
          <p className="app-settings-push-title">プッシュ通知</p>
          <p className="app-settings-push-desc">公開リマインドなど（準備中）</p>
        </div>
        <span className="app-settings-status-pill app-settings-status-pill--off shrink-0">近日公開</span>
      </div>
    </AppSettingsCard>
  );
}
