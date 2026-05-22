import { useCallback, useEffect, useMemo, useState } from "react";
import { SAMPLE_ITINERARIES, getItineraryById } from "@/data/sample-itineraries";
import {
  fetchItineraryById,
  fetchPublishedBySlug,
  fetchPublishedItineraries,
  isRemoteItineraryId,
} from "@/lib/informations-api";
import { hasSupabaseEnv } from "@/lib/supabase";
import type { ItineraryCard } from "@/types/itinerary";

export function useItineraryFeed() {
  const [remote, setRemote] = useState<ItineraryCard[]>([]);
  const [loading, setLoading] = useState(hasSupabaseEnv);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!hasSupabaseEnv) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchPublishedItineraries(30);
      setRemote(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const all = useMemo(() => {
    const seen = new Set<string>();
    const merged: ItineraryCard[] = [];
    for (const item of [...remote, ...SAMPLE_ITINERARIES]) {
      const key = item.source === "remote" ? item.id : `sample-${item.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
    return merged;
  }, [remote]);

  const featured = useMemo(
    () => all.filter((i) => i.featured || i.source === "remote").slice(0, 6),
    [all],
  );
  const discover = useMemo(() => all.slice(0, 8), [all]);
  const popular = useMemo(() => all.filter((i) => i.popular || i.stops >= 4).slice(0, 6), [all]);
  const hotels = useMemo(() => all.filter((i) => i.category === "hotel").slice(0, 6), [all]);

  return { all, featured, discover, popular, hotels, remote, loading, error, refresh, hasRemote: remote.length > 0 };
}

export function useItineraryDetail(id: string | undefined) {
  const [item, setItem] = useState<ItineraryCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setItem(null);
      setLoading(false);
      return;
    }

    let active = true;
    (async () => {
      setLoading(true);
      const sample = getItineraryById(id);
      if (sample && !isRemoteItineraryId(id)) {
        if (active) {
          setItem(sample);
          setLoading(false);
        }
        return;
      }

      if (hasSupabaseEnv) {
        const remote = isRemoteItineraryId(id)
          ? await fetchItineraryById(id)
          : await fetchPublishedBySlug(id);
        if (active) {
          setItem(remote ?? sample ?? null);
          setLoading(false);
        }
        return;
      }

      if (active) {
        setItem(sample ?? null);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  return { item, loading };
}
