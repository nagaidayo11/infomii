"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { StampMark } from "@/components/stamp/StampMark";
import type { StampStyleId } from "@/lib/stamp/styles";

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
  const reduceMotion = useReducedMotion();
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
            role="dialog"
            aria-label="スタンプを受け取りました"
            className="relative w-full max-w-[280px] overflow-hidden rounded-xl bg-[#fffdf8] px-5 pb-5 pt-7 text-center shadow-lg"
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96, y: reduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-24"
              style={{
                background: "transparent",
              }}
            />
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: `color-mix(in srgb, ${accent} 16%, white)` }}
                initial={{ scale: reduceMotion ? 1 : 0.4, opacity: 0 }}
                animate={{ scale: [0.4, 1.15, 1], opacity: [0, 1, 1] }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              />
              <motion.div
                initial={{ scale: reduceMotion ? 1 : 1.55, rotate: reduceMotion ? 0 : -18, opacity: 0.2 }}
                animate={{ scale: reduceMotion ? 1 : [1.55, 0.92, 1], rotate: reduceMotion ? 0 : [-18, 8, 0], opacity: 1 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <StampMark filled accent={accent} styleId={styleId} size="lg" animateIn />
              </motion.div>
            </div>
            <p className="relative mt-4 text-xl font-bold tracking-tight text-slate-900">
              ひとつ、たまりました。
            </p>
            <p className="relative mt-1 text-sm text-slate-600">
              {stampCount >= 10 ? "10個達成。特典を選べます。" : stampCount === 5 ? "5個達成。最初の特典を使えます。" : `次の特典まであと${(stampCount < 5 ? 5 : 10) - stampCount}個`}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="stamp-cta stamp-cta-primary relative mt-5"
              style={{ ["--stamp-accent" as string]: accent }}
            >
              カードを見る
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
