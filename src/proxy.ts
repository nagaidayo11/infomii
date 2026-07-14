import { NextResponse, type NextRequest } from "next/server";
import { AUTH_PRESENCE_COOKIE, AUTH_PRESENCE_VALUE } from "@/lib/auth-presence-constants";
import { isInfomiiAppUserAgent } from "@/lib/client-shell";

function isAppClient(request: NextRequest): boolean {
  if (request.nextUrl.searchParams.get("client") === "app") return true;
  const ua = request.headers.get("user-agent") ?? "";
  return isInfomiiAppUserAgent(ua);
}

/** public/lp 配下のデモ・テンプレ画像（エディタ初期値）。マーケ LP への誘導リダイレクトから除外する。 */
const LP_PUBLIC_ASSET_PREFIXES = ["/lp/demo/", "/lp/use-cases/", "/lp/templates/"] as const;

function isLpPublicAssetPath(pathname: string): boolean {
  if (LP_PUBLIC_ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }
  return /\.(avif|gif|ico|jpe?g|png|svg|webp|woff2?)$/i.test(pathname);
}

/** iOS/WebView: marketing LP is not used for billing — redirect to Plan tab. */
function isLpAllowedForAppClient(_pathname: string): boolean {
  return false;
}

function debugLog(payload: {
  hypothesisId: string;
  location: string;
  message: string;
  data?: Record<string, unknown>;
}) {
  // #region agent log
  fetch("http://127.0.0.1:7512/ingest/630ca5af-23fe-4043-a2d9-95e737add5ef", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "a35b2e",
    },
    body: JSON.stringify({
      sessionId: "a35b2e",
      runId: "post-fix",
      timestamp: Date.now(),
      ...payload,
    }),
  }).catch(() => {});
  // #endregion
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // `/` must resolve with an HTTP redirect for crawlers (not client JS only).
  // Auth session lives in localStorage; presence cookie is set by AuthProvider.
  if (pathname === "/") {
    const signedIn =
      request.cookies.get(AUTH_PRESENCE_COOKIE)?.value === AUTH_PRESENCE_VALUE;
    const dest = signedIn ? "/dashboard" : "/lp/business";
    // #region agent log
    debugLog({
      hypothesisId: "A",
      location: "src/proxy.ts:root",
      message: "root redirect via proxy only",
      data: { pathname, signedIn, dest },
    });
    // #endregion
    const url = request.nextUrl.clone();
    url.pathname = dest;
    url.search = "";
    return NextResponse.redirect(url, signedIn ? 307 : 308);
  }

  if (!isAppClient(request)) {
    return NextResponse.next();
  }

  if (pathname === "/lp" || pathname.startsWith("/lp/")) {
    if (isLpPublicAssetPath(pathname)) {
      return NextResponse.next();
    }
    if (isLpAllowedForAppClient(pathname)) {
      return NextResponse.next();
    }
    // #region agent log
    debugLog({
      hypothesisId: "B",
      location: "src/proxy.ts:app-lp",
      message: "app client LP redirect preserved",
      data: { pathname },
    });
    // #endregion
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.searchParams.set("client", "app");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/lp", "/lp/:path*"],
};
