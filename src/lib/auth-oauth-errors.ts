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

/** @deprecated Prefer formatAuthCallbackError for /auth/callback and login error query params. */
export function formatOAuthCallbackError(
  error: string | null,
  errorDescription: string | null,
): string {
  return formatAuthCallbackError(error, errorDescription);
}

export function formatAuthCallbackError(
  error: string | null,
  errorDescription: string | null,
): string {
  const code = (error ?? "").trim().toLowerCase();
  const raw = (errorDescription ?? error ?? "").trim();
  if (!raw) return "";

  const lower = raw.toLowerCase();

  if (
    code === "exchange_failed" ||
    code === "email_confirm_failed" ||
    lower.includes("code verifier") ||
    lower.includes("both auth code and code verifier") ||
    lower.includes("pkce")
  ) {
    return "メール確認リンクの処理に失敗しました。リンクの有効期限が切れているか、別のブラウザで開いている可能性があります。ログイン画面から再度お試しください。";
  }

  if (
    lower.includes("email link is invalid") ||
    lower.includes("otp_expired") ||
    lower.includes("has expired") ||
    lower.includes("already been used")
  ) {
    return "確認リンクの有効期限が切れているか、既に使用されています。ログイン画面から再度お試しください。";
  }

  if (lower.includes("email not confirmed")) {
    return "メール確認が完了していません。受信メールのリンクを開いてください。";
  }

  if (lower.includes("apple")) return formatAppleAuthError(raw);
  if (lower.includes("google")) return formatGoogleAuthError(raw);

  if (code === "access_denied") {
    return "ログインがキャンセルされました。もう一度お試しください。";
  }

  if (code === "callback_failed" || code === "session_error") {
    return raw.length > 120
      ? "認証処理に失敗しました。時間をおいて再度お試しください。"
      : raw;
  }

  return "認証処理に失敗しました。時間をおいて再度お試しください。";
}
