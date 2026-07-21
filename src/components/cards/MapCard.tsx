"use client";

import type { EditorCard } from "@/components/editor/types";
import { getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { useEditor2Store } from "@/components/editor/store";
import { useCardInlineEdit } from "./card-inline-edit";
import { LineIcon } from "./LineIcon";

type MapCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

type MapPin = { name?: string; walk?: string; note?: string };

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
      host === "www.google.com" || host === "google.com" || host === "maps.google.com";
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

export function MapCard({ card, locale = "ja" }: MapCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const address = getLocalizedContent(c?.address as LocalizedString | undefined, locale);
  const mapEmbedUrl = normalizeMapEmbedUrl((c?.mapEmbedUrl as string) ?? "");
  const accent =
    typeof c?.accentColor === "string" && c.accentColor.trim() ? c.accentColor.trim() : "#0f766e";
  const pins = (Array.isArray(c?.pins) ? c.pins : []) as MapPin[];
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

  const updatePin = (index: number, field: keyof MapPin, value: string) => {
    const next = pins.map((p, i) => (i === index ? { ...p, [field]: value } : p));
    updateCard(card.id, { content: { ...c, pins: next } });
  };

  return (
    <section
      className="pres-block"
      style={{ ["--pres-accent" as string]: accent }}
      onClick={editable ? onActivate : undefined}
    >
      {(editable || title) ? (
        <h3 className="pres-block__title">
          <InlineEditable
            value={title}
            onSave={(v) => updateKey("title", v)}
            editable={editable}
            onActivate={onActivate}
            className="pres-block__title"
            placeholder={labels.titlePlaceholder}
          />
        </h3>
      ) : null}

      <div className="pres-map">
        <div className="pres-map__frame">
          {mapEmbedUrl ? (
            <iframe
              title={title || labels.titlePlaceholder}
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--pres-accent,#0f766e)]">
              <LineIcon name="map" className="h-8 w-8" />
            </div>
          )}
        </div>

        {(editable || address) ? (
          <p className="pres-map__address" style={getBodyFontSizeStyle()}>
            <InlineEditable
              value={address}
              onSave={(v) => updateKey("address", v)}
              editable={editable}
              onActivate={onActivate}
              placeholder={labels.addressPlaceholder}
            />
          </p>
        ) : null}

        {pins.length > 0 ? (
          <div className="pres-map__pins">
            {pins.map((pin, i) => {
              const name = getLocalizedContent(pin.name as LocalizedString | undefined, locale);
              const walk = getLocalizedContent(pin.walk as LocalizedString | undefined, locale);
              const note = getLocalizedContent(pin.note as LocalizedString | undefined, locale);
              return (
                <div key={i} className="pres-map__pin">
                  <span className="pres-map__pin-dot" aria-hidden />
                  <div>
                    <div className="pres-map__pin-name">
                      <InlineEditable
                        value={name}
                        onSave={(v) => updatePin(i, "name", v)}
                        editable={editable}
                        onActivate={onActivate}
                        placeholder="スポット名"
                      />
                    </div>
                    {(editable || note) ? (
                      <div className="pres-map__pin-meta">
                        <InlineEditable
                          value={note}
                          onSave={(v) => updatePin(i, "note", v)}
                          editable={editable}
                          onActivate={onActivate}
                          placeholder="補足"
                        />
                      </div>
                    ) : null}
                  </div>
                  {(editable || walk) ? (
                    <div className="pres-map__pin-walk">
                      <InlineEditable
                        value={walk}
                        onSave={(v) => updatePin(i, "walk", v)}
                        editable={editable}
                        onActivate={onActivate}
                        placeholder="徒歩○分"
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
