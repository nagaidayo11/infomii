import { NextResponse, type NextRequest } from "next/server";
import {
  CLIENT_SHELL_APP_VALUE,
  CLIENT_SHELL_COOKIE,
  isInfomiiAppUserAgent,
} from "@/lib/client-shell";

function isAppClient(request: NextRequest): boolean {
  if (request.nextUrl.searchParams.get("client") === "app") return true;
  if (request.cookies.get(CLIENT_SHELL_COOKIE)?.value === CLIENT_SHELL_APP_VALUE) return true;
  const ua = request.headers.get("user-agent") ?? "";
  return isInfomiiAppUserAgent(ua);
}

export function middleware(request: NextRequest) {
  if (!isAppClient(request)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (pathname === "/lp" || pathname.startsWith("/lp/")) {
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
