/** モバイルアプリ OAuth 復帰用 deep link（クエリの mobile フラグは除く） */
export function buildAppOAuthReturnUrl(
  searchParams: URLSearchParams,
  hash = "",
): string {
  if (hash.length > 1) {
    return `infomii://auth/callback${hash}`;
  }
  const target = new URL("infomii://auth/callback");
  searchParams.forEach((value, key) => {
    if (key === "mobile") return;
    target.searchParams.set(key, value);
  });
  return target.href;
}
