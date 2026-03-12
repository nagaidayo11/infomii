"use client";

import {
  GALLERY_TEMPLATES,
  buildBlocksForTemplate,
  type GalleryTemplate,
} from "@/lib/template-gallery-data";
import { usePageEditorStore } from "@/components/page-editor/store";
import { TemplateCard } from "./TemplateCard";

type TemplateGalleryProps = {
  /** If true, applies template to page editor store */
  applyToEditor?: boolean;
  /** Callback when a template is selected (blocks available for custom persist) */
  onApply?: (blocks: ReturnType<typeof buildBlocksForTemplate>) => void;
  className?: string;
};

/**
 * Template gallery: cards with preview + Use Template.
 * Generates page structure (WiFi, breakfast, check-in/out, nearby) as one scrollable layout.
 */
export function TemplateGallery({
  applyToEditor = true,
  onApply,
  className = "",
}: TemplateGalleryProps) {
  const setBlocks = usePageEditorStore((s) => s.setBlocks);

  const handleUse = (template: GalleryTemplate) => {
    const blocks = buildBlocksForTemplate(template.id);
    if (applyToEditor) {
      setBlocks(blocks);
    }
    onApply?.(blocks);
  };

  return (
    <section className={className}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          テンプレートギャラリー
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          テンプレートを使うと、館内案内・WiFi・朝食・チェックアウト・周辺観光のブロックが自動で入ります。文言と画像はあとから編集できます。
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {GALLERY_TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onUse={handleUse}
          />
        ))}
      </div>
    </section>
  );
}
