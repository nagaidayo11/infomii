"use client";

import { useState } from "react";
import { MULTI_PAGE_TEMPLATES } from "@/lib/multi-page-templates";
import { createPagesFromMultiPageTemplate } from "@/lib/storage";
import type { MultiPageTemplateId } from "@/lib/multi-page-templates/types";
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
            isLoading={loadingId === template.id}
          />
        ))}
      </div>
    </section>
  );
}
