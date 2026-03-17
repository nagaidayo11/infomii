"use client";

import Image from "next/image";

/** テンプレート名ごとのプレースホルダー画像（DBに画像がない場合に表示）。差し替えは templates の preview_image または /api/seed-templates?update_images=1 で可能。 */
const FALLBACK_IMAGES_BY_NAME: Record<string, string> = {
  "ビジネスホテル・館内案内": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80",
  "リゾートホテル・館内案内": "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80",
  "旅館・ご案内": "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&q=80",
  "Airbnb・ゲスト向け案内": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
  "観光ガイド・スポット案内": "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=600&q=80",
  "チェックイン・館内案内": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80",
};
const DEFAULT_FALLBACK = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80";

export type TemplateCardProps = {
  id: string;
  name: string;
  description: string;
  preview_image: string;
  onUse: () => void;
  onPreview?: () => void;
  using?: boolean;
};

export function TemplateCard({ name, description, preview_image, onUse, onPreview, using }: TemplateCardProps) {
  const imageSrc =
    preview_image?.trim() || FALLBACK_IMAGES_BY_NAME[name] || DEFAULT_FALLBACK;
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <div className="relative aspect-[5/3] overflow-hidden bg-slate-100">
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized={imageSrc.startsWith("http")}
        />
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
          <button
            type="button"
            onClick={onPreview}
            disabled={!onPreview}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            プレビュー
          </button>
        </div>
      </div>
    </article>
  );
}
