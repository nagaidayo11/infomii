import { NextResponse, type NextRequest } from "next/server";
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

/** iOS/WebView billing CTAs open SaaS pricing LP (App Store 3.1.1). */
function isLpAllowedForAppClient(pathname: string): boolean {
  return pathname === "/lp/saas" || pathname === "/lp/saas/";
}

export function proxy(request: NextRequest) {
  if (!isAppClient(request)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
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
  matcher: ["/lp", "/lp/:path*"],
};
