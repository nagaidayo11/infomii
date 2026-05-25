import AsyncStorage from "@react-native-async-storage/async-storage";
import type { EditorCard } from "@/types/editor-card";

const LOCAL_DRAFT_KEY = "infomii-local-draft-v2";

export type LocalDraft = {
  title: string;
  pageId: string;
  slug: string;
  informationId?: string;
  cards: EditorCard[];
  updatedAt: string;
};

export async function loadLocalDraft(): Promise<LocalDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalDraft;
    if (!parsed.pageId || !parsed.slug) return null;
    return parsed;
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
