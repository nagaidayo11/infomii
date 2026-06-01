export type SafeAreaInsets = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

/** Runs before each document load — client flag + real safe area (WKWebView often reports env() as 0). */
export function buildInjectedBootstrap(insets: SafeAreaInsets): string {
  const top = Math.max(0, Math.round(insets.top));
  const bottom = Math.max(0, Math.round(insets.bottom));
  const left = Math.max(0, Math.round(insets.left));
  const right = Math.max(0, Math.round(insets.right));

  return `
(function () {
  try {
    window.__INFOMII_CLIENT__ = 'app';
    var root = document.documentElement;
    root.setAttribute('data-infomii-native', '1');
    root.dataset.clientShell = 'app';
    root.style.setProperty('--infomii-safe-top', '${top}px');
    root.style.setProperty('--infomii-safe-bottom', '${bottom}px');
    root.style.setProperty('--infomii-safe-left', '${left}px');
    root.style.setProperty('--infomii-safe-right', '${right}px');
  } catch (e) {}
})();
true;
`;
}
