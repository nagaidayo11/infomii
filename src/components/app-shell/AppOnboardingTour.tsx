"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AppShellLink } from "./AppShellLink";
import { trackOnboardingWizardEvent } from "@/lib/storage";

const STORAGE_KEY = "infomii_app_onboarding_completed";

const STEPS = [
  {
    title: "友だちと一緒に、すぐつくれる",
    body: "Infomii は“作ってシェア”のためのアプリ。案内ページやメニュー、イベント告知を、テンプレから数分で仕上げられます。",
    emoji: "👋",
  },
  {
    title: "テンプレを選んで、あとは編集だけ",
    body: "「テンプレート」タブでテンプレを選び、写真や文言を差し替えるだけ。白紙からでも OK です。",
    emoji: "🎨",
  },
  {
    title: "「作品」にまとまる",
    body: "できあがったページは「作品」タブに一覧表示。公開してリンクや QR で友だちに届けましょう。",
    emoji: "🚀",
  },
];

export function AppOnboardingTour() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem(STORAGE_KEY);
  });
  const [step, setStep] = useState(0);
  const startedTrackedRef = useRef(false);

  useEffect(() => {
    if (!visible || startedTrackedRef.current) return;
    trackOnboardingWizardEvent("wizard_started", { step: 0 });
    startedTrackedRef.current = true;
  }, [visible]);

  useEffect(() => {
    if (!visible || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    trackOnboardingWizardEvent("wizard_completed");
    setVisible(false);
  };

  const handleSkip = () => {
    trackOnboardingWizardEvent("wizard_dropoff", { reason: "skip" });
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible || typeof document === "undefined") return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
      role="presentation"
    >
      <div
        className="app-onboarding-surface relative w-full max-w-md p-6 pb-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-onboarding-title"
      >
        <button
          type="button"
          onClick={handleSkip}
          className="app-pressable ui-pop-tap absolute right-3 top-3 min-h-0 rounded-xl px-3 py-2 text-sm font-medium text-[var(--app-text-muted)]"
        >
          スキップ
        </button>

        <p className="text-5xl" aria-hidden>
          {current.emoji}
        </p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[var(--app-accent)]">
          {step + 1} / {STEPS.length}
        </p>
        <h2 id="app-onboarding-title" className="mt-2 text-xl font-bold text-[var(--app-text)]">
          {current.title}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-[var(--app-text-muted)]">{current.body}</p>

        <div className="mt-6 flex gap-2">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={
                "h-1.5 flex-1 rounded-full " +
                (i <= step ? "bg-[var(--app-accent)]" : "bg-[var(--app-border)]")
              }
              aria-hidden
            />
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              if (isLast) {
                handleComplete();
              } else {
                setStep((s) => s + 1);
                trackOnboardingWizardEvent("wizard_step_completed", { step: step + 1 });
              }
            }}
            className="app-touch-btn app-pressable ui-pop-tap w-full bg-[var(--app-accent)] font-semibold text-white shadow-sm"
          >
            {isLast ? "はじめる" : "次へ"}
          </button>
          {isLast ? (
            <AppShellLink
              href="/templates"
              onClick={handleComplete}
              className="app-touch-btn flex w-full items-center justify-center border border-[var(--app-border)] bg-[var(--app-surface)] font-semibold text-[var(--app-text)]"
            >
              テンプレートを選ぶ
            </AppShellLink>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
