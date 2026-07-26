"use client";

import { AnimatePresence, motion } from "framer-motion";
import { StampMark } from "@/components/stamp/StampMark";
import type { StampStyleId } from "@/lib/stamp/styles";
import { STAMP_CAPACITY } from "@/lib/stamp/styles";

export function StampEarnPop({
  open,
  accent,
  styleId,
  stampCount,
  onClose,
}: {
  open: boolean;
  accent: string;
  styleId: StampStyleId;
  stampCount: number;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="閉じる"
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-[280px] overflow-hidden rounded-[1.5rem] bg-white px-5 pb-5 pt-7 text-center shadow-[0_28px_56px_-24px_rgba(15,23,42,0.55)]"
            initial={{ opacity: 0, scale: 0.82, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-24"
              style={{
                background: `radial-gradient(80% 120% at 50% 0%, color-mix(in srgb, ${accent} 28%, transparent), transparent)`,
              }}
            />
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: `color-mix(in srgb, ${accent} 16%, white)` }}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: [0.4, 1.15, 1], opacity: [0, 1, 1] }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              />
              <motion.div
                initial={{ scale: 1.55, rotate: -18, opacity: 0.2 }}
                animate={{ scale: [1.55, 0.92, 1], rotate: [-18, 8, 0], opacity: 1 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <StampMark filled accent={accent} styleId={styleId} size="lg" animateIn />
              </motion.div>
            </div>
            <p className="relative mt-4 text-xl font-bold tracking-tight text-slate-900">
              スタンプ獲得！
            </p>
            <p className="relative mt-1 text-sm text-slate-600">
              {stampCount} / {STAMP_CAPACITY}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="stamp-cta stamp-cta-primary relative mt-5"
              style={{ ["--stamp-accent" as string]: accent }}
            >
              閉じる
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
