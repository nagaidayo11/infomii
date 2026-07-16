"use client";

import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { useEditor2Store } from "@/components/editor/store";
import {
  BREAKFAST_CROWD_LEVEL_TONES,
  breakfastCrowdStatusLabel,
  coerceBreakfastCrowdLevel,
  formatBreakfastCrowdUpdatedAt,
  writeBreakfastCrowdNoteJa,
} from "@/lib/editor/breakfast-crowd";
import { saveBreakfastCrowdOpsStatus } from "@/lib/editor/breakfast-crowd-ops";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";
import { useCardContentEditor } from "./card-content-edit";
import { PlainInline } from "./card-inline-fields";

export function BreakfastCrowdCard({
  card,
  locale = "ja",
}: {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
}) {
  const editor = useCardContentEditor(card);
  const pageId = useEditor2Store((s) => s.pageMeta.pageId);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = editor.content;
  const bind = { editable: editor.editable, onActivate: editor.onActivate };
  const title =
    getLocalizedContent(c.title as LocalizedString | undefined, locale).trim() || "朝食混雑";
  const note = getLocalizedContent(c.note as LocalizedString | undefined, locale);
  const level = coerceBreakfastCrowdLevel(c.level);
  const tone = BREAKFAST_CROWD_LEVEL_TONES[level];
  const statusText = breakfastCrowdStatusLabel(level, locale);
  const updatedLabel = formatBreakfastCrowdUpdatedAt(c.updatedAt, locale);

  async function saveNote(nextNote: string) {
    const nextContent = {
      ...c,
      note: writeBreakfastCrowdNoteJa(c.note, nextNote),
    };
    updateCard(card.id, { content: nextContent });
    if (!editor.editable || !pageId) return;
    try {
      const status = await saveBreakfastCrowdOpsStatus(
        pageId,
        { level, note: nextNote },
        { mirrorToCards: false },
      );
      updateCard(card.id, {
        content: {
          ...nextContent,
          level: status.level,
          note: writeBreakfastCrowdNoteJa(nextContent.note, status.note),
          updatedAt: status.updatedAt,
        },
      });
    } catch {
      /* local note already set; ops may be unavailable until migration */
    }
  }

  return (
    <Card padding="none">
      <section
        data-inner-surface
        className={`relative overflow-hidden ${editorInnerRadiusClassName} border ${tone.surface}`}
      >
        <span className={`absolute inset-y-0 left-0 w-1 ${tone.band}`} aria-hidden />
        <div className="px-3 py-3 pl-4">
          <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
            <PlainInline
              value={title}
              onSave={(v) => editor.setPlainField("title", v)}
              bind={bind}
              className={CARD_BLOCK_TITLE_CLASS}
              placeholder="朝食混雑"
            />
          </p>
          <div className="mt-2.5 flex items-center gap-2.5">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}`} aria-hidden />
            <p className={`text-lg font-semibold leading-snug ${tone.text}`} style={getTitleFontSizeStyle()}>
              {statusText}
            </p>
          </div>
          {(editor.editable || note) && (
            <p className="mt-2 text-sm leading-snug text-slate-600" style={getBodyFontSizeStyle()}>
              <PlainInline
                value={note}
                onSave={(v) => void saveNote(v)}
                bind={bind}
                multiline
                className="block w-full min-h-[1lh] text-sm leading-snug text-slate-600"
                placeholder="短いメモ（任意）"
              />
            </p>
          )}
          {updatedLabel ? (
            <p className="mt-2 text-xs text-slate-500" style={getBodyFontSizeStyle()}>
              {updatedLabel}
            </p>
          ) : null}
        </div>
      </section>
    </Card>
  );
}
