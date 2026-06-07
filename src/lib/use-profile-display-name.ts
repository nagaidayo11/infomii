"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { hasSupabaseEnv } from "@/lib/supabase-config";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

export const PROFILE_DISPLAY_NAME_UPDATED_EVENT = "infomii:profile-display-name-updated";

export function dispatchProfileDisplayNameUpdated(displayName: string | null): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<string | null>(PROFILE_DISPLAY_NAME_UPDATED_EVENT, { detail: displayName }),
  );
}

export function useProfileDisplayName() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    if (!user?.id || !hasSupabaseEnv) {
      setDisplayName(null);
      setLoaded(true);
      return;
    }
    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      setDisplayName(null);
      setLoaded(true);
      return;
    }
    setLoaded(false);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      setDisplayName(data?.display_name ?? null);
    } finally {
      setLoaded(true);
    }
  }, [user?.id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<string | null>).detail;
      setDisplayName(typeof detail === "string" ? detail : detail ?? null);
      setLoaded(true);
    };
    window.addEventListener(PROFILE_DISPLAY_NAME_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(PROFILE_DISPLAY_NAME_UPDATED_EVENT, onUpdated);
  }, []);

  const trimmed = displayName?.trim() || null;
  return { displayName: trimmed, loaded, reload };
}
