"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type AppToastTone = "success" | "error" | "info";

type AppToastItem = {
  id: number;
  message: string;
  tone: AppToastTone;
};

type AppToastContextValue = {
  showToast: (message: string, tone?: AppToastTone) => void;
};

const AppToastContext = createContext<AppToastContextValue | null>(null);

const AUTO_DISMISS_MS = 2800;

export function AppToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<AppToastItem[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef<Map<number, number>>(new Map());

  const dismiss = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: AppToastTone = "info") => {
      const trimmed = message.trim();
      if (!trimmed) return;
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-2), { id, message: trimmed, tone }]);
      const timer = window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <AppToastContext.Provider value={value}>
      {children}
      <AppToastViewport toasts={toasts} onDismiss={dismiss} />
    </AppToastContext.Provider>
  );
}

function AppToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: AppToastItem[];
  onDismiss: (id: number) => void;
}) {
  const reduceMotion = useReducedMotion();

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="app-toast-viewport" aria-live="polite" aria-relevant="additions">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            role="status"
            className={"app-toast app-toast--" + toast.tone}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="app-toast-message">{toast.message}</p>
            <button
              type="button"
              className="app-toast-dismiss"
              aria-label="閉じる"
              onClick={() => onDismiss(toast.id)}
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}

export function useAppToast(): AppToastContextValue {
  const ctx = useContext(AppToastContext);
  if (!ctx) {
    return {
      showToast: (message: string) => {
        if (typeof window !== "undefined" && message) window.alert(message);
      },
    };
  }
  return ctx;
}
