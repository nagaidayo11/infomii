"use client";

import { useEffect, useMemo, useState } from "react";
import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getBodyFontSizeStyle, getTitleFontSizeStyle } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";

type CsvResponse = { ok?: boolean; rows?: string[][]; error?: string };

const cache = new Map<string, { at: number; rows: string[][] }>();

export function MenuSheetSyncCard({ card, locale = "ja" }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const c = card.content as Record<string, unknown> | undefined;
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

  return (
    <Card padding="md">
      {title ? <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>{title}</p> : null}
      {loading ? (
        <p className="mt-3 text-sm text-slate-500" style={getBodyFontSizeStyle()}>
          読み込み中…
        </p>
      ) : null}
      {!loading && failed ? (
        <p className="mt-3 text-sm text-amber-800" style={getBodyFontSizeStyle()}>
          {fallbackText}
        </p>
      ) : null}
      {!loading && !failed && csvUrl && displayRows.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500" style={getBodyFontSizeStyle()}>
          CSVにデータ行がありません（列番号・ヘッダー設定を確認してください）。
        </p>
      ) : null}
      <div className="mt-2 space-y-1.5">
        {displayRows.map((row, index) => {
          const name = cell(row, nameCol);
          const price = cell(row, priceCol);
          const description = descCol >= 0 ? cell(row, descCol) : "";
          const tag = tagCol >= 0 ? cell(row, tagCol) : "";
          if (!name && !price && !description) return null;
          return (
            <div key={index} data-inner-surface className={`${editorInnerRadiusClassName} bg-slate-50 px-2.5 py-2`}>
              <p className="font-semibold text-slate-800" style={getBodyFontSizeStyle()}>
                {name || "—"}
                {price ? ` — ${price}` : ""}
                {tag ? (
                  <span className="ml-2 inline-block rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    {tag}
                  </span>
                ) : null}
              </p>
              {description ? (
                <p className="mt-0.5 text-slate-500" style={getBodyFontSizeStyle()}>
                  {description}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
