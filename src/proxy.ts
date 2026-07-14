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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // `/` must resolve with an HTTP redirect for crawlers (not client JS only).
  // Auth session lives in localStorage; presence cookie is set by AuthProvider.
  if (pathname === "/") {
    const signedIn =
      request.cookies.get(AUTH_PRESENCE_COOKIE)?.value === AUTH_PRESENCE_VALUE;
    const dest = signedIn ? "/dashboard" : "/lp/business";
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
