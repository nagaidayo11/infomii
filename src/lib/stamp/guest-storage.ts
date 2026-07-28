import { STAMP_CARD_STORAGE_PREFIX } from "@/lib/stamp/types";

export type GuestStorageMode = "local" | "session" | "none";

/** Whether card tokens survive tab close (localStorage) or only the session. */
export function getGuestStorageMode(): GuestStorageMode {
  try {
    const probe = "__infomii_stamp_probe__";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return "local";
  } catch {
    try {
      const probe = "__infomii_stamp_probe__";
      sessionStorage.setItem(probe, "1");
      sessionStorage.removeItem(probe);
      return "session";
    } catch {
      return "none";
    }
  }
}

/** True when localStorage is blocked (Safari private, strict ITP, etc.). */
export function isEphemeralGuestStorage(): boolean {
  return getGuestStorageMode() !== "local";
}

function cardKey(slug: string): string {
  return `${STAMP_CARD_STORAGE_PREFIX}${slug}`;
}

export function readStoredCardToken(slug: string): string | null {
  const key = cardKey(slug);
  try {
    const fromLocal = localStorage.getItem(key);
    if (fromLocal) return fromLocal;
  } catch {
    /* ignore */
  }
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Persist token in every storage layer that is available. */
export function writeStoredCardToken(slug: string, token: string): void {
  const key = cardKey(slug);
  try {
    localStorage.setItem(key, token);
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.setItem(key, token);
  } catch {
    /* ignore */
  }
}

/** Collect unique card tokens from session + local storage (press QR fallback). */
export function listStoredCardTokens(): string[] {
  const tokens: string[] = [];
  const add = (value: string | null) => {
    if (value && !tokens.includes(value)) tokens.push(value);
  };

  try {
    for (const key of Object.keys(sessionStorage)) {
      if (!key.startsWith(STAMP_CARD_STORAGE_PREFIX)) continue;
      add(sessionStorage.getItem(key));
    }
  } catch {
    /* ignore */
  }

  try {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith(STAMP_CARD_STORAGE_PREFIX)) continue;
      add(localStorage.getItem(key));
    }
  } catch {
    /* ignore */
  }

  return tokens;
}
