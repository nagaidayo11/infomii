"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type AppBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Accessible name when title is omitted */
  ariaLabel?: string;
};

export function AppBottomSheet({
  open,
  onClose,
  title,
  children,
  ariaLabel = "操作メニュー",
}: AppBottomSheetProps) {
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0.12 : 0.28;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="app-bottom-sheet-root" role="presentation">
          <motion.button
            type="button"
            className="app-bottom-sheet-backdrop"
            aria-label="閉じる"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
            onClick={onClose}
          />
          <motion.div
            className="app-bottom-sheet-panel"
            role="dialog"
            aria-modal="true"
            aria-label={title ?? ariaLabel}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="app-bottom-sheet-handle" aria-hidden />
            {title ? <p className="app-bottom-sheet-title">{title}</p> : null}
            <div className="app-bottom-sheet-body">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
