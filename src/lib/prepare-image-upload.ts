const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const MAX_EDGE_PX = 1920;
const WEBP_QUALITY = 0.82;

export type PreparedImageUpload = {
  blob: Blob;
  mime: string;
  ext: string;
};

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("画像の読み込みに失敗しました"));
    };
    img.src = url;
  });
}

/**
 * Resize and compress raster images before Supabase upload.
 * GIF is kept as-is (animation). WebP output for JPEG/PNG/WebP sources.
 */
export async function prepareImageForUpload(file: File): Promise<PreparedImageUpload> {
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("元画像は最大 20MB までです（アップロード前に自動で軽量化します）");
  }

  if (file.type === "image/gif") {
    return { blob: file, mime: file.type, ext: "gif" };
  }

  const img = await loadImageElement(file);
  const longest = Math.max(img.naturalWidth, img.naturalHeight);
  const scale = longest > MAX_EDGE_PX ? MAX_EDGE_PX / longest : 1;
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("画像の処理に失敗しました");
  }
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("画像の圧縮に失敗しました"));
      },
      "image/webp",
      WEBP_QUALITY,
    );
  });

  return { blob, mime: "image/webp", ext: "webp" };
}
