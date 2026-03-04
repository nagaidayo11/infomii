"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type VoiceLogoProps = {
  logoSrc?: string;
  hotel: string;
  brandMark: string;
  brandTone: string;
};

export default function VoiceLogo({ logoSrc, hotel, brandMark, brandTone }: VoiceLogoProps) {
  const [attempt, setAttempt] = useState(0);
  const candidates = useMemo(() => {
    if (!logoSrc) return [];
    const hasExtension = /\.[a-z0-9]+$/i.test(logoSrc);
    if (hasExtension) return [logoSrc];
    return [`${logoSrc}.svg`, `${logoSrc}.png`, `${logoSrc}.webp`, `${logoSrc}.jpg`];
  }, [logoSrc]);
  const currentSrc = candidates[attempt] ?? null;
  const showImage = Boolean(currentSrc);
  const fallbackClassName = useMemo(
    () => `flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${brandTone} text-[11px] font-bold text-white`,
    [brandTone],
  );

  if (!showImage) {
    return <div className={fallbackClassName}>{brandMark}</div>;
  }

  return (
    <div className="flex h-8 min-w-24 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white px-2">
      <Image
        src={currentSrc!}
        alt={`${hotel} ロゴ`}
        width={96}
        height={24}
        className="h-5 w-auto object-contain"
        onError={() => setAttempt((prev) => prev + 1)}
      />
    </div>
  );
}
