/** Build share payloads for published page modals. */
export function buildPublishShareMessage(pageTitle: string, publicUrl: string): string {
  const title = pageTitle.trim() || "Infomii";
  return `${title}のしおり\n${publicUrl}`;
}

export function buildLineShareUrl(message: string): string {
  return `https://line.me/R/msg/text/?${encodeURIComponent(message)}`;
}

export function buildXShareUrl(pageTitle: string, publicUrl: string): string {
  const text = `${pageTitle.trim() || "Infomii"}のしおり`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(publicUrl)}`;
}

export function buildMailShareUrl(pageTitle: string, message: string): string {
  const subject = pageTitle.trim() || "Infomii";
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}
