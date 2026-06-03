"use client";

import { useEffect, useMemo, useState } from "react";
import type { EditorCard } from "@/components/editor/types";
import { getBodyFontSizeStyle } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useCardContentEditor } from "./card-content-edit";
import { CardTitleInline, PlainInline } from "./card-inline-fields";

type CsvResponse = { ok?: boolean; rows?: string[][]; error?: string };

const cache = new Map<string, { at: number; rows: string[][] }>();

export function MenuSheetSyncCard({ card, locale = "ja" }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const editor = useCardContentEditor(card);
  const c = editor.content;
  const bind = { editable: editor.editable, onActivate: editor.onActivate };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const csvUrl = typeof c?.csvUrl === "string" ? c.csvUrl.trim() : "";
  const delimiter = typeof c?.delimiter === "string" && c.delimiter.length > 0 ? c.delimiter : ",";
  const hasHeader = c?.hasHeader !== false;
  const nameCol = Math.max(0, Number(c?.nameColumn ?? 0) || 0);
  const priceCol = Math.max(0, Number(c?.priceColumn ?? 1) || 0);
  const descCol = Number(c?.descriptionColumn ?? 2);
  const tagCol = Number(c?.tagColumn ?? -1);
  const fallbackText =
    getLocalizedContent(c?.fallbackText as LocalizedString | undefined, locale) ||
    "メニューを読み込めませんでした。";
  const ttlMs = Math.min(600_000, Math.max(30_000, (Number(c?.cacheTtlSec ?? 120) || 120) * 1000));

  const [rows, setRows] = useState<string[][] | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const displayRows = useMemo(() => {
    if (!rows?.length) return [];
    const start = hasHeader ? 1 : 0;
    return rows.slice(start).filter((r) => r.some((cell) => String(cell).trim() !== ""));
  }, [rows, hasHeader]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      if (!csvUrl) {
        setRows([]);
        setFailed(false);
        setLoading(false);
        return;
      }
      const cached = cache.get(csvUrl);
      const now = Date.now();
      if (cached && now - cached.at < ttlMs) {
        setRows(cached.rows);
        setFailed(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      setFailed(false);
      try {
        const res = await fetch("/api/menu-csv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: csvUrl, delimiter }),
        });
        const data = (await res.json()) as CsvResponse;
        if (cancelled) return;
        if (data.ok && Array.isArray(data.rows)) {
          cache.set(csvUrl, { at: Date.now(), rows: data.rows });
          setRows(data.rows);
        } else {
          setFailed(true);
          setRows([]);
        }
      } catch {
        if (!cancelled) {
          setFailed(true);
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [csvUrl, delimiter, ttlMs]);

  const cell = (row: string[], idx: number) => (idx >= 0 && idx < row.length ? String(row[idx] ?? "").trim() : "");

  const override = (index: number, field: string, fallback: string) => {
    const overrides = Array.isArray(c?.rowOverrides) ? (c.rowOverrides as Array<Record<string, string>>) : [];
    const v = overrides[index]?.[field];
    return typeof v === "string" && v.length > 0 ? v : fallback;
  };

  return (
    <Card padding="md">
      <CardTitleInline title={title} onSave={(v) => editor.setField("title", v)} placeholder="メニュー" bind={bind} />
      {loading ? (
        <p className="mt-3 text-sm text-slate-500" style={getBodyFontSizeStyle()}>
          読み込み中…
        </p>
      ) : null}
      {!loading && failed ? (
        <p className="mt-3 text-sm text-amber-800" style={getBodyFontSizeStyle()}>
          <PlainInline
            value={fallbackText}
            onSave={(v) => editor.setField("fallbackText", v)}
            bind={bind}
            multiline
            className="block w-full min-h-[1lh] text-sm text-amber-800"
            placeholder="読み込み失敗時の文言"
          />
        </p>
      ) : null}
      {!loading && !failed && csvUrl && displayRows.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500" style={getBodyFontSizeStyle()}>
          CSVにデータ行がありません（列番号・ヘッダー設定を確認してください）。
        </p>
      ) : null}
      <div className="mt-2 space-y-1.5">
        {displayRows.map((row, index) => {
          const name = override(index, "name", cell(row, nameCol));
          const price = override(index, "price", cell(row, priceCol));
          const description = override(index, "description", descCol >= 0 ? cell(row, descCol) : "");
          const tag = override(index, "tag", tagCol >= 0 ? cell(row, tagCol) : "");
          if (!name && !price && !description && !bind.editable) return null;
          return (
            <div key={index} data-inner-surface className={`${editorInnerRadiusClassName} bg-slate-50 px-2.5 py-2`}>
              <p className="font-semibold text-slate-800" style={getBodyFontSizeStyle()}>
                <PlainInline
                  value={name || "—"}
                  onSave={(v) => editor.setRowOverrideField(index, "name", v)}
                  bind={bind}
                  className="inline font-semibold text-slate-800"
                  placeholder="メニュー名"
                />
                {" — "}
                <PlainInline
                  value={price}
                  onSave={(v) => editor.setRowOverrideField(index, "price", v)}
                  bind={bind}
                  className="inline font-semibold text-slate-800"
                  placeholder="価格"
                />
                {tag || bind.editable ? (
                  <span className="ml-2 inline-block">
                    <PlainInline
                      value={tag}
                      onSave={(v) => editor.setRowOverrideField(index, "tag", v)}
                      bind={bind}
                      className="inline rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                      placeholder="タグ"
                    />
                  </span>
                ) : null}
              </p>
              {description || bind.editable ? (
                <p className="mt-0.5 text-slate-500" style={getBodyFontSizeStyle()}>
                  <PlainInline
                    value={description}
                    onSave={(v) => editor.setRowOverrideField(index, "description", v)}
                    bind={bind}
                    multiline
                    className="block w-full min-h-[1lh] text-slate-500"
                    placeholder="説明"
                  />
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
