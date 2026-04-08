import type { TemplateRow } from "@/lib/storage";

export type TemplateDifficulty = "初級" | "中級" | "上級";

export type TemplateMeta = {
  difficulty: TemplateDifficulty;
  audienceTags: string[];
  industry: string;
  useCase: string;
  tone: string;
  mustIncludeElements: string[];
  forbiddenElements: string[];
  imagePromptSeed: string;
  recommendedPlan: "free" | "pro" | "business";
  consistencyScore: number;
  needsReview: boolean;
  consistencyReason: string;
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
  "ビジネスホテル・即運用セット": {
    difficulty: "初級",
    audienceTags: ["出張"],
    industry: "ホテル",
    useCase: "チェックイン導線",
    tone: "実用",
    mustIncludeElements: ["フロント", "Wi-Fi"],
    forbiddenElements: ["海辺", "温泉露天"],
    imagePromptSeed: "city hotel lobby, clean signage, practical information board",
    recommendedPlan: "pro",
    consistencyScore: 85,
    needsReview: false,
    consistencyReason: "手動設定",
  },
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
  const keywordSource = `${name} ${template.description ?? ""} ${template.preview_image ?? ""}`.toLowerCase();
  const inferredIndustry =
    /旅館|温泉|和/.test(name) ? "旅館" : /リゾート|resort/.test(keywordSource) ? "リゾートホテル" : /airbnb|民泊/.test(keywordSource) ? "民泊" : "ホテル";
  const useCase = /チェックイン|導線/.test(keywordSource) ? "チェックイン導線" : /観光|周辺/.test(keywordSource) ? "周辺案内" : "館内案内";
  const tone = /高級|premium|luxury/.test(keywordSource) ? "高級" : "実用";
  const mustIncludeElements = useCase === "チェックイン導線" ? ["チェックイン", "チェックアウト"] : ["施設情報", "連絡先"];
  const forbiddenElements = inferredIndustry === "旅館" ? ["高層ビル群"] : ["和室布団"];
  const imagePromptSeed = `${inferredIndustry} ${useCase} ${tone} signage`;
  const titleTokens = name.replace(/[【】・\[\]（）()]/g, " ").split(/\s+/).filter(Boolean);
  const matched = titleTokens.filter((t) => keywordSource.includes(t.toLowerCase())).length;
  const mustMisses = mustIncludeElements.filter((k) => !keywordSource.includes(k.toLowerCase()));
  const forbiddenHits = forbiddenElements.filter((k) => keywordSource.includes(k.toLowerCase()));
  const baseScore = Math.round((matched / Math.max(1, titleTokens.length)) * 100);
  const consistencyScore = Math.max(0, Math.min(100, baseScore - mustMisses.length * 10 - forbiddenHits.length * 20));
  const needsReview = consistencyScore < 60;
  const consistencyReason =
    forbiddenHits.length > 0
      ? `禁止要素混入: ${forbiddenHits.join(" / ")}`
      : mustMisses.length > 0
        ? `必須要素不足: ${mustMisses.join(" / ")}`
        : "タイトルと画像の整合は概ね良好";
  const recommendedPlan: "free" | "pro" | "business" =
    cardsCount >= 8 || /多言語|team|運用|統制/.test(keywordSource) ? "business" : cardsCount >= 5 ? "pro" : "free";

  return {
    difficulty,
    audienceTags: Array.from(new Set(audienceTags)).slice(0, 3),
    industry: inferredIndustry,
    useCase,
    tone,
    mustIncludeElements,
    forbiddenElements,
    imagePromptSeed,
    recommendedPlan,
    consistencyScore,
    needsReview,
    consistencyReason,
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

