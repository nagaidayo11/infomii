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

function isImageUrl(s: string): boolean {
  const t = s.trim().toLowerCase();
  return (t.startsWith("http://") || t.startsWith("https://")) && t.length > 10;
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
  const [urlInput, setUrlInput] = useState("");

  const applyUrl = useCallback(() => {
    const raw = urlInput.trim();
    if (!raw) return;
    if (!isImageUrl(raw)) {
      setError("有効な画像URLを入力してください（http:// または https://）");
      return;
    }
    setError(null);
    setUrlInput("");
    onUploaded(raw);
  }, [urlInput, onUploaded]);

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
          const msg =
            uploadError.message === "Bucket not found"
              ? "ストレージが未設定です。下の「画像URLを入力」が使えます。"
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
      {error && <span className="mt-2 block text-xs text-red-600">{error}</span>}
      <div className="mt-3 w-full border-t border-slate-200 pt-3" onClick={(e) => e.stopPropagation()}>
        <label className="block text-xs font-medium text-slate-500">または画像URLを入力</label>
        <div className="mt-1 flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyUrl())}
            placeholder="https://..."
            disabled={disabled}
            className="min-w-0 flex-1 rounded border border-slate-200 bg-white px-2 py-1.5 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={applyUrl}
            disabled={disabled || !urlInput.trim()}
            className="shrink-0 rounded bg-slate-200 px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-300 disabled:opacity-50"
          >
            反映
          </button>
        </div>
      </div>
    </div>
  );
}
