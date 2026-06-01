"use client";

import { useEffect } from "react";
import { readAppTheme, resolveAppTheme, type AppTheme } from "@/lib/app-appearance";
import { useClientShell } from "./useClientShell";

function applyDocumentShell(client: "web" | "app", theme: AppTheme) {
  const root = document.documentElement;
  if (client === "app") {
    root.dataset.clientShell = "app";
    root.dataset.appTheme = resolveAppTheme(theme);
  } else if (!root.dataset.infomiiNative) {
    delete root.dataset.clientShell;
    delete root.dataset.appTheme;
  }
}

export function AppShellEffects() {
  const { client } = useClientShell();

  useEffect(() => {
    const theme = readAppTheme();
    applyDocumentShell(client, theme);

    const onStorage = (event: StorageEvent) => {
      if (event.key !== "infomii_app_theme") return;
      applyDocumentShell(client, readAppTheme());
    };

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      if (readAppTheme() === "system") {
        applyDocumentShell(client, "system");
      }
    };

    window.addEventListener("storage", onStorage);
    media.addEventListener("change", onScheme);
    return () => {
      window.removeEventListener("storage", onStorage);
      media.removeEventListener("change", onScheme);
      delete document.documentElement.dataset.clientShell;
      delete document.documentElement.dataset.appTheme;
    };
  }, [client]);

  return null;
}

export function syncAppThemeOnDocument(theme: AppTheme) {
  if (typeof document === "undefined") return;
  if (document.documentElement.dataset.clientShell !== "app") return;
  document.documentElement.dataset.appTheme = resolveAppTheme(theme);
}
