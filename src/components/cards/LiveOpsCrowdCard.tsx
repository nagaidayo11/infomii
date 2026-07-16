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
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";
import { useCardContentEditor } from "./card-content-edit";
import { PlainInline } from "./card-inline-fields";
import { DESK_TONE, type DeskTone } from "./desk-tone";

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

const LEVEL_TONE: Record<string, DeskTone> = {
  open: "emerald",
  moderate: "amber",
  busy: "rose",
  closed: "slate",
};

const STATUS_PILL: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/80",
  moderate: "bg-amber-100 text-amber-950 ring-1 ring-amber-200/80",
  busy: "bg-red-100 text-red-900 ring-1 ring-red-200/80",
  closed: "bg-slate-100 text-slate-700 ring-1 ring-slate-200/80",
};

/** Desk status board — surface tint follows live level. */
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
  const statusText = statusLabelForLocale(opsKey, level, locale);
  const updatedLabel = formatLiveOpsUpdatedAt(c.updatedAt, locale);
  const pillClass = STATUS_PILL[level] ?? STATUS_PILL.open;
  const tone = DESK_TONE[LEVEL_TONE[level] ?? "emerald"];
  const nowLabel =
    locale === "en" ? "Now" : locale === "zh" ? "现在" : locale === "ko" ? "지금" : "いま";

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
      /* local note already set */
    }
  }

  const statusTone =
    level === "busy"
      ? "text-red-700"
      : level === "moderate"
        ? "text-amber-800"
        : level === "closed"
          ? "text-slate-600"
          : "text-emerald-800";

  return (
    <Card padding="md" className={tone.frame} style={{ backgroundColor: tone.surface }}>
      <div className="flex items-start justify-between gap-3">
        <p className={`min-w-0 flex-1 ${CARD_BLOCK_TITLE_CLASS} ${tone.title}`} style={getTitleFontSizeStyle()}>
          <PlainInline
            value={title}
            onSave={(v) => editor.setPlainField("title", v)}
            bind={bind}
            className={`${CARD_BLOCK_TITLE_CLASS} ${tone.title}`}
            placeholder={def.defaultTitle}
          />
        </p>
        <span
          className={
            "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide " + pillClass
          }
        >
          {nowLabel}
        </span>
      </div>

      <p
        className={`mt-3 text-[1.35rem] font-semibold leading-snug tracking-tight ${statusTone}`}
        style={getTitleFontSizeStyle()}
      >
        {statusText}
      </p>

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
        <p className={`mt-2.5 ${CARD_BLOCK_CAPTION_CLASS} ${tone.label}`}>{updatedLabel}</p>
      ) : null}
    </Card>
  );
}
