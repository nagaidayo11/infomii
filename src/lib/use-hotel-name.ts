"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getCurrentHotelName } from "@/lib/storage";
import { hasSupabaseEnv } from "@/lib/supabase-config";

export const HOTEL_NAME_UPDATED_EVENT = "infomii:hotel-name-updated";

export function dispatchHotelNameUpdated(hotelName: string | null): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<string | null>(HOTEL_NAME_UPDATED_EVENT, { detail: hotelName }),
  );
}

/**
 * Current facility (hotel) name for shell chrome and page headers.
 */
export function useHotelName() {
  const { user } = useAuth();
  const [hotelName, setHotelName] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    if (!user?.id || !hasSupabaseEnv) {
      setHotelName(null);
      setLoaded(true);
      return;
    }
    setLoaded(false);
    try {
      const name = await getCurrentHotelName();
      setHotelName(name?.trim() || null);
    } catch {
      setHotelName(null);
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
      setHotelName(typeof detail === "string" ? detail.trim() || null : null);
      setLoaded(true);
    };
    window.addEventListener(HOTEL_NAME_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(HOTEL_NAME_UPDATED_EVENT, onUpdated);
  }, []);

  return { hotelName, loaded, reload };
}
