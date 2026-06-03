"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CardRenderer } from "@/components/cards/CardRenderer";
import {
  getLibrarySections,
  getQuickPresets,
  type LibraryAudience,
  type LibraryItem,
  type QuickPreset,
} from "@/lib/editor/card-library-config";
import { BUSINESS_ONLY_CARD_TYPES, CARD_TYPE_LABELS, createEmptyCard, type CardType, type EditorCard } from "./types";
import { useEditorHoverPreviewEnabled } from "./useEditorHoverPreview";
import { useClientShell } from "@/components/app-shell/useClientShell";

export { LIBRARY_SECTIONS_HOTEL as LIBRARY_SECTIONS } from "@/lib/editor/card-library-config";

type CardLibraryProps = {
  onAddCard: (type: CardType) => void;
  onAddPreset?: (types: CardType[]) => void;
  canUseBusinessBlocks?: boolean;
  onLockedAddCard?: (type: CardType) => void;
  libraryAudience: LibraryAudience;
  onLibraryAudienceChange: (audience: LibraryAudience) => void;
};

function BusinessBadge() {
  return (
    <span
      className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-violet-300 bg-violet-100 text-violet-700"
      aria-label="Business"
      title="Business"
    >
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M4 18h16l-1.4-8.3a1 1 0 0 0-1.66-.58L13.7 12.1a1 1 0 0 1-1.4 0L7.06 9.12a1 1 0 0 0-1.66.58L4 18zm3.2-11.5a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4zm9.6 0a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4zM12 8.1A1.9 1.9 0 1 0 12 4.3a1.9 1.9 0 0 0 0 3.8z" />
      </svg>
    </span>
  );
}

type TooltipPosition = {
  left: number;
  top: number;
  side: "right" | "left";
};

const TOOLTIP_VIEWPORT_MARGIN = 10;
/** Layout width for desktop hover tooltip (readable “phone-ish” preview). */
const LIVE_PREVIEW_NATURAL_WIDTH = 300;
/** Slightly shrink live block chrome on desktop hover preview only. */
const LIVE_PREVIEW_DETAIL_SCALE = 0.935;

/** 外枠はそのまま、内側のブロック表示を枠いっぱいに広げる（モバイル / アプリ） */
function useLibraryPreviewExpandInner(): boolean {
  const { isAppShell } = useClientShell();
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return isAppShell || mobile;
}
/**
 * Fallback width for horizontal placement before the tooltip first measures — approx. preview column + paddings/chrome.
 */
const TOOLTIP_PLACEHOLDER_WIDTH = LIVE_PREVIEW_NATURAL_WIDTH + 88;
const TOOLTIP_GAP = 8;
/** Motion rhythm aligned with onboarding UI timings. */
const HOVER_OPEN_DELAY_MS = 150;
const HOVER_CLOSE_DELAY_MS = 100;
/** Hover preview fade out duration (matches CSS transition). */
const TOOLTIP_FADE_MS = 220;

type PreviewMode = "live" | "image" | "text";
type PreviewSpec = {
  mode: PreviewMode;
  title: string;
  previewData?: { card: EditorCard };
  imageSrc?: string;
  imageAlt?: string;
  showImage?: boolean;
};

const PREVIEW_SPEC_BY_TYPE: Record<CardType, PreviewSpec> = (Object.keys(CARD_TYPE_LABELS) as CardType[]).reduce(
  (acc, type) => {
    const previewCard = createEmptyCard(type, `preview-${type}`, 0);
    acc[type] = {
      mode: "live",
      title: CARD_TYPE_LABELS[type],
      previewData: { card: previewCard },
      showImage: false,
    };
    return acc;
  },
  {} as Record<CardType, PreviewSpec>
);

function LiveCardPreview({ card, expandInner = false }: { card: EditorCard; expandInner?: boolean }) {
  if (expandInner) {
    return (
      <div data-library-live-preview className="library-preview-root w-full">
        <div className="library-preview-frame box-border w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
          <div className="library-preview-inner w-full min-w-0 overflow-hidden">
            <CardRenderer card={card} />
          </div>
        </div>
      </div>
    );
  }

  const scaledRef = useRef<HTMLDivElement | null>(null);
  /**
   * Avoid a tall placeholder height (previously 480px): it inflated the tooltip on first layout,
   * then `ResizeObserver` recomputed a smaller height and `top` jumped downward.
   * Until the first measure, only fix width so natural height matches content immediately.
   */
  const [clipBox, setClipBox] = useState<{ w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const scaled = scaledRef.current;
    if (!scaled) return;

    const fit = () => {
      const r = scaled.getBoundingClientRect();
      const w = r.width;
      const h = r.height;
      if (w <= 1 || h <= 1) return;
      setClipBox({ w, h });
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(scaled);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [card.type, card.id]);

  const clipWidth = clipBox?.w ?? LIVE_PREVIEW_NATURAL_WIDTH * LIVE_PREVIEW_DETAIL_SCALE;
  const clipStyle =
    clipBox != null ? { width: clipBox.w, height: clipBox.h } : { width: clipWidth };

  return (
    <div
      data-library-live-preview
      className="box-border flex w-fit max-w-full justify-center bg-transparent p-0"
    >
      <div className="max-w-full overflow-hidden" style={clipStyle}>
        <div
          ref={scaledRef}
          style={{
            width: LIVE_PREVIEW_NATURAL_WIDTH,
            transform: `scale(${LIVE_PREVIEW_DETAIL_SCALE})`,
            transformOrigin: "top left",
          }}
        >
          <div className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
            <CardRenderer card={card} />
          </div>
        </div>
      </div>
    </div>
  );
}

function renderPreviewVisual(item: LibraryItem, spec: PreviewSpec, expandInner: boolean) {
  const previewCard = spec.previewData?.card;
  if (!previewCard) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white text-slate-500">
        <span className="text-xs">プレビューを読み込めません</span>
      </div>
    );
  }
  return (
    <div className={expandInner ? "w-full" : "w-fit max-w-full"}>
      <LiveCardPreview card={previewCard} expandInner={expandInner} />
    </div>
  );
}

function LibraryTooltipPortal({
  open,
  tooltipId,
  item,
  spec,
  anchorRef,
  expandInner,
}: {
  open: boolean;
  tooltipId: string;
  item: LibraryItem;
  spec: PreviewSpec;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  expandInner: boolean;
}) {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const exitTimerRef = useRef<number | null>(null);
  const wasPlacedRef = useRef(false);
  const isBusinessType = BUSINESS_ONLY_CARD_TYPES.includes(item.type);
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({ left: -99999, top: -99999, side: "right" });
  /** After first clamp pass, avoids a one-frame flicker at the origin. */
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    if (open) {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      setMounted(true);
      return;
    }
    const delay = wasPlacedRef.current ? TOOLTIP_FADE_MS : 0;
    exitTimerRef.current = window.setTimeout(() => {
      setMounted(false);
      wasPlacedRef.current = false;
      exitTimerRef.current = null;
    }, delay);
    return () => {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, [open]);

  useEffect(() => {
    if (!mounted || !placed || !open) {
      setEntered(false);
      return;
    }
    let rafIn = 0;
    rafIn = window.requestAnimationFrame(() => setEntered(true));
    return () => {
      window.cancelAnimationFrame(rafIn);
    };
  }, [mounted, placed, open]);

  useLayoutEffect(() => {
    if (!mounted) {
      setPlaced(false);
      return;
    }

    let raf = 0;

    const updatePosition = () => {
      const anchorEl = anchorRef.current;
      if (!anchorEl) return;
      cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => {
        const rect = anchorEl.getBoundingClientRect();
        const tipEl = tooltipRef.current;
        const tipRect = tipEl?.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let tw = tipRect && tipRect.width > 48 ? tipRect.width : TOOLTIP_PLACEHOLDER_WIDTH;
        let th = tipRect && tipRect.height > 48 ? tipRect.height : 250;

        tw = Math.min(tw, vw - TOOLTIP_VIEWPORT_MARGIN * 2);

        const preferRight = rect.right + TOOLTIP_GAP + tw <= vw - TOOLTIP_VIEWPORT_MARGIN;
        const side: "right" | "left" = preferRight ? "right" : "left";

        let left =
          side === "right" ? rect.right + TOOLTIP_GAP : rect.left - tw - TOOLTIP_GAP;
        left = Math.max(TOOLTIP_VIEWPORT_MARGIN, Math.min(left, vw - tw - TOOLTIP_VIEWPORT_MARGIN));

        const maxTop = vh - th - TOOLTIP_VIEWPORT_MARGIN;
        const top = Math.max(
          TOOLTIP_VIEWPORT_MARGIN,
          Number.isFinite(maxTop) ? Math.min(rect.top, maxTop) : rect.top
        );

        setPosition({ left, top, side });
        wasPlacedRef.current = true;
        setPlaced(true);
      });
    };

    updatePosition();

    let roTip: ResizeObserver | null = null;
    const attachRo = () => {
      roTip?.disconnect();
      const el = tooltipRef.current;
      if (!el) return false;
      roTip = new ResizeObserver(updatePosition);
      roTip.observe(el);
      return true;
    };
    let attachRaf = 0;
    if (!attachRo()) {
      attachRaf = requestAnimationFrame(() => {
        attachRo();
      });
    }

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(attachRaf);
      roTip?.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [mounted, item.type]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={tooltipRef}
      id={tooltipId}
      role="tooltip"
      className={
        "pointer-events-none fixed z-[9999] box-border w-max max-w-[min(calc(100vw-20px),588px)] min-w-[min(232px,calc(100vw-28px))] rounded-xl border border-slate-200 bg-white p-2.5 text-[11px] leading-snug text-slate-700 shadow-[0_10px_28px_rgba(15,23,42,0.2)] transition-opacity duration-200 ease-out will-change-[opacity] motion-reduce:transition-none " +
        (entered ? "opacity-100" : "opacity-0")
      }
      style={{
        left: position.left,
        top: position.top,
      }}
    >
      <div className="pointer-events-auto max-h-[calc(100vh-40px)] min-h-0 overflow-y-auto overflow-x-hidden">
        <div className={expandInner ? "w-full overflow-hidden" : "flex justify-center overflow-hidden"}>
          {renderPreviewVisual(item, spec, expandInner)}
        </div>
        <p className="mt-1.5 text-xs font-semibold text-slate-900">{spec.title}</p>
        <p className={"mt-1 text-[11px] leading-[1.45] " + (isBusinessType ? "text-violet-600" : "text-slate-500")}>
          {item.description}
        </p>
      </div>
    </div>,
    document.body
  );
}

function DescriptionWithTooltip({
  item,
  parentOpen,
  anchorRef,
  libraryAudience,
  mobilePreviewOpen,
  onMobilePreviewOpenChange,
  onCloseMobilePreview,
}: {
  item: LibraryItem;
  parentOpen: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  libraryAudience: LibraryAudience;
  mobilePreviewOpen: boolean;
  onMobilePreviewOpenChange: (open: boolean) => void;
  onCloseMobilePreview: () => void;
}) {
  const previewCard = useMemo(
    () => createEmptyCard(item.type, `preview-${item.type}-${libraryAudience}`, 0, libraryAudience),
    [item.type, libraryAudience],
  );
  const spec: PreviewSpec = {
    mode: "live",
    title: item.label,
    previewData: { card: previewCard },
    showImage: false,
  };
  const tooltipId = useId();
  const showTooltip = parentOpen || mobilePreviewOpen;
  const previewExpandInner = useLibraryPreviewExpandInner();

  useEffect(() => {
    if (!mobilePreviewOpen) return;
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseMobilePreview();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [mobilePreviewOpen, onCloseMobilePreview]);

  const toggleMobileTooltip = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onMobilePreviewOpenChange(!mobilePreviewOpen);
  };

  return (
    <span className="relative block h-4 w-4 shrink-0">
      <span
        role="button"
        tabIndex={0}
        data-mobile-tooltip-trigger="true"
        aria-label="説明文を表示"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 bg-white text-[10px] font-semibold leading-none text-slate-500 lg:hidden"
        onClick={toggleMobileTooltip}
        onKeyDown={(e) => {
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          e.stopPropagation();
          onMobilePreviewOpenChange(!mobilePreviewOpen);
        }}
        aria-expanded={showTooltip}
        aria-controls={tooltipId}
      >
        i
      </span>
      <LibraryTooltipPortal
        open={parentOpen}
        tooltipId={tooltipId}
        item={item}
        spec={spec}
        anchorRef={anchorRef}
        expandInner={previewExpandInner}
      />
      {mobilePreviewOpen ? (
        createPortal(
          <div
            data-mobile-block-preview-overlay="true"
            className="fixed inset-0 z-[10000] bg-black/35 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={`${item.label}のプレビュー`}
            onPointerDownCapture={(e) => {
              if (e.target !== e.currentTarget) return;
              e.preventDefault();
              e.stopPropagation();
            }}
            onClickCapture={(e) => {
              if (e.target !== e.currentTarget) return;
              e.preventDefault();
              e.stopPropagation();
              onCloseMobilePreview();
            }}
          >
            <div
              data-mobile-tooltip-panel="true"
              className="pointer-events-auto mx-auto mt-[10vh] w-[calc(100%-2rem)] max-w-sm rounded-xl border border-slate-200 bg-white p-2.5 shadow-xl"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full overflow-hidden">{renderPreviewVisual(item, spec, previewExpandInner)}</div>
              <div>
                <p className="mt-1.5 text-xs font-semibold text-slate-900">{spec.title}</p>
                <p
                  className={
                    "mt-1 text-[11px] leading-[1.45] " +
                    (BUSINESS_ONLY_CARD_TYPES.includes(item.type) ? "text-violet-600" : "text-slate-500")
                  }
                >
                  {item.description}
                </p>
              </div>
            </div>
          </div>,
          document.body
        )
      ) : null}
    </span>
  );
}

export const CARD_ICONS: Record<CardType, React.ReactNode> = {
  hero: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  hero_slider: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M8 15h6M6.5 12l-1.5 1.5L6.5 15m11-3 1.5 1.5-1.5 1.5" />
    </svg>
  ),
  heading_body: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  ),
  info: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  highlight: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  action: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  ),
  welcome: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  wifi: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  breakfast: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  checkout: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  notice: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  nearby: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  map: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  button: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  image: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  video: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  gallery: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth={2} />
      <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth={2} />
      <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth={2} />
      <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth={2} />
    </svg>
  ),
  faq: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  emergency: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  laundry: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  taxi: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  restaurant: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  spa: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  text: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  ),
  icon: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4m0 4h.01" />
    </svg>
  ),
  schedule: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  menu: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  divider: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" />
    </svg>
  ),
  space: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 16h14M8 12h8" />
    </svg>
  ),
  parking: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
  pageLinks: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  quote: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8H6v4h3v4H5v-4c0-2.2 1.8-4 4-4zM19 8h-3v4h3v4h-4v-4c0-2.2 1.8-4 4-4z" />
    </svg>
  ),
  checklist: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h11M4 12h11M4 17h11m3-10 1.5 1.5L22 6m-4 6 1.5 1.5L22 11m-4 6 1.5 1.5L22 16" />
    </svg>
  ),
  steps: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="6" cy="6" r="2" strokeWidth={2} />
      <circle cx="18" cy="12" r="2" strokeWidth={2} />
      <circle cx="6" cy="18" r="2" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7.2 16 10.8M16 13.2 8 16.8" />
    </svg>
  ),
  compare: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="5" width="8" height="14" rx="1.5" strokeWidth={2} />
      <rect x="13" y="5" width="8" height="14" rx="1.5" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 9h.01M17 9h.01" />
    </svg>
  ),
  kpi: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 18h16" />
      <rect x="6" y="11" width="3" height="5" rx=".6" strokeWidth={2} />
      <rect x="11" y="8" width="3" height="8" rx=".6" strokeWidth={2} />
      <rect x="16" y="5" width="3" height="11" rx=".6" strokeWidth={2} />
    </svg>
  ),
  campaign_timer: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="13" r="7" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4l2 2M9 3h6" />
    </svg>
  ),
  tabs_info: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 9h3m4 0h3M7 13h10" />
    </svg>
  ),
  faq_search: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m20 20-3.5-3.5" />
    </svg>
  ),
  notice_ticker: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 11h14m0 0-3-3m3 3-3 3M3 6h18M3 18h18" />
    </svg>
  ),
  coupon: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 1 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 1 0 0-4V9z" />
    </svg>
  ),
  accordion_info: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  open_status: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2" />
    </svg>
  ),
  social_links: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M12 8v8" />
      <circle cx="6" cy="12" r="2" strokeWidth={2} />
      <circle cx="18" cy="12" r="2" strokeWidth={2} />
    </svg>
  ),
  contact_hub: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18v14H3z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9 6 9-6" />
    </svg>
  ),
  progress_steps: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="5" cy="12" r="2" strokeWidth={2} />
      <circle cx="12" cy="12" r="2" strokeWidth={2} />
      <circle cx="19" cy="12" r="2" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12h3m4 0h3" />
    </svg>
  ),
  emergency_banner: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 4h.01M4 19h16L12 4z" />
    </svg>
  ),
  scheduled_banner: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="4" y="5" width="16" height="14" rx="2" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3v4m8-4v4m-8 6h8" />
    </svg>
  ),
  menu_categories: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h6v4H4V6zm10 0h6v4h-6V6zM4 14h6v4H4v-4zm10 0h6v4h-6v-4z" />
    </svg>
  ),
  daily_special: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  drink_menu: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3h6v3l-1 9H10L9 6V3zM7 21h10" />
    </svg>
  ),
  salon_service_menu: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-2-11a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  combo_set_menu: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  menu_grid: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16v14H4z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 10h16M10 5v14M16 5v14" />
    </svg>
  ),
  menu_sheet_sync: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h10M4 17h14M17 12l3 3m0 0l3-3m-3 3V4" />
    </svg>
  ),
  menu_time_band: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2" />
    </svg>
  ),
};

function LibraryItemButton({
  sectionId,
  item,
  isBusinessType,
  disabled,
  onAdd,
  libraryAudience,
}: {
  sectionId: string;
  item: LibraryItem;
  isBusinessType: boolean;
  disabled: boolean;
  onAdd: (type: CardType) => void;
  libraryAudience: LibraryAudience;
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const openTimerRef = useRef<number | null>(null);
  const blockAddClickRef = useRef(false);
  const [hoverOpen, setHoverOpen] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const hoverPreviewEnabled = useEditorHoverPreviewEnabled();

  const closeMobilePreview = useCallback(() => {
    blockAddClickRef.current = true;
    setMobilePreviewOpen(false);
    window.setTimeout(() => {
      blockAddClickRef.current = false;
    }, 450);
  }, []);

  const clearTimers = () => {
    if (openTimerRef.current) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  useEffect(() => () => clearTimers(), []);

  const handlePointerEnter = () => {
    if (!hoverPreviewEnabled) return;
    clearTimers();
    openTimerRef.current = window.setTimeout(() => setHoverOpen(true), HOVER_OPEN_DELAY_MS);
  };

  const handlePointerLeave = () => {
    if (!hoverPreviewEnabled) return;
    clearTimers();
    closeTimerRef.current = window.setTimeout(() => setHoverOpen(false), HOVER_CLOSE_DELAY_MS);
  };

  const handleAddClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (blockAddClickRef.current || mobilePreviewOpen) {
      e.preventDefault();
      e.stopPropagation();
      if (mobilePreviewOpen) closeMobilePreview();
      return;
    }
    clearTimers();
    setHoverOpen(false);
    setFocusOpen(false);
    onAdd(item.type);
  };

  const handleRowPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!mobilePreviewOpen) return;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <button
      ref={buttonRef}
      key={`${sectionId}-${item.type}`}
      type="button"
      onClick={handleAddClick}
      onPointerDown={handleRowPointerDown}
      onPointerEnter={hoverPreviewEnabled ? handlePointerEnter : undefined}
      onPointerLeave={hoverPreviewEnabled ? handlePointerLeave : undefined}
      onFocus={() => {
        if (hoverPreviewEnabled) setFocusOpen(true);
      }}
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        setFocusOpen(false);
      }}
      className={
        "ui-focus-ring ui-pop-tap group/item relative z-10 flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all active:bg-slate-100 lg:hover:z-50 lg:focus:z-50 lg:focus-within:z-50 " +
        (!disabled
          ? "lg:hover:bg-slate-50 lg:hover:shadow-sm"
          : "cursor-not-allowed opacity-55")
      }
      aria-label={`${item.label}を追加`}
      title={disabled ? "Businessプラン限定ブロックです" : undefined}
    >
      <span
        className={
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.8] [&_svg_*]:stroke-linecap-round [&_svg_*]:stroke-linejoin-round " +
          (disabled
            ? "border border-violet-300 bg-violet-100 text-violet-700"
            : "bg-slate-100")
        }
      >
        {CARD_ICONS[item.type] ?? CARD_ICONS.text}
      </span>
      <div className="relative min-w-0 flex-1 pr-6">
        <span
          className={
            "flex h-9 items-center gap-1 truncate text-[15px] font-medium leading-none " +
            (isBusinessType ? "text-violet-700" : "text-slate-800")
          }
        >
          <span className="truncate">{item.label}</span>
          {isBusinessType ? (
            <BusinessBadge />
          ) : null}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center">
          <DescriptionWithTooltip
            item={item}
            parentOpen={hoverPreviewEnabled && (hoverOpen || focusOpen)}
            anchorRef={buttonRef}
            libraryAudience={libraryAudience}
            mobilePreviewOpen={mobilePreviewOpen}
            onMobilePreviewOpenChange={setMobilePreviewOpen}
            onCloseMobilePreview={closeMobilePreview}
          />
        </span>
      </div>
    </button>
  );
}

/**
 * Left panel: Card Library — grouped by purpose (main view, guides, safety, access, trust, layout).
 * Click inserts a card into the canvas.
 */
export function CardLibrary({
  onAddCard,
  onAddPreset,
  canUseBusinessBlocks = false,
  onLockedAddCard,
  libraryAudience,
  onLibraryAudienceChange,
}: CardLibraryProps) {
  const librarySections = getLibrarySections(libraryAudience);
  const quickPresets = getQuickPresets(libraryAudience);
  const canAdd = (type: CardType) => canUseBusinessBlocks || !BUSINESS_ONLY_CARD_TYPES.includes(type);
  const canAddPreset = (types: CardType[]) => types.every((type) => canAdd(type));
  const handleAdd = (type: CardType) => {
    if (!canAdd(type)) {
      onLockedAddCard?.(type);
      return;
    }
    onAddCard(type);
  };
  const handleAddPreset = (preset: QuickPreset) => {
    if (!canAddPreset(preset.types)) {
      const locked = preset.types.find((type) => !canAdd(type));
      if (locked) onLockedAddCard?.(locked);
      return;
    }
    onAddPreset?.(preset.types);
  };
  return (
    <div className="flex h-full flex-col overflow-visible [font-family:'M_PLUS_Rounded_1c','Noto_Sans_JP',sans-serif]">
      <div className="shrink-0 border-b border-slate-200/80 px-3 py-3">
        <h2 className="text-sm font-semibold text-slate-700 [font-family:'M_PLUS_Rounded_1c','Noto_Sans_JP',sans-serif]">
          ブロックライブラリ
        </h2>
        <p className="mt-1 text-xs text-slate-500">クリックでキャンバスに追加</p>
        <div
          className="mt-2.5 inline-flex w-full rounded-lg border border-slate-200 bg-slate-50/80 p-0.5"
          role="tablist"
          aria-label="ブロックライブラリの用途"
        >
          {(
            [
              { id: "hotel" as const, label: "宿泊施設" },
              { id: "personal" as const, label: "個人・友達向け" },
            ] as const
          ).map((tab) => {
            const selected = libraryAudience === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onLibraryAudienceChange(tab.id)}
                className={
                  "ui-pop-tap min-h-[36px] flex-1 rounded-md px-2 py-1.5 text-center text-[11px] font-semibold transition " +
                  (selected
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80"
                    : "text-slate-500 lg:hover:text-slate-700")
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-3">
          {onAddPreset && (
            <section aria-label="おすすめセット" className="space-y-2">
              <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 [font-family:'M_PLUS_Rounded_1c','Noto_Sans_JP',sans-serif]">
                おすすめセット
              </h3>
              <div className="space-y-1">
                {quickPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    className={
                      "ui-pop-tap ui-pop-card w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left transition-all " +
                      (canAddPreset(preset.types)
                        ? "lg:hover:border-slate-300 lg:hover:bg-slate-50 lg:hover:shadow-[0_1px_2px_rgba(15,23,42,0.06)] active:bg-slate-50"
                        : "border-violet-300 bg-violet-50/70")
                    }
                    aria-label={`${preset.label}を追加`}
                    title={canAddPreset(preset.types) ? undefined : "Businessプランで利用できます"}
                  >
                    <span className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                      {preset.label}
                      {preset.businessOnly ? (
                        <BusinessBadge />
                      ) : null}
                    </span>
                    <span className="mt-1 block text-xs font-medium text-slate-600">{preset.purpose}</span>
                    <span className="mt-1 block text-[11px] font-normal leading-[1.45] text-slate-500">{preset.description}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
          {librarySections.map((section) => (
            <section
              key={section.id}
              aria-label={section.title}
              className="relative isolate space-y-1 pt-3 first:pt-0"
            >
              <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 [font-family:'M_PLUS_Rounded_1c','Noto_Sans_JP',sans-serif]">
                {section.title}
              </h3>
              <div className="relative space-y-1">
                {section.items.map((item) => {
                  const isBusinessType = BUSINESS_ONLY_CARD_TYPES.includes(item.type);
                  return (
                    <LibraryItemButton
                      key={`${section.id}-${item.type}`}
                      sectionId={section.id}
                      item={item}
                      isBusinessType={isBusinessType}
                      disabled={!canAdd(item.type)}
                      onAdd={handleAdd}
                      libraryAudience={libraryAudience}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
