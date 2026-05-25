import { NextResponse } from "next/server";

/** モバイル OAuth 復帰: React より先に infomii:// へ 302（Web ダッシュボードへ行かせない） */
export async function GET(request: Request) {
  const incoming = new URL(request.url);
  const target = new URL("infomii://auth/callback");

  incoming.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  return NextResponse.redirect(target.href);
}
