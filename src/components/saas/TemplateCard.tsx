"use client";

import Image from "next/image";
import { useState } from "react";
import {
  resolveTemplateCardImageSrc,
  TEMPLATE_MARKETPLACE_CATEGORY_FALLBACKS,
} from "@/lib/template-preview";

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
};

export function TemplateCard({
  name,
  description,
  preview_image,
  category,
  onUse,
  onPreview,
  using,
}: TemplateCardProps) {
  const categoryFallback =
    (category ? TEMPLATE_MARKETPLACE_CATEGORY_FALLBACKS[category] : "") || DEFAULT_FALLBACK;
  const imageSrc = resolveTemplateCardImageSrc(preview_image, category ?? null, name, categoryFallback);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const imageReady = loadedSrc === imageSrc;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <div className="relative aspect-[5/3] overflow-hidden bg-slate-200">
        <div
          aria-hidden
          className={
            "absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-300/70 to-slate-200 transition-opacity duration-200 " +
            (imageReady ? "opacity-0" : "opacity-100")
          }
        />
        <Image
          src={imageSrc}
          alt=""
          fill
          className={"object-cover transition-opacity duration-200 " + (imageReady ? "opacity-100" : "opacity-0")}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized={false}
          onLoad={() => setLoadedSrc(imageSrc)}
          onError={() => setLoadedSrc(imageSrc)}
        />
      </div>
      <div className="flex flex-1 flex-col bg-white p-3">
        <h3 className="min-h-[2.8rem] line-clamp-2 text-[0.95rem] font-semibold leading-6 text-slate-900">{name}</h3>
        <p className="mt-1.5 min-h-[2.7rem] line-clamp-2 text-sm leading-[1.35rem] text-slate-600">{description || "説明なし"}</p>
        <div className="mt-auto pt-3">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-end sm:gap-1.5">
          <button
            type="button"
            disabled={!!using}
            onClick={onUse}
            className="app-button-native w-full min-h-[42px] rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold !text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60 sm:min-h-0 sm:w-auto sm:py-2"
          >
            {using ? "作成中…" : "テンプレートを使う"}
          </button>
          <button
            type="button"
            onClick={onPreview}
            disabled={!onPreview}
            className="app-button-native w-full min-h-[42px] rounded-lg border border-slate-200 bg-white px-2.5 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0 sm:w-auto sm:py-1.5 sm:text-xs"
          >
            プレビュー
          </button>
          </div>
        </div>
      </div>
    </article>
  );
}
