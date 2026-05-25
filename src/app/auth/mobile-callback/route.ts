import { buildAppOAuthReturnUrl } from "@/lib/mobile-oauth-return";

/**
 * モバイル OAuth 復帰先。
 * 302 で infomii:// へ飛ばすとアプリ内ブラウザが URL を返せないことがあるため、
 * 200 HTML を返しつつ Expo が https URL（?code=）を受け取れるようにする。
 */
export async function GET(request: Request) {
  const incoming = new URL(request.url);
  const appLink = buildAppOAuthReturnUrl(incoming.searchParams);
  const hasCode = incoming.searchParams.has("code");
  const error =
    incoming.searchParams.get("error_description") ??
    incoming.searchParams.get("error");

  const safeAppLink = appLink.replace(/"/g, "&quot;");

  const body = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ログイン完了</title>
  ${hasCode ? `<meta http-equiv="refresh" content="0;url=${safeAppLink}" />` : ""}
</head>
<body style="font-family:system-ui,sans-serif;text-align:center;padding:2rem;">
  <p>${error ? "ログインに失敗しました" : "アプリに戻しています…"}</p>
  ${error ? `<p style="color:#b91c1c;font-size:14px;">${error}</p>` : ""}
  <p><a href="${safeAppLink}" style="display:inline-block;margin-top:1rem;padding:12px 20px;background:#0f172a;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">アプリを開く</a></p>
  <script>
    (function () {
      var link = ${JSON.stringify(appLink)};
      if (${JSON.stringify(hasCode)} && !${JSON.stringify(!!error)}) {
        setTimeout(function () { window.location.replace(link); }, 50);
      }
    })();
  </script>
</body>
</html>`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
