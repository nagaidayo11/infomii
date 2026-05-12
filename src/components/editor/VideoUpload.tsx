"use client";

import { useCallback, useRef, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { useEditor2Store } from "./store";
import { nanoid } from "nanoid";

const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_SIZE_MB = 80;

function getExt(mime: string): string {
  if (mime === "video/webm") return "webm";
  if (mime === "video/quicktime") return "mov";
  return "mp4";
}

/** Browsers often leave `File.type` empty; Supabase validates declared Content-Type against the bucket list. */
function resolveVideoMime(file: File): string {
  if (ALLOWED_TYPES.includes(file.type)) return file.type;
  const m = file.name.toLowerCase().match(/\.([a-z0-9]+)$/);
  const ext = m?.[1];
  if (ext === "webm") return "video/webm";
  if (ext === "mov") return "video/quicktime";
  if (ext === "mp4") return "video/mp4";
  return file.type;
}

export function VideoUpload({
  onUploaded,
  disabled,
  className = "",
}: {
  onUploaded: (url: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const pageId = useEditor2Store((s) => s.pageMeta.pageId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      const mime = resolveVideoMime(file);
      if (!ALLOWED_TYPES.includes(mime)) {
        setError("MP4 / WebM / MOV（.mov）のみ対応しています");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`最大 ${MAX_SIZE_MB}MB まで`);
        return;
      }
      const supabase = getBrowserSupabaseClient();
      if (!supabase) {
        setError("Supabase が設定されていません");
        return;
      }
      const pid = pageId ?? "temp";
      const ext = getExt(mime);
      const path = `${pid}/video-${nanoid(12)}.${ext}`;

      setUploading(true);
      setError(null);
      try {
        const { error: uploadError } = await supabase.storage.from("page-assets").upload(path, file, {
          upsert: true,
          contentType: mime,
        });

        if (uploadError) {
          const msg =
            uploadError.message === "Bucket not found"
              ? "ストレージ（page-assets）が未設定です。Supabase の Storage を確認してください。"
              : uploadError.message;
          setError(msg);
          return;
        }

        const { data } = supabase.storage.from("page-assets").getPublicUrl(path);
        onUploaded(data.publicUrl);
      } finally {
        setUploading(false);
      }
    },
    [pageId, onUploaded]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  return (
    <div
      className={
        "flex flex-col items-center justify-center rounded-xl bg-slate-50/50 p-4 transition-colors " +
        (disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-slate-100/50") +
        " " +
        className
      }
      onDrop={onDrop}
      onDragOver={onDragOver}
      onClick={() => !disabled && !uploading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
        className="hidden"
        onChange={onInputChange}
        disabled={disabled || uploading}
      />
      {uploading ? (
        <span className="text-sm text-slate-500">アップロード中…</span>
      ) : (
        <>
          <span className="text-sm font-medium text-slate-600">クリックまたはドロップで動画をアップロード</span>
          <span className="mt-1 text-xs text-slate-400">MP4 / WebM / MOV（最大{MAX_SIZE_MB}MB）</span>
        </>
      )}
      {error ? <span className="mt-2 block text-center text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
