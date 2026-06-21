"use client";

import { EditorCoverImage } from "@/components/editor/EditorCoverImage";
import { imageFramingClassName, imageFramingStyle, readImageFraming } from "@/lib/image-framing";

type ImageFramingControlProps = {
  imageUrl: string;
  content: Record<string, unknown>;
  onUpdate: (key: string, value: number) => void;
  /** Tailwind aspect ratio class on preview frame */
  previewAspectClass?: string;
};

const PRESETS: Array<{ label: string; focusX: number; focusY: number }> = [
  { label: "中央", focusX: 50, focusY: 50 },
  { label: "上", focusX: 50, focusY: 20 },
  { label: "下", focusX: 50, focusY: 80 },
  { label: "左", focusX: 20, focusY: 50 },
  { label: "右", focusX: 80, focusY: 50 },
];

export function ImageFramingControl({
  imageUrl,
  content,
  onUpdate,
  previewAspectClass = "aspect-video",
}: ImageFramingControlProps) {
  const framing = readImageFraming(content);
  const style = imageFramingStyle(framing);
  const className = imageFramingClassName(framing);

  return (
    <div className="space-y-3">
      <div className={`relative w-full overflow-hidden rounded-lg bg-slate-100 ${previewAspectClass}`}>
        <EditorCoverImage src={imageUrl} alt="" sizes="280px" className={className} style={style} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              onUpdate("focusX", preset.focusX);
              onUpdate("focusY", preset.focusY);
            }}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <label className="block space-y-1">
        <span className="text-[11px] font-medium text-slate-600">水平位置</span>
        <input
          type="range"
          min={0}
          max={100}
          value={framing.focusX}
          onChange={(e) => onUpdate("focusX", Number(e.target.value))}
          className="w-full"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-[11px] font-medium text-slate-600">垂直位置</span>
        <input
          type="range"
          min={0}
          max={100}
          value={framing.focusY}
          onChange={(e) => onUpdate("focusY", Number(e.target.value))}
          className="w-full"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-[11px] font-medium text-slate-600">ズーム（{framing.zoom}%）</span>
        <input
          type="range"
          min={100}
          max={200}
          step={5}
          value={framing.zoom}
          onChange={(e) => onUpdate("zoom", Number(e.target.value))}
          className="w-full"
        />
      </label>
    </div>
  );
}
