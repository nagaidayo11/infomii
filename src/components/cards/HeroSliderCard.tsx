"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EditorCard } from "@/components/editor/types";
import { EditorCoverImage } from "@/components/editor/EditorCoverImage";
import { HERO_SLIDER_MAX_ITEMS } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { useCardContentEditor } from "./card-content-edit";
import { CardTitleInline, PlainInline } from "./card-inline-fields";

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

/** Warm decode cache so slide changes do not flash undecoded frames on mobile Safari. */
function decodeImageUrl(src: string): Promise<void> {
  if (typeof window === "undefined" || !src) return Promise.resolve();
  return new Promise((resolve) => {
    const img = document.createElement("img");
    const done = () => resolve();
    img.onload = () => {
      if (typeof img.decode === "function") {
        img.decode().then(done).catch(done);
      } else {
        done();
      }
    };
    img.onerror = done;
    img.src = src;
  });
}

export function HeroSliderCard({ card }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const editor = useCardContentEditor(card);
  const bind = { editable: editor.editable, onActivate: editor.onActivate };
  const content = editor.content;
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
  const [frontSlot, setFrontSlot] = useState<0 | 1>(0);
  const [slotIndices, setSlotIndices] = useState<[number, number]>([0, 0]);
  const [animating, setAnimating] = useState(false);
  const [outgoingSlot, setOutgoingSlot] = useState<0 | 1 | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [suppressTapUntil, setSuppressTapUntil] = useState(0);
  const indexRef = useRef(0);
  const slotLoadWaiterRef = useRef<{ slot: 0 | 1; resolve: () => void } | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const moveToRef = useRef<(nextIndex: number, dir: 1 | -1) => void>(() => {});

  const normalizedSlides = useMemo(
    () =>
      rawSlides
        .filter((s) => typeof s?.src === "string" && s.src.trim().length > 0)
        .slice(0, HERO_SLIDER_MAX_ITEMS)
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
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    void normalizedSlides.forEach((slide) => decodeImageUrl(slide.src));
  }, [normalizedSlides]);

  useEffect(() => {
    setSlotIndices([0, 0]);
    setFrontSlot(0);
    setIndex(0);
    setAnimating(false);
    setOutgoingSlot(null);
  }, [normalizedSlides]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current != null) window.clearTimeout(transitionTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!autoplay || reducedMotion || normalizedSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      const prev = indexRef.current;
      const n = normalizedSlides.length;
      const next = (prev + 1) % n;
      void moveToRef.current(next, 1);
    }, intervalSec * 1000);
    return () => window.clearInterval(timer);
  }, [autoplay, reducedMotion, normalizedSlides, intervalSec]);

  const heightClass =
    heightPreset === "s"
      ? "aspect-[2/1] min-h-[140px]"
      : heightPreset === "l"
        ? "h-72 sm:h-80"
        : "h-56 sm:h-64";

  const currentIndex = normalizedSlides.length === 0 ? 0 : index % normalizedSlides.length;
  const current = normalizedSlides[currentIndex];
  const currentLink = resolveSlideLink(current);
  const canMove = normalizedSlides.length > 1;
  const hasCaption = showCaptions && current.caption.trim().length > 0;
  const shouldAnimate = transitionEnabled && !reducedMotion;
  const dotBottomClass = hasCaption || bind.editable ? "bottom-1.5 sm:bottom-2" : "bottom-2";
  const titleFontWeight = getTitleFontSizeStyle().fontWeight;
  const rawSlideIndex = rawSlides.findIndex(
    (s) => typeof s?.src === "string" && s.src.trim() === current.src,
  );
  const captionSlideIndex = rawSlideIndex >= 0 ? rawSlideIndex : currentIndex;
  const useDoubleBuffer = canMove;

  const waitForSlotReady = useCallback((slot: 0 | 1) => {
    return new Promise<void>((resolve) => {
      const timeout = window.setTimeout(resolve, 1500);
      slotLoadWaiterRef.current = {
        slot,
        resolve: () => {
          window.clearTimeout(timeout);
          slotLoadWaiterRef.current = null;
          resolve();
        },
      };
    });
  }, []);

  const moveTo = useCallback(
    async (nextIndex: number, dir: 1 | -1) => {
      if (animating || nextIndex === currentIndex) return;
      const target = normalizedSlides[nextIndex];
      if (!target) return;
      if (target.src) await decodeImageUrl(target.src);

      if (!useDoubleBuffer) {
        setIndex(nextIndex);
        setSlotIndices([nextIndex, nextIndex]);
        return;
      }

      const backSlot = (frontSlot === 0 ? 1 : 0) as 0 | 1;
      setSlotIndices((prev) => {
        const next: [number, number] = [...prev];
        next[backSlot] = nextIndex;
        return next;
      });
      await waitForSlotReady(backSlot);
      if (target.src) {
        const probe = new Image();
        probe.src = target.src;
        if (probe.complete) {
          const waiter = slotLoadWaiterRef.current;
          if (waiter?.slot === backSlot) waiter.resolve();
        }
      }

      if (!shouldAnimate) {
        setFrontSlot(backSlot);
        setIndex(nextIndex);
        return;
      }

      setDirection(dir);
      setOutgoingSlot(frontSlot);
      setAnimating(true);

      if (transitionTimerRef.current != null) window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = window.setTimeout(() => {
        transitionTimerRef.current = null;
        setFrontSlot(backSlot);
        setIndex(nextIndex);
        setAnimating(false);
        setOutgoingSlot(null);
      }, transitionDurationMs);
    },
    [
      animating,
      currentIndex,
      frontSlot,
      normalizedSlides,
      shouldAnimate,
      transitionDurationMs,
      useDoubleBuffer,
      waitForSlotReady,
    ],
  );

  moveToRef.current = (nextIndex, dir) => {
    void moveTo(nextIndex, dir);
  };

  const handleSlotImageLoad = useCallback((slot: 0 | 1) => {
    const waiter = slotLoadWaiterRef.current;
    if (waiter?.slot === slot) waiter.resolve();
  }, []);

  /** Incoming slide sits underneath at full opacity; only the outgoing layer animates (reduces iOS/Safari flicker). */
  const slideInAnimationName =
    transitionType === "slide" ? (direction === 1 ? "heroSliderSlideInNext" : "heroSliderSlideInPrev") : null;
  const slideOutAnimationName = direction === 1 ? "heroSliderSlideOutNext" : "heroSliderSlideOutPrev";
  const fadeOutAnimationName = "heroSliderFadeOut";
  const zoomOutAnimationName = "heroSliderZoomOut";
  const zoomInAnimationName = "heroSliderZoomIn";

  const outgoingAnimation =
    transitionType === "slide"
      ? slideOutAnimationName
      : transitionType === "zoom"
        ? zoomOutAnimationName
        : fadeOutAnimationName;

  const layerGpu = "pointer-events-none absolute inset-0 [backface-visibility:hidden] [transform:translateZ(0)]";

  const renderSlideLayer = (slot: 0 | 1) => {
    const slideIndex = slotIndices[slot] % normalizedSlides.length;
    const slide = normalizedSlides[slideIndex]!;
    const inactiveSlot = (frontSlot === 0 ? 1 : 0) as 0 | 1;
    const isOutgoing = animating && outgoingSlot === slot;
    const isIncoming = animating && slot === inactiveSlot;
    const isHidden = !animating && frontSlot !== slot;

    const incomingAnimationStyle =
      isIncoming && transitionType !== "fade"
        ? ({
            animation: `${transitionType === "zoom" ? zoomInAnimationName : slideInAnimationName} ${transitionDurationMs}ms ease-out both`,
            transform: "translateZ(0)",
            WebkitBackfaceVisibility: "hidden" as const,
          } as const)
        : undefined;

    const layerStyle = isOutgoing
      ? {
          animation: `${outgoingAnimation} ${transitionDurationMs}ms ease-out both`,
          transform: "translateZ(0)",
          WebkitBackfaceVisibility: "hidden" as const,
        }
      : isHidden
        ? { opacity: 0 }
        : incomingAnimationStyle ?? {
            transform: "translateZ(0)",
            WebkitBackfaceVisibility: "hidden" as const,
          };

    const zClass = isOutgoing
      ? "z-[2] will-change-[opacity,transform]"
      : isHidden
        ? "z-0"
        : "z-[1] will-change-transform";

    return (
      <div
        key={`hero-slot-${slot}`}
        className={`${layerGpu} ${zClass}`}
        aria-hidden={isHidden && !animating}
      >
        <div className="relative h-full w-full">
          <EditorCoverImage
            src={slide.src}
            alt={slide.alt}
            sizes="(max-width: 640px) 100vw, 640px"
            className="object-cover object-center"
            style={layerStyle}
            priority={slideIndex === 0}
            decoding="sync"
            onLoad={() => handleSlotImageLoad(slot)}
          />
        </div>
      </div>
    );
  };

  if (!hasSlides || !current || normalizedSlides.length === 0) {
    return (
      <section data-inner-surface className={`${editorInnerRadiusClassName} border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500`}>
        {title ? <p className={`mb-1 ${CARD_BLOCK_TITLE_CLASS}`} style={getTitleFontSizeStyle()}>{title}</p> : null}
        スライド画像が未設定です。設定パネルから画像を追加してください。
      </section>
    );
  }

  return (
    <section className="w-full space-y-3">
      {bind.editable ? (
        <CardTitleInline
          title={title}
          onSave={(v) => editor.setPlainField("title", v)}
          placeholder="見出し（任意）"
          bind={bind}
        />
      ) : title ? (
        <h3 className={`px-1 text-base ${CARD_BLOCK_TITLE_CLASS}`} style={getTitleFontSizeStyle()}>
          {title}
        </h3>
      ) : null}
      <div
        data-inner-surface
        className={`hero-slider-frame relative isolate w-full overflow-hidden ${editorInnerRadiusClassName} bg-slate-900 ${heightClass}`}
        onTouchStart={(e) => setTouchStartX(e.touches[0]?.clientX ?? null)}
        onTouchEnd={(e) => {
          if (!canMove || touchStartX == null) return;
          const endX = e.changedTouches[0]?.clientX ?? touchStartX;
          const delta = endX - touchStartX;
          if (Math.abs(delta) < 40) return;
          setSuppressTapUntil(Date.now() + 350);
          if (delta < 0) void moveTo((currentIndex + 1) % normalizedSlides.length, 1);
          else void moveTo((currentIndex - 1 + normalizedSlides.length) % normalizedSlides.length, -1);
        }}
      >
        {useDoubleBuffer ? (
          <>
            {renderSlideLayer(0)}
            {renderSlideLayer(1)}
          </>
        ) : (
          <div className={`${layerGpu} z-[1]`}>
            <div className="relative h-full w-full">
              <EditorCoverImage
                src={current.src}
                alt={current.alt}
                sizes="(max-width: 640px) 100vw, 640px"
                className="object-cover object-center"
                style={{ transform: "translateZ(0)", WebkitBackfaceVisibility: "hidden" }}
                priority
                decoding="sync"
              />
            </div>
          </div>
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
        {showCaptions && (hasCaption || bind.editable) ? (
          <div
            className={
              "absolute inset-x-0 bottom-0 z-20 flex min-h-14 items-end bg-gradient-to-t from-black/65 to-transparent px-3 pb-4 pt-2 text-sm text-white sm:pb-5 " +
              (bind.editable ? "pointer-events-auto" : "pointer-events-none")
            }
            style={{ ...getBodyFontSizeStyle(), fontWeight: titleFontWeight }}
          >
            {bind.editable ? (
              <PlainInline
                value={current.caption}
                onSave={(v) => editor.setArrayItemField("slides", captionSlideIndex, "caption", v, false)}
                bind={bind}
                className="block w-full text-sm text-white"
                placeholder="キャプション"
              />
            ) : (
              current.caption
            )}
          </div>
        ) : null}
        {canMove ? (
          <>
            <button
              type="button"
              aria-label="前のスライド"
              onClick={() => void moveTo((currentIndex - 1 + normalizedSlides.length) % normalizedSlides.length, -1)}
              className={`hero-slider-nav-btn absolute left-2 top-1/2 z-20 -translate-y-1/2 ${editorInnerRadiusClassName} bg-black/45 px-2 py-1 text-xs text-white hover:bg-black/60`}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="次のスライド"
              onClick={() => void moveTo((currentIndex + 1) % normalizedSlides.length, 1)}
              className={`hero-slider-nav-btn absolute right-2 top-1/2 z-20 -translate-y-1/2 ${editorInnerRadiusClassName} bg-black/45 px-2 py-1 text-xs text-white hover:bg-black/60`}
            >
              ›
            </button>
            <div className={`absolute left-1/2 z-20 flex -translate-x-1/2 gap-1.5 ${dotBottomClass}`}>
              {normalizedSlides.map((_, i) => (
                <button
                  key={`dot-${i}`}
                  type="button"
                  aria-label={`スライド ${i + 1}`}
                  aria-current={i === currentIndex ? "true" : "false"}
                  className={`hero-slider-dot h-2.5 w-2.5 min-h-0 min-w-0 p-0 ${editorInnerRadiusClassName} ${i === currentIndex ? "bg-white" : "bg-white/55"}`}
                  onClick={() => void moveTo(i, i > currentIndex ? 1 : -1)}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
