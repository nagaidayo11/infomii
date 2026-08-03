type GuestLinkSearchParams = {
  get(name: string): string | null;
};

export type GuestLinkContext = {
  pathname?: string | null;
  searchParams?: GuestLinkSearchParams | null;
};

const INTERNAL_GUEST_PATH = /^\/(?:v|p)\/([^/?#]+)/;
const SPECIAL_LINK_SCHEME = /^(tel:|mailto:)/i;
const HTTP_LINK_SCHEME = /^https?:/i;

function currentParentSlug(pathname: string | null | undefined): string {
  if (!pathname || !/^\/(?:v|p)\//.test(pathname)) return "";
  return pathname.replace(/^\/(?:v|p)\//, "").split("/")[0] ?? "";
}

function isInfomiiGuestHost(hostname: string): boolean {
  return hostname === "infomii.com" || hostname.endsWith(".infomii.com");
}

function isCurrentOrigin(url: URL): boolean {
  return typeof window !== "undefined" && url.origin === window.location.origin;
}

function normalizeGuestHrefInput(href: string): string | null {
  if (!HTTP_LINK_SCHEME.test(href)) return href;

  try {
    const url = new URL(href);
    if (!isInfomiiGuestHost(url.hostname) && !isCurrentOrigin(url)) return null;
    if (!INTERNAL_GUEST_PATH.test(url.pathname)) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

/** Preserve preview / from / lang / client when navigating between guest pages. */
export function resolveGuestPageHref(href: string, ctx: GuestLinkContext = {}): string {
  const trimmed = href.trim();
  if (!trimmed || trimmed === "#") return trimmed;
  if (SPECIAL_LINK_SCHEME.test(trimmed)) return trimmed;

  const normalizedInput = normalizeGuestHrefInput(trimmed);
  if (!normalizedInput) return trimmed;

  const hashIdx = normalizedInput.indexOf("#");
  const hash = hashIdx >= 0 ? normalizedInput.slice(hashIdx) : "";
  const pathAndQuery = hashIdx >= 0 ? normalizedInput.slice(0, hashIdx) : normalizedInput;
  const qIdx = pathAndQuery.indexOf("?");
  const pathOnly = qIdx >= 0 ? pathAndQuery.slice(0, qIdx) : pathAndQuery;
  const existingParams = new URLSearchParams(qIdx >= 0 ? pathAndQuery.slice(qIdx + 1) : "");

  const match = pathOnly.match(INTERNAL_GUEST_PATH);
  if (!match) return trimmed;

  const slug = match[1];
  const params = new URLSearchParams(existingParams);

  const parentSlug = currentParentSlug(ctx.pathname ?? null);
  if (parentSlug && parentSlug !== slug && !params.has("from")) {
    params.set("from", parentSlug);
  }

  const lang = ctx.searchParams?.get("lang");
  if (lang && !params.has("lang")) params.set("lang", lang);

  if (ctx.searchParams?.get("preview") === "1" && !params.has("preview")) {
    params.set("preview", "1");
  }

  if (ctx.searchParams?.get("client") === "app" && !params.has("client")) {
    params.set("client", "app");
  }

  const returnEditor = ctx.searchParams?.get("returnEditor");
  if (returnEditor && !params.has("returnEditor")) {
    params.set("returnEditor", returnEditor);
  }

  const qs = params.toString();
  return `/v/${slug}${qs ? `?${qs}` : ""}${hash}`;
}
