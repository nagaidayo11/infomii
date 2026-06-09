"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { APP_BRAND_SUBLINE, APP_BRAND_TAGLINE } from "@/lib/app-branding";
import { withAppClientQuery } from "@/lib/app-href";
import { LAUNCH_ONBOARDING_STEPS, markLaunchOnboardingCompleted } from "@/lib/launch-onboarding";
import { LaunchOnboardingPhone } from "./LaunchOnboardingPhone";

const pageTurnEase = [0.33, 1, 0.32, 1] as const;

const pageTurnTransition = {
  duration: 0.52,
  ease: pageTurnEase,
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "88%" : "-88%",
    rotateY: direction > 0 ? -34 : 34,
    transformOrigin: direction > 0 ? "left center" : "right center",
    opacity: 0.35,
    scale: 0.9,
    filter: "brightness(0.9)",
    boxShadow: "none",
  }),
  center: {
    x: 0,
    rotateY: 0,
    transformOrigin: "center center",
    opacity: 1,
    scale: 1,
    filter: "brightness(1)",
    boxShadow: "none",
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-76%" : "76%",
    rotateY: direction > 0 ? 30 : -30,
    transformOrigin: direction > 0 ? "right center" : "left center",
    opacity: 0,
    scale: 0.86,
    filter: "brightness(0.78)",
    boxShadow: "none",
  }),
};

type LaunchOnboardingFlowProps = {
  className?: string;
};

export function LaunchOnboardingFlow({ className = "" }: LaunchOnboardingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const total = LAUNCH_ONBOARDING_STEPS.length;
  const current = LAUNCH_ONBOARDING_STEPS[step]!;
  const isLast = step === total - 1;

  const goTo = useCallback((next: number) => {
    if (next < 0 || next >= total || next === step) return;
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }, [step, total]);

  const finish = useCallback(() => {
    markLaunchOnboardingCompleted();
    router.replace(withAppClientQuery("/login"));
  }, [router]);

  const handleNext = () => {
    if (isLast) {
      finish();
      return;
    }
    goTo(step + 1);
  };

  const handleTouchEnd = (clientX: number) => {
    if (touchStartX == null) return;
    const delta = clientX - touchStartX;
    setTouchStartX(null);
    if (Math.abs(delta) < 56) return;
    if (delta < 0 && !isLast) goTo(step + 1);
    if (delta > 0 && step > 0) goTo(step - 1);
  };

  /** 5枚目のみ「はじめる」（それ以外はスワイプ） */
  const showNavButton = step >= total - 1;

  return (
    <div
      className={"launch-onboarding-root launch-onboarding-root--app " + className}
      data-client-shell="app"
    >
      <div className="launch-onboarding-main">
        <div className="launch-onboarding-brand-block">
          <p className="launch-onboarding-brand">Infomii</p>
          <p className="launch-onboarding-tagline">{APP_BRAND_TAGLINE}</p>
          <p className="launch-onboarding-subline">{APP_BRAND_SUBLINE}</p>
        </div>

        <div className="launch-onboarding-card-slot">
          <AnimatePresence custom={direction} initial={false}>
            <motion.div
              key={current.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={pageTurnTransition}
              className="launch-onboarding-card launch-onboarding-card--turn"
              onTouchStart={(e) => setTouchStartX(e.touches[0]?.clientX ?? null)}
              onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0]?.clientX ?? 0)}
            >
              <LaunchOnboardingPhone
                src={current.image}
                alt={current.imageAlt}
                priority={step === 0}
                objectPosition={current.imageObjectPosition}
              />

              <div className="launch-onboarding-copy">
                <p className="launch-onboarding-kicker">{current.kicker}</p>
                <h1 className="launch-onboarding-title">{current.title}</h1>
                <p className="launch-onboarding-body">{current.body}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="launch-onboarding-footer">
          <div className="launch-onboarding-dots" role="tablist" aria-label="オンボーディングの進捗">
            {LAUNCH_ONBOARDING_STEPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === step}
                aria-label={`${i + 1}枚目: ${s.title}`}
                className={
                  "launch-onboarding-dot " + (i === step ? "launch-onboarding-dot--active" : "")
                }
                disabled
              />
            ))}
          </div>

          {showNavButton ? (
            <button
              type="button"
              onClick={handleNext}
              className="app-touch-btn app-touch-btn-primary app-pressable launch-onboarding-cta-final w-full bg-[var(--app-accent)] font-semibold !text-white "
            >
              はじめる
            </button>
          ) : (
            <div className="launch-onboarding-footer-spacer" aria-hidden />
          )}
        </div>
      </div>
    </div>
  );
}
