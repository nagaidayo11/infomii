/** Stripe 課金フローで「要ログイン」とみなすメッセージ（Supabase 英語エラー含む） */
export function isLoginRequiredMessage(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("ログイン") ||
    m.includes("認証") ||
    m.includes("セッション") ||
    m.includes("auth session") ||
    m.includes("session missing") ||
    m.includes("認証トークン") ||
    m.includes("not authenticated") ||
    m.includes("invalid jwt") ||
    m.includes("jwt expired")
  );
}

export function buildBillingLoginHref(fallbackNext = "/lp/business#pricing"): string {
  if (typeof window === "undefined") {
    return `/login?ref=lp&next=${encodeURIComponent(fallbackNext)}`;
  }
  const next = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  return `/login?ref=lp&next=${encodeURIComponent(next || fallbackNext)}`;
}
