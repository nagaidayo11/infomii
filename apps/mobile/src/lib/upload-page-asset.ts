import { getSupabaseClient } from "@/lib/supabase";

const MAX_SIZE_MB = 5;
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function extFromUri(uri: string): string {
  const path = uri.split("?")[0] ?? uri;
  const ext = path.split(".").pop()?.toLowerCase() ?? "jpg";
  return ALLOWED_EXT.has(ext) ? ext : "jpg";
}

function mimeFromExt(ext: string): string {
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return "image/jpeg";
}

/** リモート URL はそのまま返す。file:// は Supabase page-assets へアップロード。 */
export async function uploadPageAsset(
  localOrRemoteUri: string,
  pathPrefix: string,
): Promise<{ url: string | null; error: string | null }> {
  if (!localOrRemoteUri) return { url: null, error: "画像がありません" };
  if (localOrRemoteUri.startsWith("http://") || localOrRemoteUri.startsWith("https://")) {
    return { url: localOrRemoteUri, error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { url: localOrRemoteUri, error: null };
  }

  try {
    const response = await fetch(localOrRemoteUri);
    const blob = await response.blob();
    if (blob.size > MAX_SIZE_MB * 1024 * 1024) {
      return { url: null, error: `最大 ${MAX_SIZE_MB}MB まで` };
    }

    const ext = extFromUri(localOrRemoteUri);
    const path = `${pathPrefix}/${Date.now()}-${randomId()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("page-assets")
      .upload(path, blob, { upsert: true, contentType: mimeFromExt(ext) });

    if (uploadError) {
      const msg =
        uploadError.message === "Bucket not found"
          ? "ストレージ（page-assets）が未設定です"
          : uploadError.message;
      return { url: null, error: msg };
    }

    const { data } = supabase.storage.from("page-assets").getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  } catch (e) {
    return { url: null, error: e instanceof Error ? e.message : "アップロードに失敗しました" };
  }
}

/** 下書き保存・公開前に file:// URI をリモート URL へ置換 */
export async function resolveDraftImageUrls(
  blocks: import("@/types/itinerary").DraftBlock[],
  pathPrefix: string,
): Promise<{ blocks: import("@/types/itinerary").DraftBlock[]; errors: string[] }> {
  const errors: string[] = [];
  const next = await Promise.all(
    blocks.map(async (block) => {
      const copy = { ...block };
      if (copy.imageUrl && !copy.imageUrl.startsWith("http")) {
        const { url, error } = await uploadPageAsset(copy.imageUrl, pathPrefix);
        if (url) copy.imageUrl = url;
        else if (error) errors.push(error);
      }
      if (copy.galleryItems?.length) {
        copy.galleryItems = await Promise.all(
          copy.galleryItems.map(async (item) => {
            if (!item.url || item.url.startsWith("http")) return item;
            const { url, error } = await uploadPageAsset(item.url, pathPrefix);
            if (error) errors.push(error);
            return { ...item, url: url ?? item.url };
          }),
        );
      }
      return copy;
    }),
  );
  return { blocks: next, errors };
}

async function resolveUri(uri: string, pathPrefix: string, errors: string[]): Promise<string> {
  if (!uri || uri.startsWith("http")) return uri;
  const { url, error } = await uploadPageAsset(uri, pathPrefix);
  if (error) errors.push(error);
  return url ?? uri;
}

/** カード content 内の image / src をアップロード */
export async function resolveCardImageUrls(
  cards: import("@/types/editor-card").EditorCard[],
  pathPrefix: string,
): Promise<{ cards: import("@/types/editor-card").EditorCard[]; errors: string[] }> {
  const errors: string[] = [];
  const next = await Promise.all(
    cards.map(async (card) => {
      const content = { ...card.content };
      if (typeof content.image === "string") {
        content.image = await resolveUri(content.image, pathPrefix, errors);
      }
      if (typeof content.src === "string") {
        content.src = await resolveUri(content.src, pathPrefix, errors);
      }
      if (Array.isArray(content.items)) {
        content.items = await Promise.all(
          content.items.map(async (entry) => {
            if (!entry || typeof entry !== "object") return entry;
            const row = { ...(entry as Record<string, unknown>) };
            if (typeof row.src === "string") {
              row.src = await resolveUri(row.src, pathPrefix, errors);
            }
            if (typeof row.imageSrc === "string") {
              row.imageSrc = await resolveUri(row.imageSrc, pathPrefix, errors);
            }
            return row;
          }),
        );
      }
      if (Array.isArray(content.slides)) {
        content.slides = await Promise.all(
          content.slides.map(async (entry) => {
            if (!entry || typeof entry !== "object") return entry;
            const row = { ...(entry as Record<string, unknown>) };
            if (typeof row.src === "string") {
              row.src = await resolveUri(row.src, pathPrefix, errors);
            }
            return row;
          }),
        );
      }
      return { ...card, content };
    }),
  );
  return { cards: next, errors };
}
