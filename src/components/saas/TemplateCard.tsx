"use client";

import Image from "next/image";
import { useState } from "react";
import {
  resolveTemplateCardImageSrc,
  TEMPLATE_MARKETPLACE_CATEGORY_FALLBACKS,
} from "@/lib/template-preview";
import { shouldUseUnoptimizedImage } from "@/lib/static-image";

const DEFAULT_FALLBACK = "/preset-hero-sample.png";

export type TemplateCardProps = {
  id: string;
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
  const imageSrc = resolveTemplateCardImageSrc(preview_image, category ?? null, name, categoryFallback);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const displaySrc =
    imageSrc && failedSrc === imageSrc ? categoryFallback : imageSrc;
  const imageReady = displaySrc != null && loadedSrc === displaySrc;
  const placeholderGradient =
    category === "travel"
      ? "from-emerald-100 via-teal-50 to-white"
      : category === "oshi"
        ? "from-violet-100 via-fuchsia-50 to-white"
        : category === "personal"
          ? "from-sky-100 via-slate-50 to-white"
          : category === "food"
            ? "from-orange-100 via-amber-50 to-white"
            : category === "lightbiz"
              ? "from-indigo-100 via-slate-50 to-white"
              : "from-slate-200 via-slate-100 to-white";

  return (
    <article
      className={
        isApp
          ? "app-template-card ui-pop-card flex h-full flex-col overflow-hidden rounded-xl border transition"
          : "flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
      }
    >
      <div
        className={`relative flex aspect-[5/3] items-center justify-center overflow-hidden bg-gradient-to-br ${placeholderGradient}`}
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
            <Image
              src={displaySrc}
              alt=""
              fill
              className={"object-cover transition-opacity duration-200 " + (imageReady ? "opacity-100" : "opacity-0")}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized={shouldUseUnoptimizedImage(displaySrc)}
              onLoad={() => setLoadedSrc(displaySrc)}
              onError={() => {
                if (displaySrc === imageSrc) setFailedSrc(imageSrc);
                else setFailedSrc(displaySrc);
              }}
            />
          </>
        ) : (
          <span className="px-4 text-center text-sm font-semibold text-slate-500">{name}</span>
        )}
      </div>
      <div
        className={
          isApp
            ? "flex min-h-0 flex-1 flex-col bg-[var(--app-surface)] p-3"
            : "flex min-h-0 flex-1 flex-col bg-white p-3"
        }
      >
        <h3
          className={
            isApp
              ? "h-[3rem] shrink-0 line-clamp-2 text-[0.95rem] font-semibold leading-6 text-[var(--app-text)]"
              : "h-[3rem] shrink-0 line-clamp-2 text-[0.95rem] font-semibold leading-6 text-slate-900"
          }
        >
          {name}
        </h3>
        <p
          className={
            isApp
              ? "mt-1.5 h-[2.75rem] shrink-0 line-clamp-2 text-sm leading-[1.375rem] text-[var(--app-text-muted)]"
              : "mt-1.5 h-[2.75rem] shrink-0 line-clamp-2 text-sm leading-[1.375rem] text-slate-600"
          }
        >
          {description || "説明なし"}
        </p>
        <div className="mt-auto flex shrink-0 flex-col gap-2 pt-3">
          <button
            type="button"
            disabled={!!using}
            onClick={onUse}
            className={
              isApp
                ? "app-touch-btn app-touch-btn-primary app-pressable w-full bg-[var(--app-accent)] font-semibold !text-white disabled:opacity-50"
                : "app-button-native w-full min-h-[42px] rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold !text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60 sm:min-h-0 sm:w-auto sm:py-2"
            }
          >
            {using ? "作成中…" : "このテンプレートを使う"}
          </button>
          <button
            type="button"
            onClick={onPreview}
            disabled={!onPreview}
            className={
              isApp
                ? "app-pressable w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] py-2.5 text-sm font-medium text-[var(--app-text)] disabled:opacity-40"
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
