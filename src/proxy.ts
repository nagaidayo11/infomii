import { NextResponse, type NextRequest } from "next/server";
import { isInfomiiAppUserAgent } from "@/lib/client-shell";

function isAppClient(request: NextRequest): boolean {
  if (request.nextUrl.searchParams.get("client") === "app") return true;
  const ua = request.headers.get("user-agent") ?? "";
  return isInfomiiAppUserAgent(ua);
}

export function proxy(request: NextRequest) {
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
