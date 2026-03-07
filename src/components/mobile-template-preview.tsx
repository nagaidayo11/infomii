import Image from "next/image";
import type { ReactNode } from "react";
import type { InformationBlock, InformationTheme } from "@/types/information";

const DEFAULT_THEME: InformationTheme = {
  backgroundColor: "#ffffff",
  textColor: "#0f172a",
  fontFamily: "sans-serif",
  bodySize: "md",
  titleSize: "md",
  titleWeight: "semibold",
  titleAlign: "left",
};

function getTitleSizeClass(size: InformationTheme["titleSize"]): string {
  if (size === "sm") return "text-xl";
  if (size === "lg") return "text-3xl";
  return "text-2xl";
}

function getBlockTextSizeClass(
  size: InformationBlock["textSize"] | undefined,
  fallback: InformationTheme["bodySize"],
): string {
  const value = size ?? fallback;
  if (value === "sm") return "text-sm";
  if (value === "lg") return "text-lg";
  return "text-base";
}

function getWeightClass(weight: "normal" | "medium" | "semibold" | undefined): string {
  if (weight === "semibold") return "font-semibold";
  if (weight === "medium") return "font-medium";
  return "font-normal";
}

function getBlockAlignClass(align: InformationBlock["textAlign"] | undefined): string {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}

function getBlockJustifyClass(align: InformationBlock["textAlign"] | undefined): string {
  if (align === "center") return "justify-center";
  if (align === "right") return "justify-end";
  return "justify-start";
}

function getBlockSpacingStyle(spacing: InformationBlock["spacing"] | undefined): { marginBottom: string } {
  if (spacing === "sm") return { marginBottom: "8px" };
  if (spacing === "lg") return { marginBottom: "28px" };
  return { marginBottom: "16px" };
}

function getSpaceHeightClass(spacing: InformationBlock["spacing"] | undefined): string {
  if (spacing === "sm") return "h-4";
  if (spacing === "lg") return "h-12";
  return "h-8";
}

function getCardRadiusClass(radius: InformationBlock["cardRadius"] | undefined): string {
  if (radius === "sm") return "rounded-md";
  if (radius === "md") return "rounded-lg";
  if (radius === "xl") return "rounded-2xl";
  if (radius === "full") return "rounded-3xl";
  return "rounded-xl";
}

function getDividerThicknessStyle(
  thickness: InformationBlock["dividerThickness"] | undefined,
  color: string | undefined,
): { borderTopWidth: string; borderTopColor: string } {
  if (thickness === "thick") return { borderTopWidth: "3px", borderTopColor: color ?? "#e2e8f0" };
  if (thickness === "medium") return { borderTopWidth: "2px", borderTopColor: color ?? "#e2e8f0" };
  return { borderTopWidth: "1px", borderTopColor: color ?? "#e2e8f0" };
}

function getBlockContainerStyle(block: InformationBlock, theme: InformationTheme): { marginBottom: string; fontFamily: string } {
  return {
    ...getBlockSpacingStyle(block.spacing),
    fontFamily: block.fontFamily ?? theme.fontFamily ?? "sans-serif",
  };
}

function getIconSizeClass(size: InformationBlock["iconSize"] | undefined): string {
  if (size === "sm") return "text-base h-4 w-4";
  if (size === "lg") return "text-2xl h-6 w-6";
  if (size === "xl") return "text-3xl h-7 w-7";
  return "text-xl h-5 w-5";
}

function getIconRowColumnsClass(iconCount: number): string {
  if (iconCount >= 10) return "grid-cols-3";
  if (iconCount >= 3) return "grid-cols-3";
  return "grid-cols-2";
}

function renderLineIcon(token: string, size: InformationBlock["iconSize"] | undefined): ReactNode {
  const iconSize = getIconSizeClass(size);
  const className = `${iconSize
    .split(" ")
    .filter((c) => c.startsWith("h-") || c.startsWith("w-"))
    .join(" ")} text-slate-700`;
  if (token === "svg:clock") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </svg>
    );
  }
  if (token === "svg:map-pin") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 21s6-5.4 6-10a6 6 0 1 0-12 0c0 4.6 6 10 6 10Z" />
        <circle cx="12" cy="11" r="2.5" />
      </svg>
    );
  }
  if (token === "svg:wifi") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4.5 9.5a11 11 0 0 1 15 0" />
        <path d="M7.5 12.5a7 7 0 0 1 9 0" />
        <path d="M10.5 15.5a3 3 0 0 1 3 0" />
        <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (token === "svg:car") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 13h16l-1.5-4h-13L4 13Z" />
        <path d="M5 13v4h2" />
        <path d="M17 17h2v-4" />
        <circle cx="8" cy="17" r="1.6" />
        <circle cx="16" cy="17" r="1.6" />
      </svg>
    );
  }
  if (token === "svg:bell") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 17h8l-1-2v-4a3 3 0 1 0-6 0v4l-1 2Z" />
        <path d="M10.5 19a1.5 1.5 0 0 0 3 0" />
      </svg>
    );
  }
  if (token === "svg:utensils") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 4v8" />
        <path d="M5 4v4" />
        <path d="M9 4v4" />
        <path d="M7 12v8" />
        <path d="M16 4c1.5 2.5 1.5 5.5 0 8v8" />
      </svg>
    );
  }
  if (token === "svg:bath") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 12h14v3a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-3Z" />
        <path d="M8 12V8a2 2 0 1 1 4 0" />
      </svg>
    );
  }
  if (token === "svg:phone") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 3h4l1 4-2 1.5a14 14 0 0 0 6 6L16.5 12l4 1v4l-2 2a3 3 0 0 1-3 .7A18 18 0 0 1 4.3 8.5 3 3 0 0 1 5 5.5L6 3Z" />
      </svg>
    );
  }
  if (token === "svg:key") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="8.5" cy="12" r="3.2" />
        <path d="M11.7 12H20" />
        <path d="M16 12v2" />
        <path d="M18 12v1.5" />
      </svg>
    );
  }
  if (token === "svg:toothbrush") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 18.5h6.5a2.5 2.5 0 0 0 2.3-1.5L20 4.5" />
        <path d="M17.8 3.8 20.2 6.2" />
        <path d="M5.5 16.5h3.5" />
      </svg>
    );
  }
  if (token === "svg:hanger") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 7a2 2 0 1 0-2-2" />
        <path d="M10 7.2 4.5 14a2 2 0 0 0 1.6 3.3h11.8a2 2 0 0 0 1.6-3.3L14 7.2" />
      </svg>
    );
  }
  if (token === "svg:broom") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19h9" />
        <path d="M14 5 9 10" />
        <path d="m8 11 4.5 4.5a2 2 0 0 1 0 2.8L11.8 19H6.5" />
      </svg>
    );
  }
  if (token === "svg:washing-machine") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="5" y="3.5" width="14" height="17" rx="2" />
        <circle cx="12" cy="13" r="4" />
        <path d="M8 6.8h.01M10.5 6.8h.01" />
      </svg>
    );
  }
  if (token === "svg:microwave") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3.5" y="5" width="17" height="14" rx="2" />
        <rect x="6.5" y="8" width="9" height="8" rx="1" />
        <path d="M18 8v8M19 9v.01M19 12v.01M19 15v.01" />
      </svg>
    );
  }
  if (token === "svg:package") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4.5 8.5 12 4l7.5 4.5v7L12 20l-7.5-4.5v-7Z" />
        <path d="M12 20v-7.5M4.5 8.5 12 13l7.5-4.5" />
      </svg>
    );
  }
  if (token === "svg:taxi") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 13h14l-1.6-4.5H6.6L5 13Z" />
        <path d="M7.5 8.5 9 6h6l1.5 2.5" />
        <circle cx="8" cy="17" r="1.6" />
        <circle cx="16" cy="17" r="1.6" />
        <path d="M6 13v4M18 13v4" />
      </svg>
    );
  }
  if (token === "svg:bed") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3.5 18.5h17" />
        <path d="M5 18.5V9.5h14v9" />
        <rect x="6.5" y="11" width="4.5" height="3" rx="1" />
      </svg>
    );
  }
  if (token === "svg:info") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 10v5" />
        <path d="M12 7.5h.01" />
      </svg>
    );
  }
  if (token === "svg:ticket") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5V10a2 2 0 1 0 0 4v1.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 15.5V14a2 2 0 1 0 0-4V8.5Z" />
        <path d="M12 9v6" />
      </svg>
    );
  }
  return null;
}

function renderIconVisual(icon: string | undefined, size: InformationBlock["iconSize"] | undefined): ReactNode {
  const iconSize = getIconSizeClass(size).split(" ")[0];
  if (!icon) {
    return <span className={iconSize}>⭐</span>;
  }
  if (icon.startsWith("svg:")) {
    return renderLineIcon(icon, size) ?? <span className={iconSize}>⭐</span>;
  }
  return <span className={iconSize}>{icon}</span>;
}

type MobileTemplatePreviewProps = {
  blocks?: InformationBlock[];
  theme?: InformationTheme;
  className?: string;
};

export default function MobileTemplatePreview({ blocks, theme, className }: MobileTemplatePreviewProps) {
  const mergedTheme: InformationTheme = { ...DEFAULT_THEME, ...(theme ?? {}) };
  const safeBlocks = blocks ?? [];

  return (
    <article
      className={`relative mx-auto min-h-[640px] max-w-sm rounded-3xl border border-slate-200 p-6 shadow-sm ${className ?? ""}`}
      style={{
        backgroundColor: mergedTheme.backgroundColor ?? "#ffffff",
        color: mergedTheme.textColor ?? "#0f172a",
        fontFamily: mergedTheme.fontFamily ?? "sans-serif",
      }}
    >
      <div>
        {safeBlocks.map((block) => {
          if (block.type === "title") {
            return (
              <div key={block.id} style={getBlockContainerStyle(block, mergedTheme)}>
                <h3
                  className={`${getWeightClass(block.textWeight ?? mergedTheme.titleWeight ?? "semibold")} ${getTitleSizeClass(block.textSize ?? "md")} ${getBlockAlignClass(block.textAlign ?? mergedTheme.titleAlign)}`}
                  style={{ color: block.textColor ?? mergedTheme.titleColor ?? mergedTheme.textColor ?? "#0f172a" }}
                >
                  {block.text || "タイトル"}
                </h3>
              </div>
            );
          }
          if (block.type === "heading") {
            return (
              <div key={block.id} style={getBlockContainerStyle(block, mergedTheme)}>
                <h3
                  className={`${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)} ${getBlockAlignClass(block.textAlign)}`}
                  style={{ color: block.textColor ?? mergedTheme.textColor ?? "#0f172a" }}
                >
                  {block.text || "見出し"}
                </h3>
              </div>
            );
          }
          if (block.type === "paragraph") {
            return (
              <div key={block.id} style={getBlockContainerStyle(block, mergedTheme)}>
                <p
                  className={`whitespace-pre-wrap leading-7 ${getWeightClass(block.textWeight)} ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)} ${getBlockAlignClass(block.textAlign)}`}
                  style={{ color: block.textColor ?? mergedTheme.textColor ?? "#0f172a" }}
                >
                  {block.text || ""}
                </p>
              </div>
            );
          }
          if (block.type === "image") {
            const imageUrl = (block.url ?? "").trim();
            if (!imageUrl) {
              return null;
            }
            return (
              <div key={block.id} style={getBlockContainerStyle(block, mergedTheme)}>
                <Image src={imageUrl} alt="block" width={640} height={360} unoptimized className="h-auto w-full rounded-lg object-cover" />
              </div>
            );
          }
          if (block.type === "icon") {
            return (
              <div key={block.id} style={getBlockContainerStyle(block, mergedTheme)}>
                <div className={`rounded-lg border border-slate-200 bg-slate-50/70 p-3 ${getBlockAlignClass(block.textAlign)}`}>
                  <div className={`flex items-center gap-2 ${getBlockJustifyClass(block.textAlign)}`}>
                    {renderIconVisual(block.icon, block.iconSize)}
                    <p className={`${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)}`} style={{ color: block.textColor ?? mergedTheme.textColor ?? "#0f172a" }}>
                      {block.label || "ラベル"}
                    </p>
                  </div>
                  <p className={`mt-1 whitespace-pre-wrap ${getWeightClass(block.textWeight)} ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)}`} style={{ color: block.textColor ?? mergedTheme.textColor ?? "#0f172a" }}>
                    {block.description || ""}
                  </p>
                </div>
              </div>
            );
          }
          if (block.type === "iconRow") {
            const iconItems = block.iconItems ?? [];
            const iconColumnsClass = getIconRowColumnsClass(iconItems.length);
            const isRoundIconRow = block.cardRadius === "full";
            const iconItemRadiusClass = isRoundIconRow ? "rounded-full" : getCardRadiusClass(block.cardRadius);
            return (
              <div key={block.id} style={getBlockContainerStyle(block, mergedTheme)}>
                <div className={`${getCardRadiusClass(block.cardRadius)} border border-slate-200 p-3`} style={{ backgroundColor: block.iconRowBackgroundColor ?? "#f8fafc" }}>
                  <div className={`grid ${isRoundIconRow ? "gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6" : "gap-2"} ${iconColumnsClass}`}>
                    {iconItems.map((entry) => (
                      isRoundIconRow ? (
                        <div key={entry.id} className="flex w-full flex-col items-center gap-2">
                          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-300 sm:h-16 sm:w-16" style={{ backgroundColor: entry.backgroundColor ?? "#ffffff" }}>
                            {renderIconVisual(entry.icon, block.iconSize)}
                          </span>
                          <p className={`text-center ${getWeightClass(block.textWeight ?? "medium")} ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)}`} style={{ color: block.textColor ?? mergedTheme.textColor ?? "#0f172a" }}>
                            {entry.label || "項目"}
                          </p>
                        </div>
                      ) : (
                        <div key={entry.id} className={`${iconItemRadiusClass} border border-slate-200 text-center shadow-sm`} style={{ backgroundColor: entry.backgroundColor ?? "#ffffff" }}>
                          <div className="flex w-full flex-col items-center justify-center gap-1 px-2 py-2.5 min-h-[76px]">
                            {renderIconVisual(entry.icon, block.iconSize)}
                            <p className={`${getWeightClass(block.textWeight ?? "medium")} ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)}`} style={{ color: block.textColor ?? mergedTheme.textColor ?? "#0f172a" }}>
                              {entry.label || "項目"}
                            </p>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            );
          }
          if (block.type === "section") {
            const hasSectionContent = Boolean((block.sectionTitle ?? "").trim() || (block.sectionBody ?? "").trim());
            if (!hasSectionContent) {
              return null;
            }
            return (
              <div key={block.id} style={getBlockContainerStyle(block, mergedTheme)}>
                <div className={`rounded-xl border border-slate-200 px-4 py-4 ${getBlockAlignClass(block.textAlign)}`} style={{ backgroundColor: block.sectionBackgroundColor ?? "#f8fafc" }}>
                  <p className={`${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)}`} style={{ color: block.textColor ?? mergedTheme.textColor ?? "#0f172a" }}>
                    {block.sectionTitle || "セクションタイトル"}
                  </p>
                  <p className={`mt-2 whitespace-pre-wrap ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)}`} style={{ color: block.textColor ?? mergedTheme.textColor ?? "#0f172a" }}>
                    {block.sectionBody || ""}
                  </p>
                </div>
              </div>
            );
          }
          if (block.type === "columns") {
            return (
              <div key={block.id} style={getBlockContainerStyle(block, mergedTheme)}>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className={`${getCardRadiusClass(block.cardRadius)} border border-slate-200 p-3`} style={{ backgroundColor: block.columnsBackgroundColor ?? "#f8fafc" }}>
                    <p className={`mb-1 ${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)} ${getBlockAlignClass(block.textAlign)}`} style={{ color: block.textColor ?? mergedTheme.textColor ?? "#0f172a" }}>{block.leftTitle || "左タイトル"}</p>
                    <p className={`whitespace-pre-wrap ${getWeightClass(block.textWeight)} ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)} ${getBlockAlignClass(block.textAlign)}`} style={{ color: block.textColor ?? mergedTheme.textColor ?? "#0f172a" }}>{block.leftText || ""}</p>
                  </div>
                  <div className={`${getCardRadiusClass(block.cardRadius)} border border-slate-200 p-3`} style={{ backgroundColor: block.columnsBackgroundColor ?? "#f8fafc" }}>
                    <p className={`mb-1 ${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)} ${getBlockAlignClass(block.textAlign)}`} style={{ color: block.textColor ?? mergedTheme.textColor ?? "#0f172a" }}>{block.rightTitle || "右タイトル"}</p>
                    <p className={`whitespace-pre-wrap ${getWeightClass(block.textWeight)} ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)} ${getBlockAlignClass(block.textAlign)}`} style={{ color: block.textColor ?? mergedTheme.textColor ?? "#0f172a" }}>{block.rightText || ""}</p>
                  </div>
                </div>
              </div>
            );
          }
          if (block.type === "cta") {
            return (
              <div key={block.id} style={getBlockContainerStyle(block, mergedTheme)} className={getBlockAlignClass(block.textAlign)}>
                <span className={`inline-flex rounded-lg bg-emerald-600 px-4 py-2 ${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)}`} style={{ color: block.textColor ?? "#ffffff" }}>
                  {block.ctaLabel || "ボタン"}
                </span>
              </div>
            );
          }
          if (block.type === "badge") {
            return (
              <div key={block.id} style={getBlockContainerStyle(block, mergedTheme)} className={getBlockAlignClass(block.textAlign)}>
                <span className={`inline-flex rounded-full px-3 py-1 ${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)}`} style={{ backgroundColor: block.badgeColor ?? "#dcfce7", color: block.textColor ?? block.badgeTextColor ?? "#065f46" }}>
                  {block.badgeText || "バッジ"}
                </span>
              </div>
            );
          }
          if (block.type === "hours") {
            return (
              <div key={block.id} style={getBlockContainerStyle(block, mergedTheme)}>
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                  <p className={`mb-2 ${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)}`} style={{ color: block.textColor ?? mergedTheme.textColor ?? "#0f172a" }}>営業時間</p>
                  <div className="space-y-1.5">
                    {(block.hoursItems ?? []).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between gap-3">
                        <span className={`${getWeightClass(block.textWeight ?? "medium")} ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)}`} style={{ color: block.textColor ?? mergedTheme.textColor ?? "#0f172a" }}>{entry.label || "-"}</span>
                        <span className={getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)} style={{ color: block.textColor ?? mergedTheme.textColor ?? "#0f172a" }}>{entry.value || "-"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          }
          if (block.type === "pricing") {
            return (
              <div key={block.id} style={getBlockContainerStyle(block, mergedTheme)}>
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                  <p className={`mb-2 ${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)}`} style={{ color: block.textColor ?? mergedTheme.textColor ?? "#0f172a" }}>料金表</p>
                  <div className="space-y-1.5">
                    {(block.pricingItems ?? []).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between gap-3">
                        <span className={`${getWeightClass(block.textWeight ?? "medium")} ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)}`} style={{ color: block.textColor ?? mergedTheme.textColor ?? "#0f172a" }}>{entry.label || "-"}</span>
                        <span className={getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)} style={{ color: block.textColor ?? mergedTheme.textColor ?? "#0f172a" }}>{entry.value || "-"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          }
          if (block.type === "quote") {
            return (
              <div key={block.id} style={getBlockContainerStyle(block, mergedTheme)}>
                <blockquote className={`rounded-xl border-l-4 border-emerald-400 bg-emerald-50/50 px-4 py-3 ${getBlockAlignClass(block.textAlign)}`}>
                  <p className={`whitespace-pre-wrap italic ${getWeightClass(block.textWeight ?? "medium")} ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)}`} style={{ color: block.textColor ?? mergedTheme.textColor ?? "#0f172a" }}>
                    {block.text || "引用文"}
                  </p>
                  {block.quoteAuthor ? <p className={`mt-2 ${getWeightClass(block.textWeight)} ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)} ${getBlockAlignClass(block.textAlign)} text-slate-500`} style={{ color: block.textColor ?? mergedTheme.textColor ?? "#475569" }}>{block.quoteAuthor}</p> : null}
                </blockquote>
              </div>
            );
          }
          if (block.type === "checklist") {
            return (
              <div key={block.id} style={getBlockContainerStyle(block, mergedTheme)}>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <ul className="space-y-2">
                    {(block.checklistItems ?? []).map((entry) => (
                      <li key={entry.id} className="flex gap-2">
                        <span className="mt-[3px] inline-block h-2 w-2 rounded-full bg-emerald-500" />
                        <p className={`${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)}`} style={{ color: block.textColor ?? mergedTheme.textColor ?? "#0f172a" }}>{entry.text || "項目"}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          }
          if (block.type === "gallery") {
            const galleryItems = (block.galleryItems ?? []).filter((entry) => entry.url.trim());
            if (galleryItems.length === 0) {
              return null;
            }
            return (
              <div key={block.id} style={getBlockContainerStyle(block, mergedTheme)}>
                <div className="grid grid-cols-2 gap-2">
                  {galleryItems.map((entry) => (
                    <div key={entry.id} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      <Image src={entry.url} alt={entry.caption || "gallery"} width={320} height={220} unoptimized className="h-24 w-full object-cover" />
                      {entry.caption ? <p className={`px-2 py-1 ${getWeightClass(block.textWeight)} ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)} ${getBlockAlignClass(block.textAlign)}`} style={{ color: block.textColor ?? mergedTheme.textColor ?? "#475569" }}>{entry.caption}</p> : null}
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          if (block.type === "columnGroup") {
            const columns = block.columnGroupItems ?? [];
            const columnsClass = columns.length >= 3 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2";
            return (
              <div key={block.id} style={getBlockContainerStyle(block, mergedTheme)}>
                <div className={`grid gap-2 ${columnsClass}`}>
                  {columns.map((entry) => (
                    <div key={entry.id} className={`${getCardRadiusClass(block.cardRadius)} border border-slate-200 bg-slate-50/70 p-3`}>
                      <p className={`mb-1 ${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)} ${getBlockAlignClass(block.textAlign)}`} style={{ color: block.textColor ?? mergedTheme.textColor ?? "#0f172a" }}>{entry.title || "見出し"}</p>
                      <p className={`whitespace-pre-wrap ${getWeightClass(block.textWeight)} ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)} ${getBlockAlignClass(block.textAlign)}`} style={{ color: block.textColor ?? mergedTheme.textColor ?? "#0f172a" }}>{entry.body || "本文"}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          if (block.type === "divider") {
            return (
              <div key={block.id} style={getBlockContainerStyle(block, mergedTheme)}>
                <div className="border-t" style={getDividerThicknessStyle(block.dividerThickness, block.dividerColor)} />
              </div>
            );
          }
          if (block.type === "space") {
            return (
              <div key={block.id} style={getBlockContainerStyle(block, mergedTheme)}>
                <div className={getSpaceHeightClass(block.spacing)} />
              </div>
            );
          }
          return null;
        })}
      </div>
      <p className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500">ご不明な点はスタッフまでお声がけください。</p>
    </article>
  );
}
