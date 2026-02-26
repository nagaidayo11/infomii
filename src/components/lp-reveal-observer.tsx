"use client";

import { useEffect } from "react";

export default function LpRevealObserver() {
  useEffect(() => {
    document.documentElement.classList.add("lp-observe");

    const targets = Array.from(document.querySelectorAll<HTMLElement>(".lp-reveal"));
    if (!targets.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      targets.forEach((el) => el.classList.add("lp-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("lp-visible");
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -2% 0px",
        threshold: 0.02,
      },
    );

    targets.forEach((el) => observer.observe(el));

    const revealRemainingWhenBottomReached = () => {
      const reachedBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 6;
      if (!reachedBottom) return;
      targets.forEach((el) => el.classList.add("lp-visible"));
    };

    window.addEventListener("scroll", revealRemainingWhenBottomReached, { passive: true });
    window.addEventListener("resize", revealRemainingWhenBottomReached);
    revealRemainingWhenBottomReached();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", revealRemainingWhenBottomReached);
      window.removeEventListener("resize", revealRemainingWhenBottomReached);
    };
  }, []);

  return null;
}
