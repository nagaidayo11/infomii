"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { trackOnboardingWizardEvent } from "@/lib/storage";

const STORAGE_KEY = "infomii_onboarding_tour_completed";

const STEPS = [
  {
    title: "ようこそ、Infomii へ",
    body: "まずは案内ページを1つ作成し、QRでお客様へ届けましょう。ダッシュボードからすぐに始められます。",
  },
  {
    title: "作成方法を選ぶ",
    body: "白紙で始めるか、テンプレートから始めるかを選べます。館内案内・WiFi・朝食などの型をすぐに利用できます。",
  },
  {
    title: "最初はテンプレートがおすすめです",
    body: "業態別テンプレートを選び、文言を編集するだけで公開準備が整います。最短で体験を作っていきましょう。",
  },
];

export function OnboardingTour() {
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

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      trackOnboardingWizardEvent("wizard_step_completed", { step: step + 1 });
    } else {
      handleComplete();
    }
  };

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

  useEffect(() => {
    if (!visible || typeof window === "undefined") return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleSkip();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [visible]);

  if (!visible || typeof document === "undefined") return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const overlay = (
    <div
      className="ui-overlay-fade fixed inset-0 z-[9999] flex min-h-[100dvh] w-full items-center justify-center overflow-y-auto bg-slate-900/30 p-4"
      role="presentation"
    >
      <div
        className="ui-pop-in onboarding-surface relative my-auto max-w-md p-6"
        role="dialog"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-desc"
        aria-modal="true"
      >
        <div aria-hidden className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-blue-200/35 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-indigo-200/30 blur-2xl" />
        <button
          type="button"
          onClick={handleSkip}
          className="ui-focus-ring absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="スキップ"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div key={step} className="onboarding-step-enter pr-8">
          <p className="mb-2">
            <span className="ui-kicker-label">Step {step + 1} / {STEPS.length}</span>
          </p>
          <h2 id="onboarding-title" className="text-lg font-semibold text-slate-900">
            {current.title}
          </h2>
          <p id="onboarding-desc" className="mt-2 text-sm leading-relaxed text-slate-600">
            {current.body}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full transition ${
                  i <= step
                    ? `bg-blue-600 ${i === step ? "onboarding-progress-active" : ""}`
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {isLast ? (
              <Link
                href="/templates"
                className="onboarding-cta-primary ui-focus-ring px-5 py-2.5 text-sm font-semibold"
                onClick={handleComplete}
              >
                テンプレートで始める
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="onboarding-cta-primary ui-focus-ring px-5 py-2.5 text-sm font-semibold"
              >
                次へ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
