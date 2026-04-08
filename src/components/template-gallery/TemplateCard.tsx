"use client";

import Image from "next/image";
import type { GalleryTemplate } from "@/lib/template-gallery-data";
import { evaluateTemplateImageConsistency, evaluateTemplateMismatchReason } from "@/lib/template-gallery-data";

type TemplateCardProps = {
  template: GalleryTemplate;
  onUse: (template: GalleryTemplate) => void;
};

export function TemplateCard({ template, onUse }: TemplateCardProps) {
  const score = evaluateTemplateImageConsistency(template);
  const reason = evaluateTemplateMismatchReason(template);
  const needsReview = score < 60;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={template.previewImage}
          alt=""
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
          unoptimized
        />
        <div
          className={
            "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-80"
          }
        />
        <div className="absolute bottom-3 left-3 right-3">
          <span
            className={
              "inline-block rounded-lg bg-gradient-to-r px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white " +
              template.accent
            }
          >
            テンプレート
          </span>
          <h3 className="mt-1 text-lg font-bold text-white drop-shadow-sm">
            {template.name}
          </h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-sm leading-relaxed text-slate-600">
          {template.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{template.industry}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{template.useCase}</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-700">推奨: {template.recommendedPlan}</span>
        </div>
        <p className={`mt-1 text-[11px] ${score >= 60 ? "text-slate-500" : "text-amber-700"}`}>
          タイトル/画像一致スコア: {score}{score < 60 ? "（要見直し）" : ""}
        </p>
        {needsReview ? <p className="mt-1 rounded-md bg-amber-50 px-2 py-1 text-[11px] text-amber-800">要見直し: {reason}</p> : null}
        <ul className="mt-3 space-y-1">
          {template.pages.map((page) => (
            <li
              key={page}
              className="flex items-center gap-2 text-xs text-slate-500"
            >
              <span className="h-1 w-1 rounded-full bg-emerald-500" />
              {page}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex-1" />
        <button
          type="button"
          onClick={() => onUse(template)}
          className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99]"
        >
          テンプレートを使う
        </button>
      </div>
    </article>
  );
}
