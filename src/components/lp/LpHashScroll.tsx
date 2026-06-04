"use client";

import { useEffect } from "react";

/** Scroll to a section id when the URL hash matches (WebView / hard navigation). */
export function LpHashScroll({ id }: { id: string }) {
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (hash !== id) return;
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [id]);

  return null;
}
