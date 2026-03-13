"use client";

import { useState } from "react";
import { MULTI_PAGE_TEMPLATES } from "@/lib/multi-page-templates";
import { createPagesFromMultiPageTemplate } from "@/lib/storage";
import type { MultiPageTemplateId } from "@/lib/multi-page-templates/types";

export type MultiPageTemplateSelectorProps = {
  /** Called after pages are created with the new page ids */
  onCreated?: (ids: string[]) => void;
  className?: string;
};

/**
 * Renders multi-page templates. When user selects one, creates multiple
 * Information pages with predefined blocks (Title, Text, Image, Button, Icon).
 */
export function MultiPageTemplateSelector({
  onCreated,
  className = "",
}: MultiPageTemplateSelectorProps) {
  const [loadingId, setLoadingId] = useState<MultiPageTemplateId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(templateId: MultiPageTemplateId) {
    setLoadingId(templateId);
    setError(null);
    try {
      const ids = await createPagesFromMultiPageTemplate(templateId);
      onCreated?.(ids);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ページの作成に失敗しました");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className={className}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          テンプレートから複数ページを作成
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          テンプレートを選ぶと、複数の案内ページが自動作成されます。各ページには初期ブロックが入っています。
        </p>
      </div>
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {MULTI_PAGE_TEMPLATES.map((template) => {
          const isLoading = loadingId === template.id;
          return (
            <div
              key={template.id}
              className="rounded-xl border border-ds-border bg-ds-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <h3 className="font-semibold text-slate-800">{template.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{template.description}</p>
              <p className="mt-2 text-xs text-slate-400">
                作成されるページ: {template.pages.map((p) => p.title).join("、")}
              </p>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => void handleSelect(template.id as MultiPageTemplateId)}
                className="mt-4 w-full rounded-xl bg-ds-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-600 disabled:opacity-60"
              >
                {isLoading ? "作成中…" : "このテンプレートでページを作成"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
