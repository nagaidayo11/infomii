"use client";

import { useEffect } from "react";
import { useClientShell } from "./useClientShell";

function applyDocumentShell(client: "web" | "app") {
  const root = document.documentElement;
  if (client === "app") {
    root.dataset.clientShell = "app";
    root.dataset.appTheme = "light";
  } else if (!root.dataset.infomiiNative) {
    delete root.dataset.clientShell;
    delete root.dataset.appTheme;
  }
}

export function AppShellEffects() {
  const { client } = useClientShell();

  useEffect(() => {
    applyDocumentShell(client);
    return () => {
      delete document.documentElement.dataset.clientShell;
      delete document.documentElement.dataset.appTheme;
    };
  }, [client]);

  return null;
}
