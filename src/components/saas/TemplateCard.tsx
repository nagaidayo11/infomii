"use client";

import Image from "next/image";

export type TemplateCardProps = {
  id: string;
  name: string;
  description: string;
  preview_image: string;
  onUse: () => void;
  using?: boolean;
};

export function TemplateCard({ name, description, preview_image, onUse, using }: TemplateCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <div className="relative aspect-[5/3] overflow-hidden bg-slate-100">
        {preview_image ? (
          <Image
            src={preview_image}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={preview_image.startsWith("http")}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-slate-300">📄</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-slate-900">{name}</h3>
        <p className="mt-1 line-clamp-3 text-sm text-slate-600">{description || "説明なし"}</p>
        <div className="mt-4 flex flex-1 flex-wrap items-end gap-2">
          <button
            type="button"
            disabled={!!using}
            onClick={onUse}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
          >
            {using ? "作成中…" : "テンプレートを使う"}
          </button>
          {preview_image ? (
            <a
              href={preview_image}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              プレビュー
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
