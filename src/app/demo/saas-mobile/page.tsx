"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const ease = [0.25, 0.1, 0.25, 1] as const;

export default function SaasMobileDemoPage() {
  const reduceMotion = useReducedMotion();

  const fadeUp = reduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 18 };

  const stagger = reduceMotion ? 0 : 0.08;

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#fafafa] [--demo-fg:#0c0d0f] [--demo-muted:rgba(15,23,42,0.48)] [--demo-border:rgba(15,23,42,0.06)] [--demo-soft:rgba(15,23,42,0.03)] [--demo-card:#ffffff]">
      {/* Background — cinematic, unobtrusive */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[8%] h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-gradient-to-b from-slate-200/40 via-slate-100/20 to-transparent blur-3xl" />
        <div className="absolute bottom-[5%] right-[-18%] h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-blue-500/[0.07] via-transparent to-slate-200/30 blur-3xl motion-safe:animate-[demo-float_14s_ease-in-out_infinite]" />
      </div>

      <main className="relative z-10 mx-auto flex max-w-none flex-col items-center justify-center px-4 pb-14 pt-10 sm:px-8 sm:py-14">
        <p className="mb-8 text-[11px] font-medium uppercase tracking-[0.32em] text-slate-400">
          Promo · Mobile Demo
        </p>

        {/* Device frame */}
        <motion.div
          className="relative w-full max-w-[390px] overflow-hidden rounded-[44px] border border-white/[0.65] bg-white/55 p-[10px] shadow-[0_32px_64px_-12px_rgba(15,23,42,0.14),0_0_0_1px_rgba(15,23,42,0.04)_inset] backdrop-blur-xl"
          initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, ease }}
        >
          <div className="relative overflow-hidden rounded-[38px] bg-[linear-gradient(180deg,#fdfdfd_0%,#fafafa_52%,#f6f7f9_100%)] shadow-inner">
            {/* Status strip */}
            <div className="flex items-center justify-between px-7 pb-3 pt-[18px] text-[11px] font-semibold tracking-tight text-slate-500">
              <span className="tabular-nums opacity-85">19:43</span>
              <motion.div
                className="pointer-events-none h-7 w-[108px] rounded-full bg-slate-950/90 shadow-sm"
                aria-hidden
              />
              <span className="tabular-nums opacity-85">LTE</span>
            </div>

            <motion.div
              className="px-7 pb-10 pt-4"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: reduceMotion ? { staggerChildren: 0 } : { staggerChildren: stagger, delayChildren: 0.12 },
                },
                hidden: {},
              }}
            >
              {/* Top bar */}
              <motion.div
                className="mb-14 flex items-start justify-between"
                variants={{ hidden: fadeUp, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } } }}
              >
                <div className="min-w-0">
                  <span className="text-[13px] font-semibold tracking-[-0.02em] text-slate-900">Infomii</span>
                  <p className="mt-1 max-w-[200px] text-[11px] font-medium leading-snug tracking-wide text-[var(--demo-muted)]">
                    館内インフォメーション
                  </p>
                </div>
                <LanguageSwitch compact />
              </motion.div>

              {/* Hero */}
              <motion.section
                className="mb-16 space-y-4"
                variants={{ hidden: fadeUp, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--demo-border)] bg-[var(--demo-soft)] px-3 py-1.5 shadow-[var(--shadow-ds-xs)]">
                  <motion.span
                    className="relative flex h-1.5 w-1.5"
                    animate={
                      reduceMotion
                        ? undefined
                        : { scale: [1, 1.15, 1], opacity: [0.6, 1, 0.65] }
                    }
                    transition={{ duration: 2.8, repeat: Infinity, ease }}
                  >
                    <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-65" />
                    <span className="absolute inset-0 rounded-full bg-emerald-400 motion-safe:animate-ping opacity-35" />
                  </motion.span>
                  <span className="text-[10px] font-semibold tracking-[0.2em] text-slate-500">QR読み込み済み</span>
                </div>
                <h1 className="text-[34px] font-semibold leading-[1.08] tracking-[-0.045em] text-[var(--demo-fg)]">
                  はじめまして。
                  <br />
                  <span className="text-slate-400">滞在が、少し軽やかになります。</span>
                </h1>
                <p className="max-w-[300px] text-[15px] font-normal leading-relaxed tracking-tight text-slate-500">
                  Wi-Fiや朝食、館内設備まで、ひとつのページに。
                </p>
              </motion.section>

              <motion.section
                className="mb-14 space-y-10"
                variants={{ hidden: fadeUp, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } } }}
              >
                <PremiumCard delay={reduceMotion ? 0 : 0}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Wi‑Fi</p>
                      <p className="mt-4 text-xl font-semibold tracking-[-0.03em] text-slate-900">Guest-Lounge</p>
                      <p className="mt-2 font-mono text-[13px] tracking-[0.08em] text-slate-500">infomii-welcome</p>
                    </div>
                    <IconWifi />
                  </div>
                  <motion.button
                    type="button"
                    className="mt-10 w-full rounded-2xl border border-slate-200/80 bg-white px-5 py-[14px] text-[14px] font-semibold tracking-tight text-slate-800 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.12)] outline-none ring-slate-200/70 transition-colors hover:bg-slate-50/90 focus-visible:ring-2"
                    whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                    whileHover={
                      reduceMotion ? undefined : { y: -1, transition: { duration: 0.22, ease } }
                    }
                  >
                    パスコードをコピー
                  </motion.button>
                </PremiumCard>

                <PremiumCard delay={reduceMotion ? 0 : 0.04}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">朝食</p>
                      <p className="mt-4 text-xl font-semibold tracking-[-0.03em] text-slate-900">グランドビュッフェ</p>
                      <p className="mt-2 text-[14px] font-medium tracking-tight text-slate-500">6:00 — 10:30 · B1 メインダイニング</p>
                    </div>
                    <IconBreakfast />
                  </div>
                  <div className="mt-10 flex gap-3">
                    <Badge>和洋ラインナップ</Badge>
                    <Badge>アレルギー相談可</Badge>
                  </div>
                </PremiumCard>

                <PremiumCard delay={reduceMotion ? 0 : 0.08}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">館内案内</p>
                      <p className="mt-4 text-xl font-semibold tracking-[-0.03em] text-slate-900">Comfort & flow</p>
                      <p className="mt-2 text-[14px] font-medium tracking-tight text-slate-500">
                        のんびり、迷わず。よくある導線をまとめています。
                      </p>
                    </div>
                    <IconFacility />
                  </div>
                  <ul className="mt-12 space-y-6 border-t border-slate-100/90 pt-10">
                    {[
                      { t: "大浴場", s: "1F rear · 24h／清掃3:30 — 5:00" },
                      { t: "フィットネス", s: "2F · カードキー連動 · 換気オン" },
                      { t: "コンシェルジュ", s: "フロント横 · チェックイン前後は混雑しやすいです" },
                    ].map((row) => (
                      <li key={row.t} className="flex items-baseline justify-between gap-6">
                        <span className="text-[14px] font-semibold tracking-tight text-slate-800">{row.t}</span>
                        <span className="flex-1 text-right text-[12px] font-medium tracking-tight text-slate-400">{row.s}</span>
                      </li>
                    ))}
                  </ul>
                </PremiumCard>
              </motion.section>

              {/* CTAs */}
              <motion.div
                className="flex flex-col gap-3 pb-8"
                variants={{ hidden: fadeUp, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } } }}
              >
                <motion.button
                  type="button"
                  className="w-full rounded-2xl bg-slate-900 px-6 py-[17px] text-[15px] font-semibold tracking-tight text-white shadow-[0_16px_40px_-12px_rgba(15,23,42,0.45)] outline-none ring-slate-800/40 focus-visible:ring-2"
                  whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                  whileHover={
                    reduceMotion ? undefined : { y: -2, transition: { duration: 0.24, ease } }
                  }
                >
                  アプリで開く
                </motion.button>
                <motion.button
                  type="button"
                  className="w-full rounded-2xl border border-slate-200/95 bg-white/70 px-6 py-[16px] text-[15px] font-semibold tracking-tight text-slate-700 shadow-[0_4px_12px_-4px_rgba(15,23,42,0.06)] outline-none backdrop-blur-sm hover:bg-white focus-visible:ring-2 focus-visible:ring-slate-300/70"
                  whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                >
                  フロントに連絡
                </motion.button>
              </motion.div>

              <motion.p
                className="pb-[env(safe-area-inset-bottom)] text-center text-[10px] font-medium tracking-[0.18em] text-slate-400"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: reduceMotion ? 0 : 0.9, duration: 0.5 }}
              >
                POWERED BY INFOMII
              </motion.p>
            </motion.div>
          </div>
        </motion.div>

        <p className="mt-8 max-w-[360px] text-center text-[12px] font-medium tracking-tight text-slate-400">
          `/demo/saas-mobile` — 収録時はブラウザ幅を約 420px で中央表示すると映えます。
        </p>
      </main>

      <style jsx global>{`
        @keyframes demo-float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-12px, 8px) scale(1.02);
          }
        }
      `}</style>
    </div>
  );
}

function LanguageSwitch({ compact }: { compact?: boolean }) {
  const reduceMotion = useReducedMotion();
  const [locale, setLocale] = useState<"ja" | "en">("ja");

  return (
    <div className={`flex ${compact ? "scale-95" : ""}`}>
      <div className="relative flex rounded-full border border-[var(--demo-border)] bg-white/85 p-[3px] shadow-[var(--shadow-ds-xs)] backdrop-blur-sm">
        {(["ja", "en"] as const).map((code) => {
          const active = locale === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              className="relative z-10 min-w-[40px] rounded-full px-[11px] py-[6px] text-[11px] font-semibold tracking-[0.12em] text-slate-500 transition-colors hover:text-slate-700"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {active ? (
                <motion.span
                  layoutId={reduceMotion ? undefined : "lang-pill"}
                  className="absolute inset-0 -z-10 rounded-full bg-slate-900 shadow-sm"
                  transition={{ type: "spring", stiffness: 520, damping: 34 }}
                  style={{ margin: "-1px" }}
                />
              ) : null}
              <span className={`relative z-10 ${active ? "text-white" : ""}`}>{code.toUpperCase()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PremiumCard({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      variants={{
        hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease, delay },
        },
      }}
      className="rounded-[26px] border border-white/80 bg-[var(--demo-card)]/90 px-7 py-[26px] shadow-[0_20px_50px_-18px_rgba(15,23,42,0.12)] backdrop-blur-[2px] motion-safe:transition-shadow motion-safe:duration-[240ms]"
      whileHover={reduceMotion ? undefined : { boxShadow: "0 26px 60px -20px rgba(15,23,42,0.14)" }}
    >
      {children}
    </motion.div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-xl border border-slate-200/85 bg-slate-50/80 px-[10px] py-[7px] text-[11px] font-semibold tracking-tight text-slate-500">
      {children}
    </span>
  );
}

function IconWifi() {
  return (
    <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[18px] border border-slate-100 bg-gradient-to-br from-slate-50 to-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-slate-800" aria-hidden>
        <circle cx="12" cy="20.5" r="1.6" fill="currentColor" opacity="0.9" />
        <path
          d="M9 18.5a10.5 10.5 0 0 1 6 2M18.364 14.364a14.5 14.5 0 0 0-16.728 0M21.728 11.728a17.5 17.5 0 0 0-21.456 0"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function IconBreakfast() {
  return (
    <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[18px] border border-slate-100 bg-gradient-to-br from-amber-50/80 to-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-amber-700/85" aria-hidden>
        <path
          d="M6 13h13a2 2 0 1 1 0 4H6"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
        />
        <path d="M6 10V8a3 3 0 1 1 6 0v2M9 17v3M15 17v3" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function IconFacility() {
  return (
    <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[18px] border border-slate-100 bg-gradient-to-br from-blue-50/90 to-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" className="text-blue-900/85" aria-hidden>
        <path
          d="M4 20h17M9 22V13l3-9 4 13v9M13 22V13M6 22h-.5a3.5 3.5 0 1 1 0-7H6"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
