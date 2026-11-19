"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { StampRewardTier } from "@/lib/stamp/styles";


export function StampUseConfirmPop({
  open,
  tier,
  rewardTitle,
  accent,
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  tier: StampRewardTier | null;
  rewardTitle: string;
  accent: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);

  if (!tier) return null;

  function handlePrimary() {
    if (!confirmed || busy) return;
    onConfirm();
  }

  function handleCancel() {
    setConfirmed(false);
    onCancel();
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="閉じる"
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
            onClick={handleCancel}
            disabled={busy}
          />
          <motion.div
            role="dialog"
            aria-label="特典を使う"
            className="relative w-full max-w-[300px] rounded-xl bg-[#fffdf8] px-5 py-6 text-left shadow-lg"
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
          >
            <p className="text-xs font-medium text-stone-500">{tier}個のスタンプと交換</p>
              <h2 className="mt-3 text-xl font-semibold leading-snug" style={{ color: accent }}>
                {rewardTitle}
              </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">この画面をスタッフにお見せください。使うと{tier}個減り、残りのスタンプはそのまま残ります。取り消しはできません。</p>
            <label className="mt-5 flex min-h-11 cursor-pointer items-center gap-3 border-y border-stone-200 py-3 text-sm">
              <input type="checkbox" checked={confirmed} disabled={busy} onChange={(event) => setConfirmed(event.target.checked)} className="h-5 w-5" style={{ accentColor: accent }} />
              スタッフに確認してもらいました
            </label>
            <div className="mt-5 grid gap-2">
              <button
                type="button"
                disabled={busy || !confirmed}
                onClick={handlePrimary}
                className="stamp-cta stamp-cta-primary"
                style={{ ["--stamp-accent" as string]: accent }}
              >
                {busy ? "交換しています…" : "特典を受け取る"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleCancel}
                className="stamp-cta stamp-cta-secondary"
              >
                今は使わない
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
