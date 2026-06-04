"use client";

type LaunchOnboardingPhoneProps = {
  src: string;
  alt: string;
  priority?: boolean;
  objectPosition?: string;
};

export function LaunchOnboardingPhone({
  src,
  alt,
  priority = false,
  objectPosition = "center top",
}: LaunchOnboardingPhoneProps) {
  return (
    <div className="launch-onboarding-preview launch-onboarding-preview--app">
      <div className="launch-onboarding-preview-screen">
        {/* eslint-disable-next-line @next/next/no-img-element -- local static onboarding asset */}
        <img
          src={src}
          alt={alt}
          className="launch-onboarding-preview-image launch-onboarding-preview-image--app"
          style={{ objectPosition }}
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  );
}
