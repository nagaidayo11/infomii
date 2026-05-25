/** Web カード content の文字列フィールド読み書き（多言語オブジェクトは ja を優先） */

export function fieldStr(content: Record<string, unknown>, key: string): string {
  const v = content[key];
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const o = v as Record<string, unknown>;
    if (typeof o.ja === "string") return o.ja;
    const first = Object.values(o).find((x) => typeof x === "string" && x.trim());
    return typeof first === "string" ? first : "";
  }
  return "";
}

export function patchField(
  content: Record<string, unknown>,
  key: string,
  value: string,
): Record<string, unknown> {
  const prev = content[key];
  if (prev && typeof prev === "object" && !Array.isArray(prev) && "ja" in (prev as object)) {
    return { ...content, [key]: { ...(prev as Record<string, unknown>), ja: value } };
  }
  return { ...content, [key]: value };
}

export function patchBool(
  content: Record<string, unknown>,
  key: string,
  value: boolean,
): Record<string, unknown> {
  return { ...content, [key]: value };
}

export function patchNumber(
  content: Record<string, unknown>,
  key: string,
  value: number,
): Record<string, unknown> {
  return { ...content, [key]: value };
}

export function asObjectArray(raw: unknown): Record<string, unknown>[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((e): e is Record<string, unknown> => Boolean(e) && typeof e === "object");
}
