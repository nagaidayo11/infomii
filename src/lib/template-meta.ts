import type { TemplateRow } from "@/lib/storage";

export type TemplateDifficulty = "初級" | "中級" | "上級";

export type TemplateMeta = {
  difficulty: TemplateDifficulty;
  audienceTags: string[];
};

export const TEMPLATE_AUDIENCE_TAGS = [
  "出張",
  "家族",
  "海外",
  "レジャー",
  "観光",
  "和旅館",
  "長期滞在",
] as const;

/**
 * Manual override table for template badges.
 * Key is template name shown in templates list.
 */
export const TEMPLATE_META_OVERRIDES: Record<string, TemplateMeta> = {
  "ビジネスホテル・即運用セット": { difficulty: "初級", audienceTags: ["出張"] },
  "駅前特化ビジホ・時短導線セット": { difficulty: "中級", audienceTags: ["出張"] },
  "インバウンド特化・多言語おもてなしセット": { difficulty: "上級", audienceTags: ["海外"] },
  "旅館・おもてなし案内セット": { difficulty: "中級", audienceTags: ["和旅館"] },
  "ファミリー向け・館内回遊セット": { difficulty: "中級", audienceTags: ["家族", "レジャー"] },
};

function deriveTemplateMeta(template: TemplateRow): TemplateMeta {
  const name = template.name ?? "";
  const category = template.category ?? "";
  const lower = `${name} ${template.description ?? ""}`.toLowerCase();

  const audienceTags: string[] = [];
  if (category === "business" || /ビジホ|出張|business/i.test(name)) audienceTags.push("出張");
  if (category === "airbnb" || /airbnb|民泊|ワーケーション/i.test(name)) audienceTags.push("長期滞在");
  if (category === "inbound" || /インバウンド|international|海外/i.test(lower)) audienceTags.push("海外");
  if (/ファミリー|家族|キッズ/.test(name)) audienceTags.push("家族");
  if (category === "resort" || /リゾート|スパ|ウェルネス/.test(name)) audienceTags.push("レジャー");
  if (category === "guide" || /観光|ガイド|回遊/.test(name)) audienceTags.push("観光");
  if (category === "ryokan" || /旅館|温泉/.test(name)) audienceTags.push("和旅館");

  const cardsCount = Array.isArray(template.cards) ? template.cards.length : 0;
  let difficulty: TemplateDifficulty = "中級";
  if (cardsCount <= 6) difficulty = "初級";
  if (cardsCount >= 7) difficulty = "上級";

  return {
    difficulty,
    audienceTags: Array.from(new Set(audienceTags)).slice(0, 3),
  };
}

export function resolveTemplateMeta(
  template: TemplateRow,
  runtimeOverrides?: Record<string, TemplateMeta>
): TemplateMeta {
  const manual = runtimeOverrides?.[template.name] ?? TEMPLATE_META_OVERRIDES[template.name];
  if (manual) return manual;
  return deriveTemplateMeta(template);
}

