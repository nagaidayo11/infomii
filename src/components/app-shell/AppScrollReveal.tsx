"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scroll-driven fade-up for `.app-reveal` inside the app tab scroll container.
 */
export function AppScrollReveal() {
  const pathname = usePathname() ?? "";

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".app-shell-main");
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const revealAll = () => {
      root.querySelectorAll<HTMLElement>(".app-reveal").forEach((el) => {
        el.classList.add("app-reveal--visible");
      });
    };

    if (reducedMotion) {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("app-reveal--visible");
          observer.unobserve(entry.target);
        }
      },
      {
        root,
        rootMargin: "0px 0px -4% 0px",
        threshold: 0.06,
      },
    );

    const observeNew = () => {
      root
        .querySelectorAll<HTMLElement>(".app-reveal:not(.app-reveal--visible)")
        .forEach((el) => observer.observe(el));
    };

    const revealWhenScrollEnds = () => {
      const atBottom = root.scrollTop + root.clientHeight >= root.scrollHeight - 8;
      if (atBottom) revealAll();
    };

    observeNew();
    requestAnimationFrame(() => {
      observeNew();
      revealWhenScrollEnds();
    });

    const mutation = new MutationObserver(() => {
      observeNew();
      revealWhenScrollEnds();
    });
    mutation.observe(root, { childList: true, subtree: true });

    const fallback = window.setTimeout(revealAll, 900);

    root.addEventListener("scroll", revealWhenScrollEnds, { passive: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
      window.clearTimeout(fallback);
      root.removeEventListener("scroll", revealWhenScrollEnds);
    };
  }, [pathname]);

  return null;
}
