"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { StampRewardTier } from "@/lib/stamp/styles";

type Step = 1 | 2 | 3;

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
  const [step, setStep] = useState<Step>(1);

  useEffect(() => {
    if (open) setStep(1);
  }, [open, tier]);

  if (!tier) return null;

  const copy =
    step === 1
      ? {
          eyebrow: "確認 1 / 3",
          title: "スタッフの確認は済みましたか？",
          body: "特典の受け渡しは、スタッフの目の前で行ってください。",
          primary: "確認済み",
        }
      : step === 2
        ? {
            eyebrow: "確認 2 / 3",
            title: "この特典を使用しますか？",
            body: `使用すると${tier}個分のスタンプが消費され、余りはそのまま残ります。`,
            primary: "次へ",
          }
        : {
            eyebrow: "確認 3 / 3",
            title: "本当に使用しますか？",
            body: "この操作は取り消せません。スタッフ確認のうえで進めてください。",
            primary: busy ? "処理中…" : "使用する",
          };

  function handlePrimary() {
    if (step < 3) {
      setStep((s) => (s + 1) as Step);
      return;
    }
    onConfirm();
  }

  function handleCancel() {
    setStep(1);
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
            className="relative w-full max-w-[280px] rounded-[1.35rem] bg-white px-5 py-6 text-center shadow-[0_28px_56px_-24px_rgba(15,23,42,0.5)]"
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
          >
            <div className="mb-3 flex justify-center gap-1.5" aria-hidden>
              {([1, 2, 3] as Step[]).map((n) => (
                <span
                  key={n}
                  className="h-1.5 w-6 rounded-full transition-colors"
                  style={{
                    background: n <= step ? accent : "rgb(226 232 240)",
                  }}
                />
              ))}
            </div>
            <p className="text-[11px] font-semibold text-slate-500">{copy.eyebrow}</p>
            <p className="mt-2 text-lg font-bold tracking-tight text-slate-900">{copy.title}</p>
            {step === 2 ? (
              <p className="mt-2 text-sm font-medium" style={{ color: accent }}>
                {rewardTitle}
              </p>
            ) : null}
            <p className="mt-2 text-[12px] leading-relaxed text-slate-500">{copy.body}</p>
            <div className="mt-5 grid gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={handlePrimary}
                className="stamp-cta stamp-cta-primary"
                style={{ ["--stamp-accent" as string]: accent }}
              >
                {copy.primary}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleCancel}
                className="stamp-cta stamp-cta-secondary"
              >
                キャンセル
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
