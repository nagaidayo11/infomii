"use client";

import { useEffect, useState } from "react";

/** Desktop + fine pointer only: block library side hover preview (lg+). */
export function useEditorHoverPreviewEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return enabled;
}
