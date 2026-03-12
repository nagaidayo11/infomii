import type { MapBlockData } from "./types";

export type MapBlockProps = {
  data: MapBlockData;
  className?: string;
};

/**
 * Renders map placeholder / address from JSON:
 * { "type": "map", "address": "..." } or { "type": "map", "embedUrl": "..." }
 */
export function MapBlock({ data, className = "" }: MapBlockProps) {
  const address = data.address?.trim();
  const embedUrl = data.embedUrl?.trim();

  if (embedUrl) {
    return (
      <div
        className={`my-2 overflow-hidden rounded-xl bg-slate-100 ${className}`.trim()}
        data-block-type="map"
      >
        <iframe
          title="地図"
          src={embedUrl}
          className="h-40 w-full border-0"
          loading="lazy"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      className={`my-2 rounded-xl bg-slate-100 py-8 text-center text-sm text-slate-600 ${className}`.trim()}
      data-block-type="map"
    >
      {address || "地図"}
    </div>
  );
}
