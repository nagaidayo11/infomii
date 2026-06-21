import type {
  DashboardBootstrapData,
  PageConnectionSet,
  PageRow,
} from "@/lib/storage";

const AUTH_SCOPE_CACHE_KEY = "infomii:auth-scope-user-id";

export function readCachedAuthScopeUserId(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    return sessionStorage.getItem(AUTH_SCOPE_CACHE_KEY);
  } catch {
    return null;
  }
}

export function writeCachedAuthScopeUserId(userId: string): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(AUTH_SCOPE_CACHE_KEY, userId);
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearCachedAuthScopeUserId(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(AUTH_SCOPE_CACHE_KEY);
  } catch {
    /* ignore */
  }
}

export function hasCachedAuthScope(userId: string | undefined): boolean {
  if (!userId) return false;
  return readCachedAuthScopeUserId() === userId;
}

export type DashboardViewCache = {
  bootstrap: DashboardBootstrapData | null;
  pages: PageRow[];
  role: "owner" | "admin" | "editor" | "viewer" | null;
  totalViews7d: number;
};

let dashboardViewCache: DashboardViewCache | null = null;

export function getDashboardViewCache(): DashboardViewCache | null {
  return dashboardViewCache;
}

export function setDashboardViewCache(cache: DashboardViewCache): void {
  dashboardViewCache = cache;
}

export type PagesListViewCache = {
  sets: PageConnectionSet[];
  infoBySlug: Map<string, { status?: string; updatedAt?: string }>;
  role: "owner" | "admin" | "editor" | "viewer" | null;
};

let pagesListViewCache: PagesListViewCache | null = null;

export function getPagesListViewCache(): PagesListViewCache | null {
  return pagesListViewCache;
}

export function setPagesListViewCache(cache: PagesListViewCache): void {
  pagesListViewCache = cache;
}
