/** Next/Image: skip optimizer for local static assets (WebView / LAN dev での表示崩れを防ぐ) */
export function shouldUseUnoptimizedImage(src: string): boolean {
  return (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:") ||
    src.startsWith("/templates/") ||
    src.startsWith("/template-") ||
    src.startsWith("/preset-") ||
    src.startsWith("/lp/") ||
    src.startsWith("/hero-") ||
    src.startsWith("/onboarding/")
  );
}
