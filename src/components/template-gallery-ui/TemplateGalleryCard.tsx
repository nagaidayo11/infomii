"use client";

import Image from "next/image";
import type { MultiPageTemplate } from "@/lib/multi-page-templates/types";

type TemplateGalleryCardProps = {
  template: MultiPageTemplate;
  onUse: (templateId: string) => void;
  onPreview: (templateId: string) => void;
  isLoading?: boolean;
};

/**
 * Single template card: preview image, name, description, "Use template" button.
 */
export function TemplateGalleryCard({
  template,
  onUse,
  onPreview,
  isLoading = false,
}: TemplateGalleryCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-ds-border bg-ds-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <div className="relative aspect-[5/3] overflow-hidden bg-slate-100">
        <Image
          src={template.previewImage}
          alt={`${template.name}のプレビュー`}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized={template.previewImage.startsWith("http")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-semibold text-white drop-shadow-sm">
            {template.name}
          </h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-sm leading-relaxed text-slate-600">
          {template.description}
        </p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {template.pages.map((page) => (
            <li
              key={page.title}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
            >
              {page.title}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex-1" />
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onUse(template.id)}
            className="w-full rounded-xl bg-ds-primary py-3 text-sm font-medium text-white shadow-sm transition hover:bg-ds-primary-hover active:scale-[0.99] disabled:opacity-60"
          >
            {isLoading ? "作成中…" : "テンプレートを使う"}
          </button>
          <button
            type="button"
            onClick={() => onPreview(template.id)}
            className="w-full rounded-xl border border-slate-300 bg-white py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:scale-[0.99]"
          >
            プレビュー
          </button>
        </div>
      </div>
    </article>
  );
}
