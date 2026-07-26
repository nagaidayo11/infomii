"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "infomii_stamp_beta_ack";

/** One-time beta notice shown when the stamp editor first opens on this device. */
export function StampBetaNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== "1") {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore storage errors */
    }
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" />
          <motion.div
            className="relative w-full max-w-[360px] rounded-[1.35rem] bg-white px-5 py-6 shadow-[0_28px_56px_-24px_rgba(15,23,42,0.5)]"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 360, damping: 26 }}
          >
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold tracking-wide text-amber-800">
              ベータ版
            </span>
            <h2 className="mt-3 text-lg font-bold tracking-tight text-slate-900">
              スタンプカードは試験提供中です
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
              現在ベータ版のため、正式版までに仕様が変更される場合があります。公開前に、実機で
              「カード発行・押印・特典利用・復元」をご確認ください。
            </p>
            <ul className="mt-3 space-y-1.5 text-[12px] leading-relaxed text-slate-600">
              <li>・特典利用はスタッフ確認のもとで行います</li>
              <li>・アカウント保存をしない場合、端末変更時は復元できません</li>
              <li>・回転式QRを使う場合は、会計時にスタッフ端末で表示します</li>
            </ul>
            <button
              type="button"
              onClick={dismiss}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[color:var(--stamp-ink)] px-4 text-sm font-semibold text-white"
            >
              確認しました
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
