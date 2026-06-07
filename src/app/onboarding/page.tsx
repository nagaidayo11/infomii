"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LaunchOnboardingFlow } from "@/components/launch-onboarding/LaunchOnboardingFlow";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { withAppClientQuery } from "@/lib/app-href";
import {
  isLaunchOnboardingCompleted,
  isLaunchOnboardingRequired,
} from "@/lib/launch-onboarding";
import { isNativeAppWebView, useNotifyNativeAppShellWhenReady } from "@/lib/native-app-bridge";

export default function LaunchOnboardingPage() {
  const router = useRouter();
  const { isAppShell } = useClientShell();

  const onboardingReady =
    isLaunchOnboardingRequired(isAppShell) && !isLaunchOnboardingCompleted();
  useNotifyNativeAppShellWhenReady(isAppShell && onboardingReady);

  useEffect(() => {
    if (!isLaunchOnboardingRequired(isAppShell)) {
      router.replace("/login");
      return;
    }
    if (isLaunchOnboardingCompleted()) {
      router.replace(withAppClientQuery("/login"));
    }
  }, [isAppShell, router]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!isLaunchOnboardingRequired(isAppShell) || isLaunchOnboardingCompleted()) {
    if (isAppShell && isNativeAppWebView()) return null;
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-slate-50 text-sm text-slate-500">
        読み込み中…
      </main>
    );
  }

  return <LaunchOnboardingFlow />;
}
