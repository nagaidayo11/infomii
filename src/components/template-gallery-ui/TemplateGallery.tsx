"use client";

import { useState } from "react";
import { MULTI_PAGE_TEMPLATES } from "@/lib/multi-page-templates";
import { templatePageToInformationBlocks } from "@/lib/multi-page-templates/convert";
import { createPagesFromMultiPageTemplate } from "@/lib/storage";
import type { MultiPageTemplateId } from "@/lib/multi-page-templates/types";
import MobileTemplatePreview from "@/components/mobile-template-preview";
import { TemplateGalleryCard } from "./TemplateGalleryCard";

export type TemplateGalleryProps = {
  /** Called after pages are created (e.g. refresh list, redirect) */
  onCreated?: (pageIds: string[]) => void;
  className?: string;
  /** Optional section title */
  title?: string;
  /** Optional section description */
  description?: string;
};

/**
 * Template gallery UI: card layout with template name, preview image,
 * and "Use template" button. Clicking creates multiple pages automatically.
 * Modern SaaS design, React + TailwindCSS.
 */
export function TemplateGallery({
  onCreated,
  className = "",
  title = "テンプレートギャラリー",
  description = "テンプレートを選ぶと、複数の案内ページが自動作成されます。",
}: TemplateGalleryProps) {
  const [loadingId, setLoadingId] = useState<MultiPageTemplateId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewTemplateId, setPreviewTemplateId] = useState<MultiPageTemplateId | null>(null);
  const [previewPageIndex, setPreviewPageIndex] = useState(0);

  async function handleUse(templateId: string) {
    setLoadingId(templateId as MultiPageTemplateId);
    setError(null);
    try {
      const ids = await createPagesFromMultiPageTemplate(
        templateId as MultiPageTemplateId
      );
      onCreated?.(ids);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "ページの作成に失敗しました"
      );
    } finally {
      setLoadingId(null);
    }
  }

  function handlePreview(templateId: string) {
    setPreviewTemplateId(templateId as MultiPageTemplateId);
    setPreviewPageIndex(0);
  }

  function closePreview() {
    setPreviewTemplateId(null);
    setPreviewPageIndex(0);
  }

  const previewTemplate =
    previewTemplateId != null
      ? MULTI_PAGE_TEMPLATES.find((t) => t.id === previewTemplateId) ?? null
      : null;
  const previewPage = previewTemplate?.pages[previewPageIndex] ?? null;

  return (
    <section className={className}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {MULTI_PAGE_TEMPLATES.map((template) => (
          <TemplateGalleryCard
            key={template.id}
            template={template}
            onUse={handleUse}
            onPreview={handlePreview}
            isLoading={loadingId === template.id}
          />
        ))}
      </div>

      {previewTemplate && previewPage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${previewTemplate.name} テンプレートの実プレビュー`}
          onClick={closePreview}
        >
          <div
            className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {previewTemplate.name} 実プレビュー
                </h3>
                <p className="text-xs text-slate-500">
                  テンプレ適用後の表示を確認できます
                </p>
              </div>
              <button
                type="button"
                onClick={closePreview}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                閉じる
              </button>
            </div>
            <div className="grid gap-0 md:grid-cols-[220px_1fr]">
              <aside className="border-r border-slate-200 bg-slate-50/60 p-3">
                <p className="mb-2 text-xs font-semibold tracking-wide text-slate-600">
                  ページ一覧
                </p>
                <div className="space-y-1.5">
                  {previewTemplate.pages.map((page, index) => (
                    <button
                      key={`${previewTemplate.id}-${page.title}-${index}`}
                      type="button"
                      onClick={() => setPreviewPageIndex(index)}
                      className={
                        "w-full rounded-lg border px-2.5 py-2 text-left text-xs transition " +
                        (previewPageIndex === index
                          ? "border-ds-primary bg-blue-50 text-blue-900"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50")
                      }
                    >
                      {page.title}
                    </button>
                  ))}
                </div>
              </aside>
              <div className="max-h-[72vh] overflow-y-auto bg-slate-100 p-4">
                <div className="mx-auto w-full max-w-[390px] rounded-[2rem] border border-slate-200 bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
                  <MobileTemplatePreview
                    blocks={templatePageToInformationBlocks(previewPage)}
                    className="min-h-[640px] border-none shadow-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
