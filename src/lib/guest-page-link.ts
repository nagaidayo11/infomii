type GuestLinkSearchParams = {
  get(name: string): string | null;
};

export type GuestLinkContext = {
  pathname?: string | null;
  searchParams?: GuestLinkSearchParams | null;
};

const INTERNAL_GUEST_PATH = /^\/(?:v|p)\/([^/?#]+)/;

function currentParentSlug(pathname: string | null | undefined): string {
  if (!pathname?.startsWith("/v/")) return "";
  return pathname.replace(/^\/v\//, "").split("/")[0] ?? "";
}

/** Preserve preview / from / lang / client when navigating between guest pages. */
export function resolveGuestPageHref(href: string, ctx: GuestLinkContext = {}): string {
  const trimmed = href.trim();
  if (!trimmed || trimmed === "#") return trimmed;
  if (/^(https?:|tel:|mailto:)/i.test(trimmed)) return trimmed;

  const hashIdx = trimmed.indexOf("#");
  const hash = hashIdx >= 0 ? trimmed.slice(hashIdx) : "";
  const pathAndQuery = hashIdx >= 0 ? trimmed.slice(0, hashIdx) : trimmed;
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

  const qs = params.toString();
  return `/v/${slug}${qs ? `?${qs}` : ""}${hash}`;
}
