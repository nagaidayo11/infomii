"use client";

import { useEffect, useRef, useState } from "react";

type LpDemoVideoProps = {
  src: string;
};

export default function LpDemoVideo({ src }: LpDemoVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!videoRef.current) return;

        if (entry.isIntersecting && entry.intersectionRatio > 0.55) {
          try {
            await videoRef.current.play();
          } catch {
            // Autoplay can be blocked by browser policy. Keep overlay visible for manual play.
          }
        } else {
          videoRef.current.pause();
        }
      },
      { threshold: [0.2, 0.55, 0.8] },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  async function onOverlayPlayClick() {
    if (!videoRef.current) return;
    try {
      await videoRef.current.play();
    } catch {
      // no-op
    }
  }

  if (loadError) {
    return (
      <div className="flex min-h-64 items-center justify-center px-4 py-10 text-center">
        <div>
          <p className="text-sm font-semibold text-emerald-200">デモ動画未設定</p>
          <p className="mt-2 text-xs text-slate-300">
            `public/demo/editor-demo.mp4` を追加するか、`NEXT_PUBLIC_LP_DEMO_VIDEO_URL` を設定してください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <video
        ref={videoRef}
        className="block w-full"
        src={src}
        controls
        muted
        playsInline
        loop
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setLoadError(true)}
      />

      {!isPlaying ? (
        <button
          type="button"
          onClick={() => void onOverlayPlayClick()}
          className="absolute inset-0 flex items-center justify-center bg-slate-950/35 transition hover:bg-slate-950/25"
          aria-label="デモ動画を再生"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.8)] backdrop-blur-sm transition group-hover:scale-105">
            <span className="ml-1 inline-block h-0 w-0 border-y-[10px] border-y-transparent border-l-[16px] border-l-white" />
          </span>
        </button>
      ) : null}
    </div>
  );
}
