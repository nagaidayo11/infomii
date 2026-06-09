import { buildAppPublishShareMessage } from "@/lib/app-branding";

/** Build share payloads for published page modals. */
export function buildPublishShareMessage(
  pageTitle: string,
  publicUrl: string,
  options?: { shell?: "web" | "app" },
): string {
  if (options?.shell === "app") {
    return buildAppPublishShareMessage(pageTitle, publicUrl);
  }
  const title = pageTitle.trim() || "Infomii";
  return `${title}のしおり\n${publicUrl}`;
}

export function buildLineShareUrl(message: string): string {
  return `https://line.me/R/msg/text/?${encodeURIComponent(message)}`;
}

export function buildXShareUrl(
  pageTitle: string,
  publicUrl: string,
  options?: { shell?: "web" | "app" },
): string {
  const message = buildPublishShareMessage(pageTitle, publicUrl, options);
  const text = message.split("\n")[0] ?? (pageTitle.trim() || "Infomii");
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(publicUrl)}`;
}

export function buildMailShareUrl(pageTitle: string, message: string): string {
  const subject = pageTitle.trim() || "Infomii";
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}
