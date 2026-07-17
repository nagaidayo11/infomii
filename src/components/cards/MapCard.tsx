"use client";

import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getBodyFontSizeStyle, getTitleFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { AppSectionHeader } from "@/components/app-shell/primitives";
import { useCardInlineEdit } from "./card-inline-edit";
import { LineIcon } from "./LineIcon";
import { NativeMapIcon } from "./native-guest-icons";

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
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const { isNativeUi } = useClientShell();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const address = getLocalizedContent(c?.address as LocalizedString | undefined, locale);
  const mapEmbedUrl = normalizeMapEmbedUrl((c?.mapEmbedUrl as string) ?? "");
  const labels =
    locale === "ko"
      ? { titlePlaceholder: "지도", addressPlaceholder: "주소" }
      : locale === "zh"
        ? { titlePlaceholder: "地图", addressPlaceholder: "地址" }
        : locale === "en"
          ? { titlePlaceholder: "Map", addressPlaceholder: "Address" }
          : { titlePlaceholder: "地図", addressPlaceholder: "住所" };

  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  if (isNativeUi) {
    return (
      <div className="app-native-section app-native-guest-card">
        {(editable || title) ? (
          <AppSectionHeader
            title={
              <InlineEditable
                value={title}
                onSave={(v) => updateKey("title", v)}
                editable={editable}
                onActivate={onActivate}
                className="app-section-header__title"
                placeholder={labels.titlePlaceholder}
              />
            }
            icon={<NativeMapIcon />}
            as="div"
          />
        ) : (
          <AppSectionHeader title={labels.titlePlaceholder} icon={<NativeMapIcon />} />
        )}
        {mapEmbedUrl ? (
          <div className="app-native-media">
            <iframe
              title={title || labels.titlePlaceholder}
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-52 w-full border-0"
            />
          </div>
        ) : (
          <div className="app-native-media flex items-center justify-center py-10 text-[var(--app-accent)]">
            <LineIcon name="map" className="h-8 w-8" />
          </div>
        )}
        <p className="app-native-media-caption" style={getBodyFontSizeStyle()}>
          <InlineEditable
            value={address}
            onSave={(v) => updateKey("address", v)}
            editable={editable}
            onActivate={onActivate}
            className="text-[var(--app-text-muted)]"
            placeholder={labels.addressPlaceholder}
          />
        </p>
      </div>
    );
  }

  return (
    <Card padding="md" className="">
      {(editable || title) ? (
        <p className="mb-2 text-slate-900" style={getTitleFontSizeStyle()}>
          <InlineEditable value={title} onSave={(v) => updateKey("title", v)} editable={editable} onActivate={onActivate} className={CARD_BLOCK_TITLE_CLASS} placeholder={labels.titlePlaceholder} />
        </p>
      ) : null}
      {mapEmbedUrl ? (
        <div data-inner-surface className={`overflow-hidden ${editorInnerRadiusClassName} border border-slate-200 bg-slate-50`}>
          <iframe
            title={title}
            src={mapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-52 w-full border-0"
          />
        </div>
      ) : (
        <div data-inner-surface className={`flex items-center justify-center ${editorInnerRadiusClassName} bg-slate-100 py-8`}>
          <span className="text-slate-700" aria-hidden>
            <LineIcon name="map" className="h-8 w-8" />
          </span>
        </div>
      )}
      <p className="mt-2 text-slate-700" style={getBodyFontSizeStyle()}>
        <InlineEditable value={address} onSave={(v) => updateKey("address", v)} editable={editable} onActivate={onActivate} className="text-slate-700" placeholder={labels.addressPlaceholder} />
      </p>
    </Card>
  );
}
