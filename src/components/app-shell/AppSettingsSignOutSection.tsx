"use client";

import { useAuth } from "@/components/auth-provider";
import { AppSettingsIconSignOut } from "./icons/AppSettingsIcons";

export function AppSettingsSignOutSection() {
  const { signOut } = useAuth();

  return (
    <section className="app-settings-danger app-shell-card overflow-hidden">
      <button
        type="button"
        className="app-settings-danger-btn app-pressable flex w-full items-center justify-center gap-2.5 px-4 py-3.5 text-center text-base font-semibold"
        onClick={() => void signOut()}
      >
        <AppSettingsIconSignOut size={22} />
        <span>ログアウト</span>
      </button>
    </section>
  );
}
