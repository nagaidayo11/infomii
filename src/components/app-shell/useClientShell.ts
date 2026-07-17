"use client";

import { useContext } from "react";
import { ClientShellContext } from "./ClientShellProvider";

export function useClientShell() {
  const ctx = useContext(ClientShellContext);
  return {
    client: ctx.client,
    isAppShell: ctx.isAppShell,
    /** Prefer this for guest/editor native UI forks (Phase 1+). */
    isNativeUi: ctx.isNativeUi,
  };
}
