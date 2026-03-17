"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { trackOnboardingWizardEvent } from "@/lib/storage";

const STORAGE_KEY = "infomii_onboarding_tour_completed";

const STEPS = [
  {
    title: "ようこそ Infomii へ",
    body: "案内ページを1つ作って、QRでお客様に届けます。ダッシュボードからページ作成やテンプレート選択ができます。",
  },
  {
    title: "ページの作り方",
    body: "「ページを作成」で白紙から、または「テンプレートから作成」で館内案内・WiFi・朝食などの型から始められます。",
  },
  {
    title: "最初はテンプレートがおすすめ",
    body: "ホテル・旅館・民泊など業態別のテンプレートがあります。型を選んで文言を編集するだけで、すぐに公開できます。",
  },
];

export function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      setVisible(true);
      trackOnboardingWizardEvent("wizard_started", { step: 0 });
    }
  }, []);

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

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/30 p-4">
      <div
        className="relative max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
        role="dialog"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-desc"
      >
        <button
          type="button"
          onClick={handleSkip}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="スキップ"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="pr-8">
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
                  i <= step ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {isLast ? (
              <Link
                href="/templates"
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                onClick={handleComplete}
              >
                テンプレートを見る
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                次へ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
