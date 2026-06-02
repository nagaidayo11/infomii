"use client";

import { useAuth } from "@/components/auth-provider";

export function AppSettingsSignOutSection() {
  const { signOut } = useAuth();

  return (
    <section className="app-settings-danger app-shell-card overflow-hidden">
      <button
        type="button"
        className="app-settings-danger-btn app-pressable w-full px-4 py-3.5 text-center text-base font-semibold"
        onClick={() => void signOut()}
      >
        ログアウト
      </button>
    </section>
  );
}
