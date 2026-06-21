"use client";

import { useCallback, useRef, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { prepareImageForUpload } from "@/lib/prepare-image-upload";
import { useEditor2Store } from "./store";
import { nanoid } from "nanoid";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function ImageUpload({
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
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("JPEG、PNG、WebP、GIF のみ対応しています");
        return;
      }
      const supabase = getBrowserSupabaseClient();
      if (!supabase) {
        setError("Supabase が設定されていません");
        return;
      }
      const pid = pageId ?? "temp";

      setUploading(true);
      setError(null);
      try {
        const prepared = await prepareImageForUpload(file);
        const path = `${pid}/${nanoid(12)}.${prepared.ext}`;

        const { error: uploadError } = await supabase.storage
          .from("page-assets")
          .upload(path, prepared.blob, {
            upsert: true,
            contentType: prepared.mime,
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "アップロードに失敗しました");
      } finally {
        setUploading(false);
      }
    },
    [pageId, onUploaded],
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
        (disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-slate-100/50") +
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
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={onInputChange}
        disabled={disabled || uploading}
      />
      {uploading ? (
        <span className="text-sm text-slate-500">軽量化してアップロード中…</span>
      ) : (
        <>
          <span className="text-sm font-medium text-slate-600">クリックまたはドロップでアップロード</span>
          <span className="mt-1 text-xs text-slate-400">
            JPEG / PNG / WebP / GIF（最大20MB・自動で軽量化）
          </span>
        </>
      )}
      {error && <span className="mt-2 block text-xs text-red-600">{error}</span>}
    </div>
  );
}
