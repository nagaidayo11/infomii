import AsyncStorage from "@react-native-async-storage/async-storage";

const PENDING_SAVE_KEY = "infomii-pending-save-v1";
const PENDING_PUBLISH_KEY = "infomii-pending-publish-v1";

export type PendingSave = {
  saveKey: string;
  returnPath: string;
};

export async function setPendingSave(payload: PendingSave): Promise<void> {
  await AsyncStorage.setItem(PENDING_SAVE_KEY, JSON.stringify(payload));
}

export async function peekPendingSave(): Promise<PendingSave | null> {
  const raw = await AsyncStorage.getItem(PENDING_SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingSave;
  } catch {
    return null;
  }
}

export async function consumePendingSave(): Promise<PendingSave | null> {
  const raw = await AsyncStorage.getItem(PENDING_SAVE_KEY);
  if (!raw) return null;
  await AsyncStorage.removeItem(PENDING_SAVE_KEY);
  try {
    return JSON.parse(raw) as PendingSave;
  } catch {
    return null;
  }
}

export async function setPendingPublishAfterAuth(value: boolean): Promise<void> {
  if (value) {
    await AsyncStorage.setItem(PENDING_PUBLISH_KEY, "1");
  } else {
    await AsyncStorage.removeItem(PENDING_PUBLISH_KEY);
  }
}

export async function peekPendingPublishAfterAuth(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(PENDING_PUBLISH_KEY);
  return raw === "1";
}

export async function consumePendingPublishAfterAuth(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(PENDING_PUBLISH_KEY);
  await AsyncStorage.removeItem(PENDING_PUBLISH_KEY);
  return raw === "1";
}
