"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type AppBottomSheetSize = "compact" | "comfortable" | "full";

const SHEET_MIN_VISIBLE_PX = 300;
const SHEET_TOP_MARGIN_PX = 52;

type AppBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Accessible name when title is omitted */
  ariaLabel?: string;
  /** Extra class on the sliding panel (e.g. taller sheets). */
  panelClassName?: string;
  /** Height snap: compact / comfortable (default) / full */
  size?: AppBottomSheetSize;
  /** Optional controls beside the title (e.g. size chips) */
  headerTrailing?: ReactNode;
};

export function AppBottomSheet({
  open,
  onClose,
  title,
  children,
  ariaLabel = "操作メニュー",
  panelClassName = "",
  size = "comfortable",
  headerTrailing,
}: AppBottomSheetProps) {
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0.12 : 0.28;
  const sizeClass = `app-bottom-sheet-panel--size-${size}`;
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const [customHeight, setCustomHeight] = useState<{ height: number; size: AppBottomSheetSize } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const startHandleDrag = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      const currentHeight = panelRef.current?.getBoundingClientRect().height ?? customHeight?.height ?? window.innerHeight * 0.72;
      dragRef.current = { startY: event.clientY, startHeight: currentHeight };
      setCustomHeight({ height: currentHeight, size });
    },
    [customHeight, size],
  );

  const moveHandleDrag = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const drag = dragRef.current;
      if (!drag) return;
      event.preventDefault();
      const maxHeight = Math.max(SHEET_MIN_VISIBLE_PX, window.innerHeight - SHEET_TOP_MARGIN_PX);
      const nextHeight = Math.max(
        SHEET_MIN_VISIBLE_PX,
        Math.min(maxHeight, drag.startHeight - (event.clientY - drag.startY)),
      );
      setCustomHeight({ height: nextHeight, size });
    },
    [size],
  );

  const endHandleDrag = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current) return;
    event.preventDefault();
    dragRef.current = null;
  }, []);

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

  if (!mounted) return null;

  const activeCustomHeight = customHeight?.size === size ? customHeight.height : null;
  const panelStyle: CSSProperties | undefined =
    activeCustomHeight == null
      ? undefined
      : {
          height: `${Math.round(activeCustomHeight)}px`,
          minHeight: `${Math.round(activeCustomHeight)}px`,
          maxHeight: `${Math.round(activeCustomHeight)}px`,
        };

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
            ref={panelRef}
            className={["app-bottom-sheet-panel", sizeClass, panelClassName].filter(Boolean).join(" ")}
            style={panelStyle}
            role="dialog"
            aria-modal="true"
            aria-label={title ?? ariaLabel}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="app-bottom-sheet-handle-button"
              aria-label="シートの高さを調整"
              onPointerDown={startHandleDrag}
              onPointerMove={moveHandleDrag}
              onPointerUp={endHandleDrag}
              onPointerCancel={endHandleDrag}
            >
              <span className="app-bottom-sheet-handle" aria-hidden />
            </button>
            {title || headerTrailing ? (
              <div className="app-bottom-sheet-header">
                {title ? <p className="app-bottom-sheet-title">{title}</p> : <span />}
                {headerTrailing ? (
                  <div className="app-bottom-sheet-header-trailing">{headerTrailing}</div>
                ) : null}
              </div>
            ) : null}
            <div className="app-bottom-sheet-body">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
