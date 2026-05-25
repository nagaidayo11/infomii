/**
 * モバイル OAuth 復帰ブリッジ。
 * Supabase には https://…/auth/mobile-callback* のみ登録すればよい。
 * ?native= に exp:// または infomii:// を載せ、?code= をアプリへ渡す。
 */
export async function GET(request: Request) {
  const incoming = new URL(request.url);
  const code = incoming.searchParams.get("code");
  const nativeRaw = incoming.searchParams.get("native");
  const error =
    incoming.searchParams.get("error_description") ??
    incoming.searchParams.get("error");

  if (error) {
    return htmlResponse(
      "ログインに失敗しました",
      `<p style="color:#b91c1c">${escapeHtml(error)}</p>`,
      null,
    );
  }

  if (!code) {
    return htmlResponse(
      "認証情報がありません",
      `<p>アプリからもう一度 Google ログインをお試しください。</p>`,
      null,
    );
  }

  let appHref: string | null = null;
  if (nativeRaw) {
    try {
      const base = decodeURIComponent(nativeRaw);
      const app = new URL(base);
      incoming.searchParams.forEach((value, key) => {
        if (key === "native") return;
        app.searchParams.set(key, value);
      });
      appHref = app.href;
    } catch {
      appHref = null;
    }
  }

  if (appHref) {
    const safe = appHref.replace(/"/g, "&quot;");
    return htmlResponse(
      "アプリに戻しています…",
      `<p>自動で戻らない場合は下のボタンをタップしてください。</p>
       <p><a href="${safe}" style="display:inline-block;margin-top:12px;padding:12px 20px;background:#0f172a;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">アプリを開く</a></p>`,
      appHref,
    );
  }

  return htmlResponse(
    "認証が完了しました",
    `<p>左上の <strong>×</strong> をタップしてアプリに戻ってください。</p>`,
    null,
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function htmlResponse(title: string, body: string, appHref: string | null): Response {
  const script = appHref
    ? `<script>setTimeout(function(){window.location.replace(${JSON.stringify(appHref)});},80);</script>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="font-family:system-ui,sans-serif;text-align:center;padding:2rem;color:#334155;">
  <p style="font-size:16px;font-weight:600;">${escapeHtml(title)}</p>
  ${body}
  ${script}
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
