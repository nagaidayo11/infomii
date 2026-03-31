"use client";

import type { EditorCard } from "@/components/editor/types";
import { getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { LineIcon } from "./LineIcon";

type MapCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

function normalizeMapEmbedUrl(raw: string): string | null {
  const input = raw.trim();
  if (!input) return null;

  const iframeSrcMatch = input.match(/<iframe[^>]*src=["']([^"']+)["']/i);
  const candidate = iframeSrcMatch?.[1]?.trim() || input;

  try {
    const parsed = new URL(candidate);
    const host = parsed.hostname.toLowerCase();
    const isGoogleMapsHost =
      host === "www.google.com" ||
      host === "google.com" ||
      host === "maps.google.com";
    if (!isGoogleMapsHost) {
      return null;
    }

    if (parsed.pathname.startsWith("/maps/embed")) {
      return parsed.toString();
    }

    const apiQuery = parsed.searchParams.get("query");
    if (apiQuery) {
      return `https://www.google.com/maps?q=${encodeURIComponent(apiQuery)}&output=embed`;
    }

    const q = parsed.searchParams.get("q");
    if (q) {
      return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
    }

    const placeMatch = parsed.pathname.match(/\/maps\/place\/([^/]+)/i);
    if (placeMatch?.[1]) {
      const place = decodeURIComponent(placeMatch[1]).replace(/\+/g, " ");
      return `https://www.google.com/maps?q=${encodeURIComponent(place)}&output=embed`;
    }

    const latLngMatch = parsed.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (latLngMatch?.[1] && latLngMatch?.[2]) {
      const latLng = `${latLngMatch[1]},${latLngMatch[2]}`;
      return `https://www.google.com/maps?q=${encodeURIComponent(latLng)}&output=embed`;
    }
  } catch {
    return null;
  }

  return null;
}

export function MapCard({ card, isSelected, locale = "ja" }: MapCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const address = getLocalizedContent(c?.address as LocalizedString | undefined, locale);
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || "地図";
  const mapEmbedUrl = normalizeMapEmbedUrl((c?.mapEmbedUrl as string) ?? "");
  const labels =
    locale === "ko"
      ? { titlePlaceholder: "지도", addressPlaceholder: "주소" }
      : locale === "zh"
        ? { titlePlaceholder: "地图", addressPlaceholder: "地址" }
        : locale === "en"
          ? { titlePlaceholder: "Map", addressPlaceholder: "Address" }
          : { titlePlaceholder: "地図", addressPlaceholder: "住所" };

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  const onActivate = () => selectCard(card.id);

  return (
    <Card padding="md" className="">
      <p className="mb-2 text-slate-900">
        <InlineEditable value={title} onSave={(v) => updateKey("title", v)} editable={isSelected} onActivate={onActivate} className="font-semibold text-slate-900" placeholder={labels.titlePlaceholder} />
      </p>
      {mapEmbedUrl ? (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <iframe
            title={title}
            src={mapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-52 w-full border-0"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-lg bg-slate-100 py-8">
          <span className="text-slate-700" aria-hidden>
            <LineIcon name="map" className="h-8 w-8" />
          </span>
        </div>
      )}
      <p className="mt-2 text-slate-700" style={getBodyFontSizeStyle()}>
        <InlineEditable value={address} onSave={(v) => updateKey("address", v)} editable={isSelected} onActivate={onActivate} className="text-slate-700" placeholder={labels.addressPlaceholder} />
      </p>
    </Card>
  );
}
