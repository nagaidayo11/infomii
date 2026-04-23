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
