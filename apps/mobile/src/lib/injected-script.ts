/** Runs before page load so Phase 1 ClientShellProvider detects the native app. */
export const INJECTED_CLIENT_BOOTSTRAP = `
(function () {
  try {
    window.__INFOMII_CLIENT__ = 'app';
  } catch (e) {}
})();
true;
`;
