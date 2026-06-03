"use client";

import { useRouter } from "next/navigation";
import { AppSettingsCard } from "@/components/app-shell/AppSettingsCard";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { withAppClientQuery } from "@/lib/app-href";
import {
  isLaunchOnboardingDevToolsEnabled,
  resetLaunchOnboarding,
} from "@/lib/launch-onboarding";

export function LaunchOnboardingDevSection() {
  const router = useRouter();
  const { isAppShell } = useClientShell();

  if (!isLaunchOnboardingDevToolsEnabled()) {
    return null;
  }

  function openOnboarding() {
    resetLaunchOnboarding();
    router.push(isAppShell ? withAppClientQuery("/onboarding") : "/onboarding");
  }

  return (
    <AppSettingsCard>
      <h2 className="text-base font-semibold text-slate-900">開発用</h2>
      <p className="mt-2 text-sm text-slate-600">
        初回オンボーディング（5枚）を最初から表示します。完了状態の保存もリセットされます。
      </p>
      <button
        type="button"
        onClick={openOnboarding}
        className="onboarding-cta-secondary ui-focus-ring ui-pop-tap app-pressable mt-4 min-h-[44px] w-full px-4 py-2.5 text-sm font-semibold"
      >
        オンボーディングを開く
      </button>
    </AppSettingsCard>
  );
}
