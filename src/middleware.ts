import { NextResponse, type NextRequest } from "next/server";
import { AUTH_PRESENCE_COOKIE, AUTH_PRESENCE_VALUE } from "@/lib/auth-presence-constants";

/**
 * `/` must resolve with an HTTP redirect for crawlers (not client JS).
 * Auth session lives in localStorage, so we only read a presence cookie set by AuthProvider.
 */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  const signedIn = request.cookies.get(AUTH_PRESENCE_COOKIE)?.value === AUTH_PRESENCE_VALUE;
  const dest = signedIn ? "/dashboard" : "/lp/business";
  const url = request.nextUrl.clone();
  url.pathname = dest;
  url.search = "";
  return NextResponse.redirect(url, signedIn ? 307 : 308);
}

export const config = {
  matcher: "/",
};
