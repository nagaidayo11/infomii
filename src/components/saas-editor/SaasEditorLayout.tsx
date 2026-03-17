"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type SaasEditorLayoutProps = {
  topBar?: ReactNode;
  sidebar: ReactNode;
  canvas: ReactNode;
  rightPanel: ReactNode;
};

export function SaasEditorLayout({
  topBar,
  sidebar,
  canvas,
  rightPanel,
}: SaasEditorLayoutProps) {
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);

  return (
    <div
      className="flex h-screen w-full flex-col overflow-hidden bg-[#f5f6f8]"
      role="application"
      aria-label="ビジュアルエディタ"
    >
      {topBar != null && <>{topBar}</>}

      <div className="relative flex min-h-0 flex-1 gap-6">
        {/* Desktop sidebar */}
        <aside
          className="hidden w-[280px] shrink-0 flex-col border-r border-slate-200/60 bg-white md:flex lg:w-[304px]"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
          aria-label="Block list"
        >
          {sidebar}
        </aside>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {mobileLeftOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/30 md:hidden"
                onClick={() => setMobileLeftOpen(false)}
                aria-hidden
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.2 }}
                className="fixed left-0 top-0 z-50 h-full w-[280px] bg-white shadow-xl md:hidden"
                aria-label="Block list"
              >
                {sidebar}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="min-h-0 min-w-0 flex-1 py-6" aria-label="Canvas">
          {canvas}
        </main>

        {/* Desktop right panel */}
        <aside
          className="hidden w-[304px] shrink-0 flex-col border-l border-slate-200/60 bg-white md:flex lg:w-[336px]"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
          aria-label="Style settings"
        >
          {rightPanel}
        </aside>

        {/* Mobile right panel overlay */}
        <AnimatePresence>
          {mobileRightOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/30 md:hidden"
                onClick={() => setMobileRightOpen(false)}
                aria-hidden
              />
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.2 }}
                className="fixed right-0 top-0 z-50 h-full w-[300px] bg-white shadow-xl md:hidden"
                aria-label="Style settings"
              >
                {rightPanel}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Mobile floating buttons */}
        <div className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 gap-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileLeftOpen(true)}
            className="rounded-[16px] bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
          >
            ブロック
          </button>
          <button
            type="button"
            onClick={() => setMobileRightOpen(true)}
            className="rounded-[16px] bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
          >
            スタイル
          </button>
        </div>
      </div>
    </div>
  );
}
