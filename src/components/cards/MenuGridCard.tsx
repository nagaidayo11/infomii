"use client";

import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getBodyFontSizeStyle, getTitleFontSizeStyle } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useCardContentEditor } from "./card-content-edit";
import { CardTitleInline, PlainInline } from "./card-inline-fields";

type MenuGridCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

const MIN_COLUMNS = 2;
const MAX_COLUMNS = 6;

function clampColumns(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 3;
  return Math.min(MAX_COLUMNS, Math.max(MIN_COLUMNS, Math.round(parsed)));
}

function normalizeRows(raw: unknown, columns: number): string[][] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((row) => Array.isArray(row))
    .map((row) => {
      const cells = (row as unknown[]).slice(0, columns).map((cell) => String(cell ?? "").trim());
      while (cells.length < columns) cells.push("");
      return cells;
    })
    .filter((row) => row.some((cell) => cell.length > 0));
}

function getCellPaddingClass(value: unknown): string {
  if (value === "sm") return "px-2 py-1.5";
  if (value === "lg") return "px-4 py-3";
  return "px-3 py-2";
}

export function MenuGridCard({ card, locale = "ja" }: MenuGridCardProps) {
  const editor = useCardContentEditor(card);
  const c = editor.content;
  const bind = { editable: editor.editable, onActivate: editor.onActivate };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const columns = clampColumns(c?.columns);
  const rows = normalizeRows(c?.rows, columns);
  const hasHeader = c?.hasHeader !== false;
  const showBorder = c?.showBorder !== false;
  const cellPaddingClass = getCellPaddingClass(c?.cellPadding);
  const borderClass = showBorder ? "border border-slate-200" : "";

  if (!rows.length) {
    return (
      <Card padding="md">
        <CardTitleInline title={title} onSave={(v) => editor.setField("title", v)} placeholder="メニュー表" bind={bind} />
        <p className="mt-3 text-sm text-slate-500" style={getBodyFontSizeStyle()}>
          メニュー表の行データがありません。
        </p>
      </Card>
    );
  }

  const headerRow = hasHeader ? rows[0] : null;
  const bodyRows = hasHeader ? rows.slice(1) : rows;

  return (
    <Card padding="md">
      <CardTitleInline title={title} onSave={(v) => editor.setField("title", v)} placeholder="メニュー表" bind={bind} />
      <div className="mt-3 overflow-x-auto">
        <table className={`min-w-full border-separate border-spacing-0 rounded-lg bg-white ${showBorder ? "overflow-hidden" : ""}`}>
          {headerRow ? (
            <thead>
              <tr>
                {headerRow.map((cell, idx) => (
                  <th
                    key={`head-${idx}`}
                    className={`${cellPaddingClass} ${borderClass} bg-slate-100 text-left text-xs font-semibold text-slate-700`}
                    style={getBodyFontSizeStyle()}
                  >
                    <PlainInline
                      value={cell}
                      onSave={(v) => editor.setGridHeaderCell(idx, v)}
                      bind={bind}
                      className="text-xs font-semibold text-slate-700"
                      placeholder="—"
                    />
                  </th>
                ))}
              </tr>
            </thead>
          ) : null}
          <tbody>
            {bodyRows.map((row, rowIdx) => (
              <tr key={`row-${rowIdx}`}>
                {row.map((cell, colIdx) => (
                  <td
                    key={`cell-${rowIdx}-${colIdx}`}
                    className={`${cellPaddingClass} ${borderClass} align-top text-slate-700 ${!hasHeader && rowIdx === 0 ? "font-medium" : ""}`}
                    style={getBodyFontSizeStyle()}
                  >
                    <PlainInline
                      value={cell}
                      onSave={(v) => editor.setGridCell(rowIdx, colIdx, v)}
                      bind={bind}
                      className="text-slate-700"
                      placeholder=" "
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
