import Image from "next/image";
import type { InformationBlock, InformationTheme } from "@/types/information";
import { renderInformationIconVisual } from "@/components/information/InformationIconVisual";

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

function getIconRowColumnsClass(iconCount: number): string {
  if (iconCount >= 10) return "grid-cols-3";
  if (iconCount >= 3) return "grid-cols-3";
  return "grid-cols-2";
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
                    {renderInformationIconVisual(block.icon, block.iconSize)}
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
                            {renderInformationIconVisual(entry.icon, block.iconSize)}
                          </span>
                          <p className={`text-center ${getWeightClass(block.textWeight ?? "medium")} ${getBlockTextSizeClass(block.textSize, mergedTheme.bodySize)}`} style={{ color: block.textColor ?? mergedTheme.textColor ?? "#0f172a" }}>
                            {entry.label || "項目"}
                          </p>
                        </div>
                      ) : (
                        <div key={entry.id} className={`${iconItemRadiusClass} border border-slate-200 text-center shadow-sm`} style={{ backgroundColor: entry.backgroundColor ?? "#ffffff" }}>
                          <div className="flex w-full flex-col items-center justify-center gap-1 px-2 py-2.5 min-h-[76px]">
                            {renderInformationIconVisual(entry.icon, block.iconSize)}
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
