import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DraftBlock } from "@/types/itinerary";

const LOCAL_DRAFT_KEY = "infomii-local-draft-v1";

export type LocalDraft = {
  title: string;
  blocks: DraftBlock[];
  remoteId?: string;
  updatedAt: string;
};

export async function loadLocalDraft(): Promise<LocalDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalDraft;
  } catch {
    return null;
  }
}

export async function saveLocalDraft(draft: LocalDraft): Promise<void> {
  await AsyncStorage.setItem(
    LOCAL_DRAFT_KEY,
    JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }),
  );
}

export async function clearLocalDraft(): Promise<void> {
  await AsyncStorage.removeItem(LOCAL_DRAFT_KEY);
}

