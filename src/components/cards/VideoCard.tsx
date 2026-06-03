"use client";

import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getBodyFontSizeStyle, getTitleFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useCardInlineEdit } from "./card-inline-edit";
import { VideoUpload } from "@/components/editor/VideoUpload";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";
import { parseVideoEmbed } from "@/lib/video-embed";

type VideoCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function VideoCard({ card, isSelected = false, locale = "ja" }: VideoCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const videoUrl = typeof c?.videoUrl === "string" ? c.videoUrl.trim() : "";
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const caption = getLocalizedContent(c?.caption as LocalizedString | undefined, locale);

  const labels =
    locale === "ko"
      ? {
          titlePh: "동영상",
          capPh: "캡션(선택)",
          empty: "파일을 업로드하거나 설정에서 URL을 입력하세요.",
          badUrl: "지원하는 동영상 URL이 아닙니다.",
        }
      : locale === "zh"
        ? {
            titlePh: "视频",
            capPh: "说明（可选）",
            empty: "请上传文件或在设置中填写链接。",
            badUrl: "无法识别的视频链接。",
          }
        : locale === "en"
          ? {
              titlePh: "Video",
              capPh: "Caption (optional)",
              empty: "Upload a file or add a URL in settings.",
              badUrl: "This video URL is not supported.",
            }
          : {
              titlePh: "動画",
              capPh: "キャプション（任意）",
              empty: "動画ファイルをアップロードするか、右の設定からURLを入力してください。",
              badUrl: "対応していない動画URLです。",
            };

  const parsed = videoUrl ? parseVideoEmbed(videoUrl) : null;

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  const setVideoUrl = (url: string) => updateCard(card.id, { content: { ...c, videoUrl: url } });

  const iframePointerClass = isSelected ? "pointer-events-none" : "pointer-events-auto";

  return (
    <Card padding="md">
      {(title || isSelected) && (
        <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
          <InlineEditable
            value={title}
            onSave={(v) => updateKey("title", v)}
            editable={editable}
            onActivate={onActivate}
            className={CARD_BLOCK_TITLE_CLASS}
            placeholder={labels.titlePh}
          />
        </p>
      )}

      <div
        className={`relative mt-3 aspect-video w-full overflow-hidden bg-slate-100 ${editorInnerRadiusClassName}`}
        data-inner-surface
      >
        {parsed?.kind === "youtube" || parsed?.kind === "vimeo" ? (
          <iframe
            title={title || labels.titlePh}
            src={parsed.embedUrl}
            className={`absolute inset-0 h-full w-full border-0 ${iframePointerClass}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : parsed?.kind === "file" ? (
          <video
            className={`absolute inset-0 h-full w-full object-cover ${iframePointerClass}`}
            controls
            playsInline
            preload="metadata"
            src={parsed.src}
          />
        ) : videoUrl ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">{labels.badUrl}</div>
        ) : isSelected ? (
          <VideoUpload onUploaded={setVideoUrl} className="h-full min-h-[140px] rounded-none border-0 bg-transparent" />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">{labels.empty}</div>
        )}
      </div>

      {(caption || isSelected) && (
        <p className="mt-2 text-xs text-slate-500" style={getBodyFontSizeStyle()}>
          <InlineEditable
            value={caption}
            onSave={(v) => updateKey("caption", v)}
            editable={editable}
            onActivate={onActivate}
            className="text-xs text-slate-500"
            placeholder={labels.capPh}
          />
        </p>
      )}
    </Card>
  );
}
