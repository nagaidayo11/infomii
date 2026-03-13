export {
  MULTI_PAGE_TEMPLATES,
  getMultiPageTemplate,
  getMultiPageTemplateIds,
} from "./data";
export { templatePageToInformationBlocks } from "./convert";
export type {
  MultiPageTemplate,
  MultiPageTemplateId,
  TemplatePage,
  TemplateBlock,
  TemplateBlockType,
} from "./types";

import { MULTI_PAGE_TEMPLATES } from "./data";
import type { MultiPageTemplate } from "./types";

/** Templates as JSON string (for storage/import). */
export function getTemplatesAsJson(): string {
  return JSON.stringify(MULTI_PAGE_TEMPLATES, null, 2);
}

/**
 * Load templates from JSON string (e.g. from API or file).
 * Returns parsed templates; validate id/name/pages before use.
 */
export function loadTemplatesFromJson(json: string): MultiPageTemplate[] {
  const raw = JSON.parse(json) as unknown;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (t): t is MultiPageTemplate =>
      t != null &&
      typeof t === "object" &&
      typeof (t as MultiPageTemplate).id === "string" &&
      typeof (t as MultiPageTemplate).name === "string" &&
      Array.isArray((t as MultiPageTemplate).pages)
  );
}
