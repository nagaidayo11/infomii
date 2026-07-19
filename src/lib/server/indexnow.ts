const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

function normalizeSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://infomii.com";
  return new URL(raw);
}

export function getIndexNowKey(): string | null {
  const key = process.env.INDEXNOW_KEY?.trim() ?? "";
  return /^[A-Za-z0-9-]{8,128}$/.test(key) ? key : null;
}

/**
 * Notify IndexNow participants about canonical URLs.
 * This is deliberately best-effort: indexing must never block publishing.
 */
export async function submitIndexNowUrls(paths: string[]): Promise<boolean> {
  const key = getIndexNowKey();
  if (!key || paths.length === 0) return false;

  const site = normalizeSiteUrl();
  const urls = Array.from(
    new Set(
      paths.map((path) => {
        const url = new URL(path, site);
        if (url.host !== site.host) {
          throw new Error("IndexNow can only submit same-host URLs");
        }
        return url.toString();
      }),
    ),
  ).slice(0, 10_000);

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: site.host,
      key,
      keyLocation: new URL("/indexnow-key.txt", site).toString(),
      urlList: urls,
    }),
    signal: AbortSignal.timeout(8_000),
  });

  return response.ok || response.status === 202;
}
