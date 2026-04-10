"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";

type SlideItem = {
  src?: string;
  alt?: string;
  caption?: string;
  linkEnabled?: boolean;
  linkType?: "internal" | "external";
  href?: string;
  openInNewTab?: boolean;
};

function resolveSlideLink(slide: SlideItem): { href: string; external: boolean; newTab: boolean } | null {
  if (!slide.linkEnabled) return null;
  const rawHref = typeof slide.href === "string" ? slide.href.trim() : "";
  if (!rawHref) return null;
  const isExternal = slide.linkType === "external";
  if (isExternal) {
    if (!/^https?:\/\//i.test(rawHref)) return null;
    return { href: rawHref, external: true, newTab: slide.openInNewTab === true };
  }
  if (!rawHref.startsWith("/")) return null;
  return { href: rawHref, external: false, newTab: false };
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(media.matches);
    onChange();
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

export function HeroSliderCard({ card }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const content = (card.content ?? {}) as Record<string, unknown>;
  const title = typeof content.title === "string" ? content.title : "";
  const rawSlides = useMemo(
    () => ((Array.isArray(content.slides) ? content.slides : []) as SlideItem[]),
    [content.slides]
  );
  const autoplay = content.autoplay !== false;
  const intervalSecRaw = Number(content.intervalSec);
  const intervalSec = Number.isFinite(intervalSecRaw) ? Math.min(10, Math.max(2, intervalSecRaw)) : 4;
  const showCaptions = content.showCaptions !== false;
  const transitionEnabled = content.transitionEnabled !== false;
  const transitionType = content.transitionType === "slide" || content.transitionType === "zoom" ? content.transitionType : "fade";
  const durationRaw = Number(content.transitionDurationMs);
  const transitionDurationMs = Number.isFinite(durationRaw) ? Math.min(1200, Math.max(250, durationRaw)) : 500;
  const heightPreset = content.height === "s" || content.height === "l" ? content.height : "m";
  const hasSlides = rawSlides.some((s) => typeof s?.src === "string" && s.src.trim().length > 0);
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [animationSeed, setAnimationSeed] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [suppressTapUntil, setSuppressTapUntil] = useState(0);

  const normalizedSlides = useMemo(
    () =>
      rawSlides
        .filter((s) => typeof s?.src === "string" && s.src.trim().length > 0)
        .slice(0, 10)
        .map((s) => ({
          src: (s.src as string).trim(),
          alt: typeof s.alt === "string" && s.alt.trim() ? s.alt : "スライド画像",
          caption: typeof s.caption === "string" ? s.caption : "",
          linkEnabled: s.linkEnabled === true,
          linkType: s.linkType === "external" ? ("external" as const) : ("internal" as const),
          href: typeof s.href === "string" ? s.href : "",
          openInNewTab: s.openInNewTab === true,
        })),
    [rawSlides]
  );

  useEffect(() => {
    if (!autoplay || reducedMotion || normalizedSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      const next = (index + 1) % normalizedSlides.length;
      setDirection(1);
      if (transitionEnabled && !reducedMotion) {
        setPrevIndex(index);
        setAnimationSeed((prev) => prev + 1);
      }
      setIndex(next);
    }, intervalSec * 1000);
    return () => window.clearInterval(timer);
  }, [autoplay, reducedMotion, normalizedSlides.length, intervalSec, index, transitionEnabled]);

  useEffect(() => {
    if (prevIndex == null) return;
    const timer = window.setTimeout(() => setPrevIndex(null), transitionDurationMs);
    return () => window.clearTimeout(timer);
  }, [prevIndex, transitionDurationMs]);

  const heightClass =
    heightPreset === "s"
      ? "aspect-[2/1] min-h-[140px]"
      : heightPreset === "l"
        ? "h-72 sm:h-80"
        : "h-56 sm:h-64";

  if (!hasSlides || normalizedSlides.length === 0) {
    return (
      <section data-inner-surface className={`${editorInnerRadiusClassName} border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500`}>
        {title ? <p className="mb-1 font-medium text-slate-700" style={getTitleFontSizeStyle()}>{title}</p> : null}
        スライド画像が未設定です。設定パネルから画像を追加してください。
      </section>
    );
  }

  const currentIndex = normalizedSlides.length === 0 ? 0 : index % normalizedSlides.length;
  const current = normalizedSlides[currentIndex]!;
  const currentLink = resolveSlideLink(current);
  const previous = prevIndex != null && normalizedSlides[prevIndex] ? normalizedSlides[prevIndex] : null;
  const canMove = normalizedSlides.length > 1;
  const shouldAnimate = transitionEnabled && !reducedMotion;
  const isTransitioning = shouldAnimate && previous != null;

  const moveTo = (nextIndex: number, dir: 1 | -1) => {
    if (nextIndex === currentIndex) return;
    setDirection(dir);
    if (shouldAnimate) {
      setPrevIndex(currentIndex);
      setAnimationSeed((prev) => prev + 1);
    } else {
      setPrevIndex(null);
    }
    setIndex(nextIndex);
  };

  const animationName =
    transitionType === "fade" ? "heroSliderFadeIn" : transitionType === "zoom" ? "heroSliderZoomIn" : direction === 1 ? "heroSliderSlideInNext" : "heroSliderSlideInPrev";
  const slideOutAnimationName = direction === 1 ? "heroSliderSlideOutNext" : "heroSliderSlideOutPrev";
  const fadeOutAnimationName = "heroSliderFadeOut";
  const zoomOutAnimationName = "heroSliderZoomOut";

  return (
    <section className="app-interactive space-y-3 transition-transform duration-200 ease-out hover:-translate-y-0.5">
      {title ? <h3 className="px-1 text-base font-semibold text-slate-900" style={getTitleFontSizeStyle()}>{title}</h3> : null}
      <div
        data-inner-surface
        className={`relative w-full overflow-hidden ${editorInnerRadiusClassName} bg-slate-100 ${heightClass}`}
        onTouchStart={(e) => setTouchStartX(e.touches[0]?.clientX ?? null)}
        onTouchEnd={(e) => {
          if (!canMove || touchStartX == null) return;
          const endX = e.changedTouches[0]?.clientX ?? touchStartX;
          const delta = endX - touchStartX;
          if (Math.abs(delta) < 40) return;
          setSuppressTapUntil(Date.now() + 350);
          if (delta < 0) moveTo((currentIndex + 1) % normalizedSlides.length, 1);
          else moveTo((currentIndex - 1 + normalizedSlides.length) % normalizedSlides.length, -1);
        }}
      >
        {isTransitioning ? (
          <>
            <Image
              key={`prev-${prevIndex}-${animationSeed}`}
              src={previous.src}
              alt={previous.alt}
              fill
              sizes="(max-width: 640px) 100vw, 640px"
              className="object-cover"
              style={{
                animation: `${
                  transitionType === "slide"
                    ? slideOutAnimationName
                    : transitionType === "zoom"
                      ? zoomOutAnimationName
                      : fadeOutAnimationName
                } ${transitionDurationMs}ms ease-out both`,
              }}
            />
            <Image
              key={`current-${currentIndex}-${animationSeed}`}
              src={current.src}
              alt={current.alt}
              fill
              sizes="(max-width: 640px) 100vw, 640px"
              className="object-cover"
              style={{ animation: `${animationName} ${transitionDurationMs}ms ease-out both` }}
            />
          </>
        ) : (
          <Image
            key={`current-static-${currentIndex}`}
            src={current.src}
            alt={current.alt}
            fill
            sizes="(max-width: 640px) 100vw, 640px"
            className="object-cover"
            style={undefined}
          />
        )}
        {currentLink ? (
          <a
            href={currentLink.href}
            target={currentLink.external && currentLink.newTab ? "_blank" : undefined}
            rel={currentLink.external && currentLink.newTab ? "noopener noreferrer" : undefined}
            aria-label="スライドのリンクを開く"
            className="absolute inset-0 z-10"
            onClick={(e) => {
              if (Date.now() < suppressTapUntil) e.preventDefault();
            }}
          />
        ) : null}
        {showCaptions && current.caption ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/65 to-transparent px-3 py-2 text-sm text-white"
            style={getBodyFontSizeStyle()}
          >
            {current.caption}
          </div>
        ) : null}
        {canMove ? (
          <>
            <button
              type="button"
              aria-label="前のスライド"
              onClick={() => moveTo((currentIndex - 1 + normalizedSlides.length) % normalizedSlides.length, -1)}
              className={`absolute left-2 top-1/2 z-20 -translate-y-1/2 ${editorInnerRadiusClassName} bg-black/45 px-2 py-1 text-white hover:bg-black/60`}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="次のスライド"
              onClick={() => moveTo((currentIndex + 1) % normalizedSlides.length, 1)}
              className={`absolute right-2 top-1/2 z-20 -translate-y-1/2 ${editorInnerRadiusClassName} bg-black/45 px-2 py-1 text-white hover:bg-black/60`}
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
              {normalizedSlides.map((_, i) => (
                <button
                  key={`dot-${i}`}
                  type="button"
                  aria-label={`スライド ${i + 1}`}
                  aria-current={i === currentIndex ? "true" : "false"}
                  className={`h-2.5 w-2.5 ${editorInnerRadiusClassName} ${i === currentIndex ? "bg-white" : "bg-white/55"}`}
                  onClick={() => moveTo(i, i > currentIndex ? 1 : -1)}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
