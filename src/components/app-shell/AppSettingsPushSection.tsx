"use client";

import { AppSettingsCard } from "@/components/app-shell/AppSettingsCard";

/** Push is prepared on the native shell; token sync will ship in a later release. */
export function AppSettingsPushSection() {
  return (
    <AppSettingsCard>
      <h2 className="text-base font-semibold text-[var(--app-text)]">プッシュ通知</h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--app-text-muted)]">
        公開リマインドなどの通知は準備中です。機能の公開後、この画面からオンにしたときに通知の許可をお願いします。
      </p>
    </AppSettingsCard>
  );
}
