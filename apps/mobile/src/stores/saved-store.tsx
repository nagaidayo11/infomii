import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { success, tapSoft } from "@/lib/haptics";

const STORAGE_KEY = "infomii-mobile-saved-v1";

type SavedContextValue = {
  savedIds: string[];
  ready: boolean;
  isSaved: (id: string) => boolean;
  toggleSave: (id: string) => void;
};

const SavedContext = createContext<SavedContextValue>({
  savedIds: [],
  ready: false,
  isSaved: () => false,
  toggleSave: () => undefined,
});

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as string[];
          if (Array.isArray(parsed)) setSavedIds(parsed);
        }
      } catch {
        /* ignore */
      }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds)).catch(() => undefined);
  }, [ready, savedIds]);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  const toggleSave = useCallback((id: string) => {
    setSavedIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        void tapSoft();
        return prev.filter((item) => item !== id);
      }
      void success();
      return [...prev, id];
    });
  }, []);

  const value = useMemo(
    () => ({ savedIds, ready, isSaved, toggleSave }),
    [savedIds, ready, isSaved, toggleSave],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  return useContext(SavedContext);
}
