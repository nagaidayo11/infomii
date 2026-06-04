function isEmailCollisionMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("already registered") ||
    normalized.includes("already exists") ||
    normalized.includes("email exists") ||
    normalized.includes("email address is already in use") ||
    normalized.includes("identity already exists")
  );
}

export function formatGoogleAuthError(message: string): string {
  if (isEmailCollisionMessage(message)) {
    return "同じメールアドレスのアカウントが既にあります。先にメールでログインしてからGoogle連携を行ってください。";
  }
  const normalized = message.toLowerCase();
  if (normalized.includes("provider is not enabled")) {
    return "Googleログインの設定が未完了です。管理者にお問い合わせください。";
  }
  if (normalized.includes("access_denied")) {
    return "Googleログインがキャンセルされました。もう一度お試しください。";
  }
  return "Googleログインに失敗しました。時間をおいて再度お試しください。";
}

export function formatAppleAuthError(message: string): string {
  if (isEmailCollisionMessage(message)) {
    return "同じメールアドレスのアカウントが既にあります。先にメールでログインしてからApple連携を行ってください。";
  }
  const normalized = message.toLowerCase();
  if (normalized.includes("provider is not enabled")) {
    return "Appleでサインインの設定が未完了です。管理者にお問い合わせください。";
  }
  if (normalized.includes("access_denied") || normalized.includes("user_cancelled")) {
    return "Appleでサインインがキャンセルされました。もう一度お試しください。";
  }
  return "Appleでサインインに失敗しました。時間をおいて再度お試しください。";
}

export function formatOAuthCallbackError(
  error: string | null,
  errorDescription: string | null,
): string {
  const raw = (errorDescription ?? error ?? "").trim();
  if (!raw) return "";
  const lower = raw.toLowerCase();
  if (lower.includes("apple")) return formatAppleAuthError(raw);
  return formatGoogleAuthError(raw);
}
