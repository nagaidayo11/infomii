/**
 * Parse user-pasted video URLs into safe embed targets (YouTube, Vimeo) or direct file URLs.
 * Unknown hosts are rejected to avoid arbitrary iframe src.
 */

export type VideoEmbedResult =
  | { kind: "youtube"; embedUrl: string }
  | { kind: "vimeo"; embedUrl: string }
  | { kind: "file"; src: string };

function extractYoutubeId(input: string): string | null {
  const s = input.trim();
  const embedInString = s.match(/youtube\.com\/embed\/([^/?&]+)/i);
  if (embedInString?.[1]) return embedInString[1];

  try {
    const u = new URL(s, "https://www.youtube.com");
    const host = u.hostname.replace(/^www\./i, "").toLowerCase();

    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.split("/")[2];
        return id || null;
      }
      if (u.pathname === "/watch" || u.pathname.startsWith("/watch/")) {
        const v = u.searchParams.get("v");
        if (v) return v;
      }
      if (u.pathname.startsWith("/embed/")) {
        const id = u.pathname.split("/")[2];
        return id || null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function extractVimeoId(input: string): string | null {
  const s = input.trim();
  const embed = s.match(/player\.vimeo\.com\/video\/(\d+)/i);
  if (embed?.[1]) return embed[1];

  try {
    const u = new URL(s, "https://vimeo.com");
    const host = u.hostname.replace(/^www\./i, "").toLowerCase();
    if (!host.includes("vimeo.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && /^\d+$/.test(last)) return last;
  } catch {
    return null;
  }

  return null;
}

export function parseVideoEmbed(raw: string): VideoEmbedResult | null {
  const s = raw.trim();
  if (!s) return null;

  const yt = extractYoutubeId(s);
  if (yt && /^[a-zA-Z0-9_-]+$/.test(yt) && yt.length >= 6) {
    const embedUrl = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(yt)}`;
    return { kind: "youtube", embedUrl };
  }

  const vm = extractVimeoId(s);
  if (vm) {
    return { kind: "vimeo", embedUrl: `https://player.vimeo.com/video/${vm}` };
  }

  try {
    const u = new URL(s);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    const path = u.pathname.toLowerCase();
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(path)) {
      return { kind: "file", src: u.toString() };
    }
  } catch {
    return null;
  }

  return null;
}
