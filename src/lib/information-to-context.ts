import type { InformationBlock } from "@/types/information";

/**
 * Serialize page title, body, and content_blocks to plain text for AI context.
 * Used by the info-page chat assistant to answer questions based on page content.
 */
export function blocksToContextText(
  title: string,
  body: string,
  blocks: InformationBlock[]
): string {
  const parts: string[] = [];

  if (title.trim()) {
    parts.push(`【タイトル】\n${title.trim()}`);
  }
  if (body.trim()) {
    parts.push(`【本文】\n${body.trim()}`);
  }

  for (const block of blocks) {
    switch (block.type) {
      case "title":
      case "heading":
      case "paragraph":
        if (block.text?.trim()) parts.push(block.text.trim());
        break;
      case "section":
        if (block.sectionTitle?.trim()) parts.push(block.sectionTitle.trim());
        if (block.sectionBody?.trim()) parts.push(block.sectionBody.trim());
        break;
      case "columns":
        if (block.leftTitle?.trim()) parts.push(block.leftTitle.trim());
        if (block.leftText?.trim()) parts.push(block.leftText.trim());
        if (block.rightTitle?.trim()) parts.push(block.rightTitle.trim());
        if (block.rightText?.trim()) parts.push(block.rightText.trim());
        break;
      case "icon":
      case "iconRow":
        if (block.label?.trim()) parts.push(block.label.trim());
        if (block.description?.trim()) parts.push(block.description.trim());
        if (Array.isArray(block.iconItems)) {
          for (const item of block.iconItems) {
            if (item.label?.trim()) parts.push(item.label.trim());
          }
        }
        break;
      case "cta":
        if (block.ctaLabel?.trim()) parts.push(block.ctaLabel.trim());
        break;
      case "hours":
        if (Array.isArray(block.hoursItems)) {
          for (const item of block.hoursItems) {
            if (item.label || item.value) parts.push(`${item.label ?? ""}: ${item.value ?? ""}`.trim());
          }
        }
        break;
      case "pricing":
        if (Array.isArray(block.pricingItems)) {
          for (const item of block.pricingItems) {
            if (item.label || item.value) parts.push(`${item.label ?? ""}: ${item.value ?? ""}`.trim());
          }
        }
        break;
      case "quote":
        if (block.text?.trim()) parts.push(block.text.trim());
        if (block.quoteAuthor?.trim()) parts.push(`— ${block.quoteAuthor.trim()}`);
        break;
      case "checklist":
        if (Array.isArray(block.checklistItems)) {
          for (const item of block.checklistItems) {
            if (item.text?.trim()) parts.push(`・${item.text.trim()}`);
          }
        }
        break;
      case "columnGroup":
        if (Array.isArray(block.columnGroupItems)) {
          for (const item of block.columnGroupItems) {
            if (item.title?.trim()) parts.push(item.title.trim());
            if (item.body?.trim()) parts.push(item.body.trim());
          }
        }
        break;
      default:
        break;
    }
  }

  const text = parts.filter(Boolean).join("\n\n");
  return text.slice(0, 12000);
}
