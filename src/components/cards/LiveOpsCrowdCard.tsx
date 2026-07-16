"use client";

import type { EditorCard } from "@/components/editor/types";
import {
  CARD_BLOCK_BODY_CLASS,
  CARD_BLOCK_CAPTION_CLASS,
  CARD_BLOCK_TITLE_CLASS,
  getTitleFontSizeStyle,
  getBodyFontSizeStyle,
} from "@/components/editor/types";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import {
  LIVE_OPS_DEFINITIONS,
  coerceLiveOpsLevel,
  formatLiveOpsUpdatedAt,
  saveLiveOpsStatus,
  writeLiveOpsNoteJa,
  type LiveOpsKey,
} from "@/lib/editor/live-ops";
import { GUEST_CARD_PAD_CLASS } from "@/lib/editor/card-width-mode";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";
import { useCardContentEditor } from "./card-content-edit";
import { PlainInline } from "./card-inline-fields";

function statusLabelForLocale(
  opsKey: LiveOpsKey,
  level: ReturnType<typeof coerceLiveOpsLevel>,
  locale: string,
): string {
  const labels = LIVE_OPS_DEFINITIONS[opsKey].statusLabels[level];
  if (locale === "en") return labels.en;
  if (locale === "zh") return labels.zh;
  if (locale === "ko") return labels.ko;
  return labels.ja;
}

/** Shared guest/editor card for registered live-ops crowd blocks. */
export function LiveOpsCrowdCard({
  card,
  opsKey,
  locale = "ja",
}: {
  card: EditorCard;
  opsKey: LiveOpsKey;
  isSelected?: boolean;
  locale?: string;
}) {
  const def = LIVE_OPS_DEFINITIONS[opsKey];
  const editor = useCardContentEditor(card);
  const pageId = useEditor2Store((s) => s.pageMeta.pageId);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = editor.content;
  const bind = { editable: editor.editable, onActivate: editor.onActivate };
  const title =
    getLocalizedContent(c.title as LocalizedString | undefined, locale).trim() || def.defaultTitle;
  const note = getLocalizedContent(c.note as LocalizedString | undefined, locale);
  const level = coerceLiveOpsLevel(c.level);
  const tone = def.levelTones[level];
  const statusText = statusLabelForLocale(opsKey, level, locale);
  const updatedLabel = formatLiveOpsUpdatedAt(c.updatedAt, locale);

  async function saveNote(nextNote: string) {
    const nextContent = {
      ...c,
      note: writeLiveOpsNoteJa(c.note, nextNote),
    };
    updateCard(card.id, { content: nextContent });
    if (!editor.editable || !pageId) return;
    try {
      const status = await saveLiveOpsStatus(
        pageId,
        opsKey,
        { level, note: nextNote },
        { mirrorToCards: false },
      );
      updateCard(card.id, {
        content: {
          ...nextContent,
          level: status.level,
          note: writeLiveOpsNoteJa(nextContent.note, status.note),
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
        className={`relative overflow-hidden rounded-[inherit] border ${tone.surface}`}
      >
        <span className={`absolute inset-y-0 left-0 w-1 ${tone.band}`} aria-hidden />
        <div className={`${GUEST_CARD_PAD_CLASS} pl-4`}>
          <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
            <PlainInline
              value={title}
              onSave={(v) => editor.setPlainField("title", v)}
              bind={bind}
              className={CARD_BLOCK_TITLE_CLASS}
              placeholder={def.defaultTitle}
            />
          </p>
          <div className="mt-2.5 flex items-center gap-2.5">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}`} aria-hidden />
            <p className={`text-lg font-semibold leading-snug ${tone.text}`} style={getTitleFontSizeStyle()}>
              {statusText}
            </p>
          </div>
          {(editor.editable || note) && (
            <p className={`mt-2 ${CARD_BLOCK_BODY_CLASS}`} style={getBodyFontSizeStyle()}>
              <PlainInline
                value={note}
                onSave={(v) => void saveNote(v)}
                bind={bind}
                multiline
                className={`block w-full min-h-[1lh] ${CARD_BLOCK_BODY_CLASS}`}
                placeholder="短いメモ（任意）"
              />
            </p>
          )}
          {updatedLabel ? (
            <p className={`mt-2 ${CARD_BLOCK_CAPTION_CLASS}`}>{updatedLabel}</p>
          ) : null}
        </div>
      </section>
    </Card>
  );
}
