import { useRouter } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchMySaveKeys,
  saveItinerary,
  saveKeyFromCard,
  saveTargetFromCard,
  unsaveItinerary,
  type SaveTarget,
} from "@/lib/information-saves-api";
import { setPendingSave } from "@/lib/pending-auth";
import { hasSupabaseEnv } from "@/lib/supabase";
import { success, tapSoft } from "@/lib/haptics";
import { useAuth } from "@/stores/auth-provider";
import type { ItineraryCard } from "@/types/itinerary";

type SavedContextValue = {
  savedKeys: string[];
  ready: boolean;
  isSaved: (item: Pick<ItineraryCard, "id" | "source">) => boolean;
  toggleSave: (item: Pick<ItineraryCard, "id" | "source">) => Promise<void>;
  refreshSaves: () => Promise<void>;
};

const SavedContext = createContext<SavedContextValue>({
  savedKeys: [],
  ready: true,
  isSaved: () => false,
  toggleSave: async () => undefined,
  refreshSaves: async () => undefined,
});

export function SavedProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [savedKeys, setSavedKeys] = useState<string[]>([]);
  const [ready, setReady] = useState(!hasSupabaseEnv);

  const refreshSaves = useCallback(async () => {
    if (!hasSupabaseEnv || !user) {
      setSavedKeys([]);
      setReady(true);
      return;
    }
    try {
      const keys = await fetchMySaveKeys();
      setSavedKeys(keys);
    } catch {
      setSavedKeys([]);
    }
    setReady(true);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void refreshSaves();
  }, [authLoading, refreshSaves]);

  const isSaved = useCallback(
    (item: Pick<ItineraryCard, "id" | "source">) => savedKeys.includes(saveKeyFromCard(item)),
    [savedKeys],
  );

  const toggleSave = useCallback(
    async (item: Pick<ItineraryCard, "id" | "source">) => {
      const key = saveKeyFromCard(item);
      const target = saveTargetFromCard(item);

      if (!user) {
        await setPendingSave({
          saveKey: key,
          returnPath: `/itinerary/${item.id}`,
        });
        router.push("/auth");
        return;
      }

      if (!hasSupabaseEnv) return;

      const exists = savedKeys.includes(key);
      try {
        if (exists) {
          await unsaveItinerary(target);
          void tapSoft();
          setSavedKeys((prev) => prev.filter((k) => k !== key));
        } else {
          await saveItinerary(target);
          void success();
          setSavedKeys((prev) => [...prev, key]);
        }
      } catch {
        /* ignore */
      }
    },
    [user, savedKeys, router],
  );

  const value = useMemo(
    () => ({ savedKeys, ready, isSaved, toggleSave, refreshSaves }),
    [savedKeys, ready, isSaved, toggleSave, refreshSaves],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  return useContext(SavedContext);
}
