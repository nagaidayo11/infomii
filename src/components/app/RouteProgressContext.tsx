"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { GlobalRouteProgress } from "./GlobalRouteProgress";

type RouteProgressContextValue = {
  setManualPending: (id: string, active: boolean) => void;
};

const RouteProgressContext = createContext<RouteProgressContextValue | null>(null);

export function RouteProgressProvider({ children }: { children: ReactNode }) {
  const activeIdsRef = useRef<Set<string>>(new Set());
  const [manualPendingCount, setManualPendingCount] = useState(0);

  const setManualPending = useCallback((id: string, active: boolean) => {
    const next = new Set(activeIdsRef.current);
    if (active) next.add(id);
    else next.delete(id);
    activeIdsRef.current = next;
    setManualPendingCount(next.size);
  }, []);

  return (
    <RouteProgressContext.Provider value={{ setManualPending }}>
      <GlobalRouteProgress manualPending={manualPendingCount > 0} />
      {children}
    </RouteProgressContext.Provider>
  );
}

/**
 * Link page-level loading state to the global route progress bar.
 * Use this when "data loading complete" must control progress completion.
 */
export function useRouteProgressLoading(active: boolean) {
  const context = useContext(RouteProgressContext);
  const id = useId();

  useEffect(() => {
    if (!context) return;
    context.setManualPending(id, active);
    return () => {
      context.setManualPending(id, false);
    };
  }, [active, context, id]);
}
