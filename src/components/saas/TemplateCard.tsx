"use client";

import { useEffect, useState } from "react";
import { EditorCoverImage } from "@/components/editor/EditorCoverImage";
import {
  resolveTemplateCardImageSrc,
  TEMPLATE_MARKETPLACE_CATEGORY_FALLBACKS,
} from "@/lib/template-preview";
import { TEMPLATE_CATEGORY_LABELS } from "@/lib/template-marketplace-meta";

const DEFAULT_FALLBACK = "/preset-hero-sample.png";

export type TemplateCardProps = {
  id: string;
  slug?: string | null;
  name: string;
  description: string;
  preview_image: string;
  category?: string | null;
  onUse: () => void;
  onPreview?: () => void;
  using?: boolean;
  variant?: "default" | "app";
};

export function TemplateCard({
  slug,
  name,
  description,
  preview_image,
  category,
  onUse,
  onPreview,
  using,
  variant = "default",
}: TemplateCardProps) {
  const isApp = variant === "app";
  const categoryFallback =
    (category ? TEMPLATE_MARKETPLACE_CATEGORY_FALLBACKS[category] : "") || DEFAULT_FALLBACK;
  const primarySrc = resolveTemplateCardImageSrc(
    preview_image,
    category ?? null,
    name,
    categoryFallback,
    slug,
  );
  const [displaySrc, setDisplaySrc] = useState(primarySrc);
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setDisplaySrc(primarySrc);
      setImageReady(false);
    });
    if (!primarySrc) {
      return () => window.cancelAnimationFrame(frame);
    }
    // Cached static assets (Safari / WebView) may not fire onLoad after src changes.
    const timer = window.setTimeout(() => setImageReady(true), 600);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [primarySrc]);

  const placeholderGradient =
    category === "travel"
      ? "from-slate-100 via-slate-50 to-white"
      : category === "oshi"
        ? "from-slate-100 via-slate-50 to-white"
        : category === "personal"
          ? "from-sky-100 via-slate-50 to-white"
          : category === "food"
            ? "from-slate-100 via-slate-50 to-white"
            : category === "lightbiz"
      ? "from-slate-100 via-slate-50 to-white"
      : "from-slate-200 via-slate-100 to-white";
  const categoryLabel = category ? TEMPLATE_CATEGORY_LABELS[category] : null;

  return (
    <article
      className={
        isApp
          ? "app-template-card app-template-card--native ui-pop-card flex h-full flex-col overflow-hidden border transition"
          : "flex h-full flex-col overflow-hidden rounded-lg border border-[#e6e8eb] bg-white transition hover:border-slate-300"
      }
    >
      <div
        className={`relative flex ${isApp ? "app-template-card-media" : "aspect-[5/3]"} items-center justify-center overflow-hidden bg-gradient-to-br ${placeholderGradient}`}
      >
        {displaySrc ? (
          <>
            <div
              aria-hidden
              className={
                "absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-300/70 to-slate-200 transition-opacity duration-200 " +
                (imageReady ? "opacity-0" : "opacity-100")
              }
            />
            <EditorCoverImage
              src={displaySrc}
              alt=""
              priority
              decoding="sync"
              sizes="(max-width: 640px) 88vw, 320px"
              className={
                "object-cover object-center transition-opacity duration-200 " +
                (imageReady ? "opacity-100" : "opacity-0")
              }
              onLoad={() => setImageReady(true)}
              onError={() => {
                if (displaySrc !== categoryFallback) {
                  setDisplaySrc(categoryFallback);
                  setImageReady(false);
                  return;
                }
                setDisplaySrc(null);
              }}
            />
          </>
        ) : (
          <span className="px-4 text-center text-sm font-semibold text-slate-500">{name}</span>
        )}
        {isApp && categoryLabel ? (
          <span className="app-template-card-pill">{categoryLabel}</span>
        ) : null}
      </div>
      <div
        className={
          isApp
            ? "app-template-card-body flex min-h-0 flex-1 flex-col"
            : "flex min-h-0 flex-1 flex-col bg-white p-3"
        }
      >
        <h3
          className={
            isApp
              ? "app-template-card-title shrink-0 line-clamp-2"
              : "h-[3rem] shrink-0 line-clamp-2 text-[0.95rem] font-semibold leading-6 text-slate-900"
          }
        >
          {name}
        </h3>
        <p
          className={
            isApp
              ? "app-template-card-description shrink-0 line-clamp-2"
              : "mt-1.5 h-[2.75rem] shrink-0 line-clamp-2 text-sm leading-[1.375rem] text-slate-600"
          }
        >
          {description || "説明なし"}
        </p>
        <div className={isApp ? "app-template-card-actions" : "mt-auto flex shrink-0 flex-col gap-2 pt-3"}>
          <button
            type="button"
            disabled={!!using}
            onClick={onUse}
            className={
              isApp
                ? "app-template-card-use app-pressable disabled:opacity-50"
                : "app-button-native w-full min-h-[42px] rounded-md bg-slate-900 px-3 py-2 text-sm font-medium !text-white transition hover:bg-slate-800 disabled:opacity-60 sm:min-h-0 sm:w-auto sm:py-2"
            }
          >
            {using ? "作成中…" : isApp ? "使う" : "このテンプレートを使う"}
          </button>
          <button
            type="button"
            onClick={onPreview}
            disabled={!onPreview}
            className={
              isApp
                ? "app-template-card-preview app-pressable disabled:opacity-40"
                : "app-button-native w-full min-h-[42px] rounded-lg border border-slate-200 bg-white px-2.5 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0 sm:w-auto sm:py-1.5 sm:text-xs"
            }
          >
            プレビュー
          </button>
        </div>
      </div>
    </article>
  );
}
