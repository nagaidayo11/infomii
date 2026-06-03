"use client";

import Image from "next/image";
import { shouldUseUnoptimizedImage } from "@/lib/static-image";

type LaunchOnboardingPhoneProps = {
  src: string;
  alt: string;
  priority?: boolean;
  variant?: "web" | "app";
};

export function LaunchOnboardingPhone({
  src,
  alt,
  priority = false,
  variant = "web",
}: LaunchOnboardingPhoneProps) {
  const unoptimized = shouldUseUnoptimizedImage(src);
  const imageSizes = variant === "app" ? "min(100vw, 390px)" : "min(100vw, 480px)";

  return (
    <div className={`launch-onboarding-preview launch-onboarding-preview--${variant}`}>
      <div className="launch-onboarding-preview-screen">
        {unoptimized ? (
          // eslint-disable-next-line @next/next/no-img-element -- local static placeholder
          <img
            src={src}
            alt={alt}
            className="launch-onboarding-preview-image"
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            className="launch-onboarding-preview-image object-cover object-center"
              sizes={imageSizes}
            priority={priority}
          />
        )}
      </div>
    </div>
  );
}
