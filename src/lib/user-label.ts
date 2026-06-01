/** 表示名の末尾に「さん」を付ける（既に付いていればそのまま） */
export function formatDisplayNameWithSan(raw: string | null | undefined, fallback = "ゲスト"): string {
  const trimmed = raw?.trim() || fallback;
  if (trimmed.endsWith("さん")) return trimmed;
  return `${trimmed}さん`;
}

/** カタカナをひらがなに揃える（ナガイ / ながい を同一視するため） */
function katakanaToHiragana(s: string): string {
  return s.replace(/[\u30a1-\u30f6]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

function displayNameKey(s: string): string {
  return katakanaToHiragana(s.trim().replace(/さん$/u, "")).normalize("NFKC").toLowerCase();
}

/** ワークスペース名とユーザー表示名が同じか（さん・かなの種類・英字大小は無視） */
export function displayNamesEquivalent(a: string | null | undefined, b: string | null | undefined): boolean {
  const left = displayNameKey(a ?? "");
  const right = displayNameKey(b ?? "");
  return Boolean(left && right && left === right);
}

/**
 * 表示名 → メール → userId 先頭8文字
 */
export function resolveUserLabel(args: {
  displayName?: string | null;
  email?: string | null;
  userId: string;
}): string {
  const d = args.displayName?.trim();
  if (d) return d;
  const e = args.email?.trim();
  if (e) return e;
  if (args.userId.length >= 8) return `ユーザー ${args.userId.slice(0, 8)}`;
  return `ユーザー ${args.userId}`;
}
