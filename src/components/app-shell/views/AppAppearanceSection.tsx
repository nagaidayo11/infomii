"use client";

import { useEffect, useState } from "react";
import {
  readAppTheme,
  writeAppTheme,
  type AppTheme,
} from "@/lib/app-appearance";
import { syncAppThemeOnDocument } from "../AppShellEffects";

const OPTIONS: { value: AppTheme; label: string }[] = [
  { value: "system", label: "システムに合わせる" },
  { value: "light", label: "ライト" },
  { value: "dark", label: "ダーク" },
];

export function AppAppearanceSection() {
  const [theme, setTheme] = useState<AppTheme>("system");

  useEffect(() => {
    setTheme(readAppTheme());
  }, []);

  function select(next: AppTheme) {
    setTheme(next);
    writeAppTheme(next);
    syncAppThemeOnDocument(next);
  }

  return (
    <section className="app-shell-card overflow-hidden">
      <div className="border-b border-[var(--app-border)] px-4 py-3">
        <h2 className="text-base font-bold text-[var(--app-text)]">外観</h2>
        <p className="mt-1 text-sm text-[var(--app-text-muted)]">
          アプリの表示モード（Web版のダークモードとは別設定です）
        </p>
      </div>
      <ul>
        {OPTIONS.map((opt) => (
          <li key={opt.value} className="border-b border-[var(--app-border)] last:border-0">
            <button
              type="button"
              onClick={() => select(opt.value)}
              className="app-touch-row w-full justify-between gap-3 text-left active:bg-[var(--app-surface-muted)]"
            >
              <span>{opt.label}</span>
              {theme === opt.value ? (
                <span className="text-sm font-semibold text-[var(--app-accent)]">選択中</span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
