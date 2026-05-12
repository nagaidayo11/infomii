"use client";

import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";

type CompareCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

type PricingRow = { label?: unknown; values?: unknown };

function normalizePricingRows(raw: unknown, colCount: number): { label: unknown; values: string[] }[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => {
    const r = row as PricingRow;
    const vals = Array.isArray(r.values) ? r.values.map((v) => (typeof v === "string" ? v : "")) : [];
    const padded = [...vals];
    while (padded.length < colCount) padded.push("");
    return { label: r.label, values: padded.slice(0, colCount) };
  });
}

export function CompareCard({ card, isSelected = false, locale = "ja" }: CompareCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const labels =
    locale === "ko"
      ? { title: "비교", left: "왼쪽", right: "오른쪽", placeholder: "비교", corner: "항목" }
      : locale === "zh"
        ? { title: "比较", left: "左侧", right: "右侧", placeholder: "比较", corner: "项目" }
        : locale === "en"
          ? { title: "Compare", left: "Left", right: "Right", placeholder: "Compare", corner: "Details" }
          : { title: "比較", left: "左", right: "右", placeholder: "比較", corner: "項目" };

  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const leftTitle = getLocalizedContent(c?.leftTitle as LocalizedString | undefined, locale) || labels.left;
  const leftBody = getLocalizedContent(c?.leftBody as LocalizedString | undefined, locale);
  const rightTitle = getLocalizedContent(c?.rightTitle as LocalizedString | undefined, locale) || labels.right;
  const rightBody = getLocalizedContent(c?.rightBody as LocalizedString | undefined, locale);

  const layout = c?.layout === "pricing" ? "pricing" : "twoColumn";
  const rawHeaders = Array.isArray(c?.pricingColumnHeaders) ? c.pricingColumnHeaders : [];
  const colCount = Math.min(4, Math.max(2, rawHeaders.length >= 2 ? rawHeaders.length : 2));
  const pricingHeaders = rawHeaders.map((h) => getLocalizedContent(h as LocalizedString, locale));
  const pricingRows = layout === "pricing" && rawHeaders.length >= 2 ? normalizePricingRows(c?.pricingRows, colCount) : [];
  const usePricingTable = layout === "pricing" && rawHeaders.length >= 2;

  const highlightIdxRaw = c?.highlightColumnIndex;
  const highlightColumnIndex =
    typeof highlightIdxRaw === "number" && Number.isFinite(highlightIdxRaw) && rawHeaders.length >= 2
      ? Math.max(0, Math.min(rawHeaders.length - 1, Math.floor(highlightIdxRaw)))
      : null;

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };

  const onActivate = () => selectCard(card.id);

  return (
    <Card padding="md">
      {title ? (
        <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
          <InlineEditable
            value={title}
            onSave={(v) => update({ title: v })}
            editable={isSelected}
            onActivate={onActivate}
            className={CARD_BLOCK_TITLE_CLASS}
            placeholder={labels.placeholder}
          />
        </p>
      ) : null}

      {usePricingTable ? (
        <div className="mt-3 overflow-x-auto" style={getBodyFontSizeStyle()}>
          <table
            className={`w-full min-w-[280px] border-collapse text-left ${editorInnerRadiusClassName} overflow-hidden border border-slate-200`}
          >
            <thead>
              <tr className="bg-slate-100 text-slate-800">
                <th
                  scope="col"
                  className="border-b border-slate-200 px-3 py-2.5 font-semibold text-slate-500"
                  style={getTitleFontSizeStyle()}
                >
                  {labels.corner}
                </th>
                {pricingHeaders.map((h, ci) => (
                  <th
                    key={ci}
                    scope="col"
                    className={
                      "border-b border-slate-200 px-3 py-2.5 font-semibold text-slate-800 " +
                      (highlightColumnIndex === ci ? "bg-emerald-50 ring-1 ring-emerald-200/80" : "")
                    }
                    style={getTitleFontSizeStyle()}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pricingRows.length === 0 ? (
                <tr>
                  <td colSpan={pricingHeaders.length + 1} className="px-3 py-6 text-center text-slate-500">
                    {locale === "en" ? "Add rows in block settings." : "設定パネルから行を追加してください。"}
                  </td>
                </tr>
              ) : (
                pricingRows.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-slate-50/80"}>
                    <th scope="row" className="border-t border-slate-200 px-3 py-2.5 font-medium text-slate-700">
                      {getLocalizedContent(row.label as LocalizedString, locale)}
                    </th>
                    {row.values.map((cell, ci) => (
                      <td
                        key={ci}
                        className={
                          "border-t border-slate-200 px-3 py-2.5 text-slate-600 whitespace-pre-wrap " +
                          (highlightColumnIndex === ci ? "bg-emerald-50/90 font-medium text-slate-800 ring-1 ring-emerald-200/60" : "")
                        }
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2" style={getBodyFontSizeStyle()}>
          <div data-inner-surface className={`${editorInnerRadiusClassName} border border-slate-200 bg-slate-50 p-3`}>
            <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
              {leftTitle}
            </p>
            <p className="mt-1 whitespace-pre-wrap font-normal text-slate-600">{leftBody}</p>
          </div>
          <div data-inner-surface className={`${editorInnerRadiusClassName} border border-slate-200 bg-slate-50 p-3`}>
            <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
              {rightTitle}
            </p>
            <p className="mt-1 whitespace-pre-wrap font-normal text-slate-600">{rightBody}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
