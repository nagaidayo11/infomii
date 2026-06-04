"use client";

import { AppSettingsCard } from "@/components/app-shell/AppSettingsCard";

/** Push is prepared on the native shell; token sync will ship in a later release. */
export function AppSettingsPushSection() {
  return (
    <AppSettingsCard>
      <h2 className="text-base font-semibold text-[var(--app-text)]">プッシュ通知</h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--app-text-muted)]">
        公開リマインドなどの通知は準備中です。リリース後、設定からオン・オフできる予定です。
      </p>
      <p className="mt-2 text-xs text-[var(--app-text-muted)]">
        端末の「設定 → 通知 → Infomii」で許可を変更できます。
      </p>
    </AppSettingsCard>
  );
}
