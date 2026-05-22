export function formatEmailAuthError(message: string): string {
  const n = message.toLowerCase();
  if (n.includes("already registered") || n.includes("already exists")) {
    return "このメールアドレスは既に登録されています。";
  }
  if (n.includes("invalid login credentials")) {
    return "メールアドレスまたはパスワードが正しくありません。";
  }
  if (n.includes("email not confirmed")) {
    return "メール確認が完了していません。";
  }
  return "ログインに失敗しました。時間をおいて再度お試しください。";
}

export function formatOtpError(message: string): string {
  const n = message.toLowerCase();
  if (n.includes("rate limit")) {
    return "送信回数の上限です。しばらく待ってからお試しください。";
  }
  return "マジックリンクの送信に失敗しました。";
}

export function formatGoogleAuthError(message: string): string {
  const n = message.toLowerCase();
  if (n.includes("provider is not enabled")) {
    return "Googleログインの設定が未完了です。";
  }
  if (n.includes("access_denied")) {
    return "Googleログインがキャンセルされました。";
  }
  return "Googleログインに失敗しました。";
}

export function formatAppleAuthError(message: string): string {
  const n = message.toLowerCase();
  if (n.includes("provider is not enabled")) {
    return "Appleログインの設定が未完了です。";
  }
  return "Appleログインに失敗しました。";
}
