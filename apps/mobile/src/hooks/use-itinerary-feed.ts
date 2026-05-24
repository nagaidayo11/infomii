import { useCallback, useEffect, useMemo, useState } from "react";
import { SAMPLE_ITINERARIES, getItineraryById } from "@/data/sample-itineraries";
import { fetchSampleSaveCounts, fetchSaveCountsForInformationIds } from "@/lib/information-saves-api";
import {
  fetchItineraryById,
  fetchPublishedBySlug,
  fetchPublishedItineraries,
  isRemoteItineraryId,
  searchPublishedItineraries,
} from "@/lib/informations-api";
import { hasSupabaseEnv } from "@/lib/supabase";
import type { ItineraryCard } from "@/types/itinerary";

const SAMPLE_BOOST = 50;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function filterByQuery(pool: ItineraryCard[], query: string): ItineraryCard[] {
  const q = query.trim().toLowerCase();
  if (!q) return pool;
  return pool.filter((item) => {
    const hay = `${item.title} ${item.subtitle} ${item.location} ${item.category} ${item.slug}`.toLowerCase();
    return hay.includes(q);
  });
}

function dedupeCards(cards: ItineraryCard[]): ItineraryCard[] {
  const seen = new Set<string>();
  return cards.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
}

function scoreCard(
  item: ItineraryCard,
  remoteSaveCounts: Record<string, number>,
  sampleSaveCounts: Record<string, number>,
): number {
  if (item.source === "remote" && isRemoteItineraryId(item.id)) {
    return remoteSaveCounts[item.id] ?? 0;
  }
  const sampleScore = sampleSaveCounts[item.id] ?? 0;
  const boost = item.popular ? SAMPLE_BOOST : item.featured ? SAMPLE_BOOST / 2 : 10;
  return sampleScore + boost;
}

export function useItineraryFeed() {
  const [remote, setRemote] = useState<ItineraryCard[]>([]);
  const [loading, setLoading] = useState(hasSupabaseEnv);
  const [error, setError] = useState<string | null>(null);
  const [saveCounts, setSaveCounts] = useState<Record<string, number>>({});
  const [sampleSaveCounts, setSampleSaveCounts] = useState<Record<string, number>>({});

  const refresh = useCallback(async () => {
    if (!hasSupabaseEnv) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchPublishedItineraries(60);
      setRemote(rows);
      const ids = rows.map((r) => r.id);
      const [remoteCounts, sampleCounts] = await Promise.all([
        fetchSaveCountsForInformationIds(ids),
        fetchSampleSaveCounts(),
      ]);
      setSaveCounts(remoteCounts);
      setSampleSaveCounts(sampleCounts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const samples = useMemo(() => SAMPLE_ITINERARIES, []);

  const featured = useMemo(() => {
    const pool: ItineraryCard[] = [...remote, ...samples];
    return [...pool]
      .sort(
        (a, b) =>
          scoreCard(b, saveCounts, sampleSaveCounts) - scoreCard(a, saveCounts, sampleSaveCounts),
      )
      .slice(0, 8);
  }, [remote, samples, saveCounts, sampleSaveCounts]);

  const templates = useMemo(
    () => samples.filter((i) => i.popular || i.featured).slice(0, 10),
    [samples],
  );

  /** 探す: 公開UGCのみ（サンプルは「誰かのしおり」体験のため除外） */
  const explorePool = useMemo(() => remote.filter((i) => i.status === "published"), [remote]);

  return {
    remote,
    samples,
    featured,
    templates,
    explorePool,
    loading,
    error,
    refresh,
    hasRemote: remote.length > 0,
  };
}

export function useExploreFeed(searchQuery: string) {
  const { explorePool, loading, refresh } = useItineraryFeed();
  const [shuffleKey, setShuffleKey] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [remoteSearch, setRemoteSearch] = useState<ItineraryCard[]>([]);

  const basePool = useMemo(() => {
    if (explorePool.length > 0) return explorePool;
    return SAMPLE_ITINERARIES;
  }, [explorePool]);

  const usingSamples = explorePool.length === 0;

  const reshuffle = useCallback(() => {
    setShuffleKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setRemoteSearch([]);
      setSearchLoading(false);
      return;
    }

    let active = true;
    const timer = setTimeout(() => {
      void (async () => {
        setSearchLoading(true);
        const fromServer = hasSupabaseEnv ? await searchPublishedItineraries(q, 48) : [];
        if (!active) return;
        setRemoteSearch(fromServer);
        setSearchLoading(false);
      })();
    }, 320);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const items = useMemo(() => {
    const q = searchQuery.trim();
    let list: ItineraryCard[];
    if (q) {
      const local = filterByQuery(basePool, q);
      list = dedupeCards([...remoteSearch, ...local]);
    } else {
      list = [...basePool];
    }
    return shuffle(list);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reshuffle on key
  }, [basePool, searchQuery, remoteSearch, shuffleKey]);

  return {
    items,
    loading: loading || searchLoading,
    refresh,
    reshuffle,
    isSearch: searchQuery.trim().length > 0,
    usingSamples,
  };
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
