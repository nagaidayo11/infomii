"use client";

import { useCallback, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { useEditor2Store } from "./store";
import { nanoid } from "nanoid";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 5;

function getExt(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("JPEG、PNG、WebP、GIF のみ対応しています");
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
      const ext = getExt(file.type);
      const path = `${pid}/${nanoid(12)}.${ext}`;

      setUploading(true);
      setError(null);
      try {
        const { error: uploadError } = await supabase.storage
          .from("page-assets")
          .upload(path, file, { upsert: true });

        if (uploadError) {
          setError(uploadError.message);
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
        (disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-slate-100/50") +
        " " +
        className
      }
      onDrop={onDrop}
      onDragOver={onDragOver}
      onClick={() => !disabled && !uploading && document.getElementById("image-upload-input")?.click()}
    >
      <input
        id="image-upload-input"
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={onInputChange}
        disabled={disabled || uploading}
      />
      {uploading ? (
        <span className="text-sm text-slate-500">アップロード中…</span>
      ) : (
        <>
          <span className="text-sm font-medium text-slate-600">クリックまたはドロップでアップロード</span>
          <span className="mt-1 text-xs text-slate-400">JPEG, PNG, WebP, GIF（最大{MAX_SIZE_MB}MB）</span>
        </>
      )}
      {error && <span className="mt-2 text-xs text-red-600">{error}</span>}
    </div>
  );
}
