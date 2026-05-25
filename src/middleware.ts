import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** OAuth ?code= を Web で消費する前にモバイルアプリへ渡す */
function redirectOAuthCodeToApp(request: NextRequest): NextResponse | null {
  const { pathname, searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  if (!code) return null;

  const isMobileLogin =
    pathname === "/login" && searchParams.get("mobile") === "1";
  const isMobileCallback = pathname === "/auth/mobile-callback";
  /** Site URL が / だけのときのフォールバック（アプリ内ブラウザ） */
  const isRootFallback = pathname === "/";

  if (!isMobileLogin && !isMobileCallback && !isRootFallback) {
    return null;
  }

  const target = new URL("infomii://auth/callback");
  searchParams.forEach((value, key) => {
    if (key === "mobile") return;
    target.searchParams.set(key, value);
  });

  return NextResponse.redirect(target.href);
}

export function middleware(request: NextRequest) {
  const oauthRedirect = redirectOAuthCodeToApp(request);
  if (oauthRedirect) return oauthRedirect;

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/auth/mobile-callback"],
};
