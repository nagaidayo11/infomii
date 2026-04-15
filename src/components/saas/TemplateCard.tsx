"use client";

import Image from "next/image";

const FALLBACK_IMAGES_BY_CATEGORY: Record<string, string> = {
  business: "/template-business-hero-01.jpg",
  resort: "/template-resort-hero-01.jpg",
  ryokan: "/template-ryokan-hero-01.jpg",
  airbnb: "/template-airbnb-hero-01.jpg",
  guide: "/template-guide-hero-01.jpg",
  inbound: "/template-inbound-hero-01.jpg",
};
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
  const rawPreview = preview_image?.trim() ?? "";
  const shouldUseFallback = !rawPreview || rawPreview.startsWith("http://") || rawPreview.startsWith("https://");
  const imageSrc = shouldUseFallback
    ? (category ? FALLBACK_IMAGES_BY_CATEGORY[category] : "") || DEFAULT_FALLBACK
    : rawPreview;
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <div className="relative aspect-[5/3] overflow-hidden bg-slate-100">
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized={false}
        />
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="font-semibold text-slate-900">{name}</h3>
        <p className="mt-1.5 line-clamp-3 text-sm text-slate-600">{description || "説明なし"}</p>
        <div className="mt-3 flex flex-1 flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-end sm:gap-1.5">
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
    </article>
  );
}
