"use client";

import { useEffect } from "react";
import { dispatchNativeIapResult } from "@/lib/native-iap";
import { useClientShell } from "./useClientShell";

function applyDocumentShell(client: "web" | "app") {
  const root = document.documentElement;
  if (client === "app") {
    root.dataset.clientShell = "app";
    root.dataset.appTheme = "light";
    /** Native / deformed UI layer (Phase 0). Opt-out later via query if needed. */
    root.dataset.appUi = "native";
  } else if (!root.dataset.infomiiNative) {
    delete root.dataset.clientShell;
    delete root.dataset.appTheme;
    delete root.dataset.appUi;
  }
}

export function AppShellEffects() {
  const { client } = useClientShell();

  useEffect(() => {
    applyDocumentShell(client);
    return () => {
      delete document.documentElement.dataset.clientShell;
      delete document.documentElement.dataset.appTheme;
      delete document.documentElement.dataset.appUi;
    };
  }, [client]);

  useEffect(() => {
    if (client !== "app") return;
    (window as Window & { dispatchNativeIapResult?: typeof dispatchNativeIapResult }).dispatchNativeIapResult =
      dispatchNativeIapResult;
    return () => {
      delete (window as Window & { dispatchNativeIapResult?: typeof dispatchNativeIapResult })
        .dispatchNativeIapResult;
    };
  }, [client]);

  return null;
}
