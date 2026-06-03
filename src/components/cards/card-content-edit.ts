"use client";

import { useCallback } from "react";
import type { EditorCard } from "@/components/editor/types";
import { useEditor2Store } from "@/components/editor/store";
import { useCardInlineEdit } from "./card-inline-edit";

export function isLocalizedField(v: unknown): v is Record<string, string> {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    ("ja" in v || "en" in v || "zh" in v || "ko" in v)
  );
}

export function writeLocalizedField(current: unknown, value: string): unknown {
  if (isLocalizedField(current)) return { ...current, ja: value };
  return value;
}

/** Canvas インライン編集 + content 更新ヘルパー */
export function useCardContentEditor(card: EditorCard) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const content = (card.content ?? {}) as Record<string, unknown>;

  const patchContent = useCallback(
    (patch: Record<string, unknown>) => {
      updateCard(card.id, { content: { ...content, ...patch } });
    },
    [card.id, content, updateCard],
  );

  const setField = useCallback(
    (key: string, value: string, localized = true) => {
      patchContent({ [key]: localized ? writeLocalizedField(content[key], value) : value });
    },
    [content, patchContent],
  );

  const setPlainField = useCallback(
    (key: string, value: string) => setField(key, value, false),
    [setField],
  );

  const setArrayItemField = useCallback(
    (arrayKey: string, index: number, field: string, value: string, localized = true) => {
      const items = Array.isArray(content[arrayKey]) ? [...(content[arrayKey] as unknown[])] : [];
      const row = { ...((items[index] as Record<string, unknown>) ?? {}) };
      row[field] = localized ? writeLocalizedField(row[field], value) : value;
      items[index] = row;
      patchContent({ [arrayKey]: items });
    },
    [content, patchContent],
  );

  const setCategoryField = useCallback(
    (catIndex: number, field: string, value: string) => {
      const categories = Array.isArray(content.categories) ? [...(content.categories as unknown[])] : [];
      const cat = { ...((categories[catIndex] as Record<string, unknown>) ?? {}) };
      cat[field] = writeLocalizedField(cat[field], value);
      categories[catIndex] = cat;
      patchContent({ categories });
    },
    [content, patchContent],
  );

  const setCategoryItemField = useCallback(
    (catIndex: number, itemIndex: number, field: string, value: string) => {
      const categories = Array.isArray(content.categories) ? [...(content.categories as unknown[])] : [];
      const cat = { ...((categories[catIndex] as Record<string, unknown>) ?? {}) };
      const items = Array.isArray(cat.items) ? [...(cat.items as unknown[])] : [];
      const row = { ...((items[itemIndex] as Record<string, unknown>) ?? {}) };
      row[field] = writeLocalizedField(row[field], value);
      items[itemIndex] = row;
      cat.items = items;
      categories[catIndex] = cat;
      patchContent({ categories });
    },
    [content, patchContent],
  );

  const setGridCell = useCallback(
    (bodyRowIndex: number, colIndex: number, value: string) => {
      const hasHeader = content.hasHeader !== false;
      const rows = Array.isArray(content.rows)
        ? (content.rows as unknown[]).map((r) =>
            Array.isArray(r) ? (r as unknown[]).map((c) => String(c ?? "")) : [],
          )
        : [];
      const absoluteRow = hasHeader ? bodyRowIndex + 1 : bodyRowIndex;
      if (!rows[absoluteRow]) return;
      const row = [...rows[absoluteRow]];
      row[colIndex] = value;
      rows[absoluteRow] = row;
      patchContent({ rows });
    },
    [content, patchContent],
  );

  const setGridHeaderCell = useCallback(
    (colIndex: number, value: string) => {
      if (content.hasHeader === false) return;
      const rows = Array.isArray(content.rows)
        ? (content.rows as unknown[]).map((r) =>
            Array.isArray(r) ? (r as unknown[]).map((c) => String(c ?? "")) : [],
          )
        : [];
      if (!rows[0]) return;
      const row = [...rows[0]];
      row[colIndex] = value;
      rows[0] = row;
      patchContent({ rows });
    },
    [content, patchContent],
  );

  const setPricingHeader = useCallback(
    (colIndex: number, value: string) => {
      const headers = Array.isArray(content.pricingColumnHeaders)
        ? [...(content.pricingColumnHeaders as unknown[])]
        : [];
      headers[colIndex] = writeLocalizedField(headers[colIndex], value);
      patchContent({ pricingColumnHeaders: headers });
    },
    [content, patchContent],
  );

  const setPricingRowLabel = useCallback(
    (rowIndex: number, value: string) => {
      const rows = Array.isArray(content.pricingRows) ? [...(content.pricingRows as unknown[])] : [];
      const row = { ...((rows[rowIndex] as Record<string, unknown>) ?? {}) };
      row.label = writeLocalizedField(row.label, value);
      rows[rowIndex] = row;
      patchContent({ pricingRows: rows });
    },
    [content, patchContent],
  );

  const setPricingCell = useCallback(
    (rowIndex: number, colIndex: number, value: string) => {
      const rows = Array.isArray(content.pricingRows) ? [...(content.pricingRows as unknown[])] : [];
      const row = { ...((rows[rowIndex] as Record<string, unknown>) ?? {}) };
      const values = Array.isArray(row.values) ? [...(row.values as unknown[])] : [];
      values[colIndex] = value;
      row.values = values;
      rows[rowIndex] = row;
      patchContent({ pricingRows: rows });
    },
    [content, patchContent],
  );

  const setTimeBandSlotField = useCallback(
    (slotIndex: number, field: string, value: string) => {
      const slots = Array.isArray(content.slots) ? [...(content.slots as unknown[])] : [];
      const slot = { ...((slots[slotIndex] as Record<string, unknown>) ?? {}) };
      slot[field] = writeLocalizedField(slot[field], value);
      slots[slotIndex] = slot;
      patchContent({ slots });
    },
    [content, patchContent],
  );

  const setRowOverrideField = useCallback(
    (rowIndex: number, field: string, value: string) => {
      const overrides = Array.isArray(content.rowOverrides) ? [...(content.rowOverrides as unknown[])] : [];
      const row = { ...((overrides[rowIndex] as Record<string, string>) ?? {}) };
      row[field] = value;
      overrides[rowIndex] = row;
      patchContent({ rowOverrides: overrides });
    },
    [content, patchContent],
  );

  const setStringArrayItem = useCallback(
    (arrayKey: string, index: number, value: string) => {
      const items = Array.isArray(content[arrayKey]) ? [...(content[arrayKey] as unknown[])] : [];
      items[index] = value;
      patchContent({ [arrayKey]: items });
    },
    [content, patchContent],
  );

  const setTimeBandSlotItemField = useCallback(
    (slotIndex: number, itemIndex: number, field: string, value: string) => {
      const slots = Array.isArray(content.slots) ? [...(content.slots as unknown[])] : [];
      const slot = { ...((slots[slotIndex] as Record<string, unknown>) ?? {}) };
      const items = Array.isArray(slot.items) ? [...(slot.items as unknown[])] : [];
      const row = { ...((items[itemIndex] as Record<string, unknown>) ?? {}) };
      row[field] = writeLocalizedField(row[field], value);
      items[itemIndex] = row;
      slot.items = items;
      slots[slotIndex] = slot;
      patchContent({ slots });
    },
    [content, patchContent],
  );

  return {
    editable,
    onActivate,
    content,
    patchContent,
    setField,
    setPlainField,
    setArrayItemField,
    setCategoryField,
    setCategoryItemField,
    setGridCell,
    setGridHeaderCell,
    setPricingHeader,
    setPricingRowLabel,
    setPricingCell,
    setTimeBandSlotField,
    setTimeBandSlotItemField,
    setRowOverrideField,
    setStringArrayItem,
  };
}
