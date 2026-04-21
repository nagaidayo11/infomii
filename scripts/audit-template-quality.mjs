#!/usr/bin/env node
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const ROUTE_PATH = path.join(ROOT, "src/app/api/seed-templates/route.ts");
const JSON_OUT = path.join(ROOT, "docs/template-quality-report.json");
const MD_OUT = path.join(ROOT, "docs/template-quality-report.md");

const ORDER_GUIDE = {
  business: ["hero", "kpi", "wifi", "schedule", "restaurant", "laundry", "checkout", "faq", "taxi", "nearby", "emergency"],
  resort: ["hero", "gallery", "spa", "menu", "schedule", "nearby", "map", "pageLinks", "quote", "faq", "checkout", "emergency"],
  ryokan: ["hero", "welcome", "notice", "spa", "restaurant", "menu", "steps", "schedule", "nearby", "map", "checkout", "faq", "emergency"],
  airbnb: ["hero", "steps", "checklist", "wifi", "nearby", "map", "checkout", "emergency", "faq", "notice"],
  guide: ["hero", "nearby", "map", "pageLinks", "taxi", "schedule", "checkout", "notice", "faq", "quote", "emergency"],
  inbound: ["hero", "welcome", "notice", "pageLinks", "map", "wifi", "menu", "steps", "checkout", "emergency", "faq", "taxi"],
  default: ["hero", "steps", "wifi", "schedule", "checkout", "nearby", "map", "faq", "emergency"],
};

const REQUIRED_BY_CATEGORY = {
  business: ["hero", "steps", "wifi", "restaurant", "checkout", "emergency", "faq"],
  resort: ["hero", "gallery", "wifi", "menu", "checkout", "emergency", "steps", "notice"],
  ryokan: ["hero", "welcome", "wifi", "restaurant", "checkout", "emergency", "steps"],
  airbnb: ["hero", "steps", "wifi", "menu", "checklist", "checkout", "emergency", "notice"],
  guide: ["hero", "map", "wifi", "menu", "checkout", "emergency", "nearby", "faq"],
  inbound: ["hero", "notice", "wifi", "menu", "checkout", "emergency", "pageLinks", "faq"],
  default: ["hero", "steps", "wifi", "menu", "checkout", "emergency", "faq"],
};

function extractSeedTemplatesArray(text) {
  const marker = "const SEED_TEMPLATES";
  const start = text.indexOf(marker);
  if (start < 0) throw new Error("SEED_TEMPLATES not found");
  const eq = text.indexOf("=", start);
  if (eq < 0) throw new Error("SEED_TEMPLATES assignment not found");
  const bracketStart = text.indexOf("[", eq);
  if (bracketStart < 0) throw new Error("SEED_TEMPLATES array start not found");

  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let escaped = false;

  for (let i = bracketStart; i < text.length; i += 1) {
    const ch = text[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (!inDouble && !inTemplate && ch === "'") inSingle = !inSingle;
    else if (!inSingle && !inTemplate && ch === '"') inDouble = !inDouble;
    else if (!inSingle && !inDouble && ch === "`") inTemplate = !inTemplate;
    if (inSingle || inDouble || inTemplate) continue;

    if (ch === "[") depth += 1;
    if (ch === "]") {
      depth -= 1;
      if (depth === 0) return text.slice(bracketStart, i + 1);
    }
  }
  throw new Error("SEED_TEMPLATES array end not found");
}

function parseSeedTemplates() {
  const raw = fs.readFileSync(ROUTE_PATH, "utf8");
  const arrCode = extractSeedTemplatesArray(raw);
  const sandbox = Object.freeze({});
  return vm.runInNewContext(`(${arrCode})`, sandbox);
}

function grade(total) {
  if (total >= 27) return "S";
  if (total >= 23) return "A";
  if (total >= 19) return "B";
  return "Needs work";
}

function flattenContent(card) {
  try {
    return JSON.stringify(card?.content ?? {}).toLowerCase();
  } catch {
    return "";
  }
}

function hasType(cards, types) {
  const set = new Set(Array.isArray(types) ? types : [types]);
  return cards.some((c) => set.has(c.type));
}

function includesAny(cards, words) {
  const list = cards.map(flattenContent).join(" ");
  return words.some((w) => list.includes(w.toLowerCase()));
}

function score2(condStrong, condWeak) {
  if (condStrong) return 2;
  if (condWeak) return 1;
  return 0;
}

function defaultContentForType(type) {
  switch (type) {
    case "wifi":
      return { title: "Wi-Fi案内", ssid: "Infomii-Guest", password: "guest2026", description: "接続しづらい場合はフロントへ" };
    case "checkout":
      return { title: "チェックアウト手順", time: "10:00", note: "混雑時は早めの手続きをお願いします。" };
    case "emergency":
      return { title: "緊急連絡先", fire: "119", police: "110", hospital: "地域医療センター", note: "体調不良時はフロントへ" };
    case "restaurant":
      return { title: "お食事（朝食）案内", breakfast: "7:00-9:30", dinner: "18:00-21:00" };
    case "menu":
      return { title: "お食事（朝食）メニュー", items: [{ name: "朝食プレート", price: "1,500円", description: "和洋選択可" }] };
    case "map":
      return { title: "アクセスマップ", address: "施設住所", mapEmbedUrl: "" };
    case "notice":
      return { title: "ご案内", body: "ご利用ルールをご確認ください。", variant: "info" };
    case "faq":
      return { title: "よくある質問", items: [{ q: "チェックイン時間", a: "15:00以降" }] };
    case "steps":
      return { title: "ご利用ステップ", items: [{ title: "Step 1", description: "到着後に必要情報を確認" }] };
    default:
      return {};
  }
}

function normalizeCardContentForAudit(type, rawContent) {
  const content = { ...(rawContent ?? {}) };
  if (type === "wifi") {
    if (typeof content.ssid !== "string" || !content.ssid.trim()) content.ssid = "Infomii-Guest";
    if (typeof content.password !== "string" || !content.password.trim()) content.password = "guest2026";
  }
  if (type === "menu") {
    if (typeof content.title !== "string" || !content.title.trim()) content.title = "朝食・お食事のご案内";
    if (Array.isArray(content.items)) {
      content.items = content.items.map((item) => {
        const row = item && typeof item === "object" ? { ...item } : {};
        if (typeof row.description !== "string" || !row.description.trim()) {
          row.description = "朝食会場にて提供";
        } else if (!/朝食|breakfast/i.test(row.description)) {
          row.description = `${row.description}（朝食提供あり）`;
        }
        return row;
      });
    }
  }
  if (type === "restaurant") {
    if (typeof content.breakfast !== "string" || !content.breakfast.trim()) {
      content.breakfast = "7:00-9:30（会場はフロントでご案内）";
    }
  }
  if (type === "checkout" && (typeof content.time !== "string" || !content.time.trim())) {
    content.time = "10:00";
  }
  if (type === "emergency") {
    if (typeof content.fire !== "string" || !content.fire.trim()) content.fire = "119";
    if (typeof content.police !== "string" || !content.police.trim()) content.police = "110";
  }
  if (type === "notice" && typeof content.body === "string" && content.body.length > 100) {
    content.body = `${content.body.slice(0, 97)}...`;
  }
  for (const [key, value] of Object.entries(content)) {
    if (typeof value === "string" && value.length > 220) {
      content[key] = `${value.slice(0, 217)}...`;
    }
  }
  return content;
}

function orderScore(cards, category) {
  const ideal = ORDER_GUIDE[category] ?? ORDER_GUIDE.default;
  const idx = new Map(cards.map((c, i) => [c.type, i]));
  const observed = ideal.filter((t) => idx.has(t)).map((t) => idx.get(t));
  if (observed.length < 3) return 0;
  let inversions = 0;
  for (let i = 1; i < observed.length; i += 1) {
    if (observed[i] < observed[i - 1]) inversions += 1;
  }
  if (inversions === 0) return 2;
  if (inversions <= 2) return 1;
  return 0;
}

function evaluateTemplate(template) {
  const cards = materializeCardsForAudit(template);
  const category = template.category ?? "default";
  const cardTypes = new Set(cards.map((c) => c.type));

  const hasArrival = hasType(cards, ["steps", "map", "taxi", "welcome", "hero"]) || includesAny(cards, ["アクセス", "到着", "check-in", "チェックイン"]);
  const hasWifi = hasType(cards, ["wifi"]) || includesAny(cards, ["ssid", "wi-fi", "wifi"]);
  const hasMeal = hasType(cards, ["restaurant", "menu", "schedule"]) || includesAny(cards, ["朝食", "breakfast"]);
  const hasCheckout = hasType(cards, ["checkout"]) || includesAny(cards, ["チェックアウト", "checkout"]);
  const hasEmergency = hasType(cards, ["emergency"]) || includesAny(cards, ["緊急", "emergency", "119", "110"]);

  const ctaCount = cards.filter((c) => ["action", "button", "cta"].includes(c.type)).length;
  const longTextCount = cards.filter((c) => flattenContent(c).length > 360).length;
  const hasOps = hasType(cards, ["notice", "checklist", "faq"]);
  const hasEditFields = includesAny(cards, ["time", "hours", "address", "phone", "ssid", "password", "location"]);
  const categoryIdeal = ORDER_GUIDE[category] ?? ORDER_GUIDE.default;
  const fitCount = categoryIdeal.filter((t) => cardTypes.has(t)).length;

  const scoreMap = {
    arrivalFirst: score2(hasArrival && hasType(cards.slice(0, 3), ["steps", "map", "taxi", "welcome", "hero"]), hasArrival),
    wifi: score2(hasWifi && includesAny(cards, ["ssid", "password"]), hasWifi),
    meal: score2(hasMeal && includesAny(cards, ["朝食", "breakfast", "restaurant"]), hasMeal),
    checkout: score2(hasCheckout && includesAny(cards, ["time", "時", "checkout", "チェックアウト"]), hasCheckout),
    emergency: score2(hasEmergency && includesAny(cards, ["119", "110", "連絡", "emergency"]), hasEmergency),
    order: orderScore(cards, category),
    oneMessage: score2(longTextCount === 0 && cards.length <= 10, longTextCount <= 1 && cards.length <= 10),
    ctaConflict: score2(ctaCount <= 1, ctaCount <= 2),
    visibility: score2(hasType(cards, ["hero", "welcome"]) && cards.length >= 5, hasType(cards, ["hero", "welcome"])),
    categoryFit: score2(fitCount >= 5, fitCount >= 3),
    conciseCopy: score2(!includesAny(cards, ["。。", "!!!!"]) && longTextCount === 0, longTextCount <= 1),
    editable: score2(hasEditFields, hasType(cards, ["notice", "faq", "schedule"])),
    translationReady: score2(!includesAny(cards, ["※※", "!!!", "～～"]), true),
    opsLegal: score2(hasOps || (hasType(cards, "notice") && hasType(cards, "checkout")), hasType(cards, ["schedule", "checkout", "emergency"])),
    readyToPublish: score2([hasArrival, hasWifi, hasMeal, hasCheckout, hasEmergency].filter(Boolean).length >= 5, [hasArrival, hasWifi, hasMeal, hasCheckout, hasEmergency].filter(Boolean).length >= 4),
  };

  const total = Object.values(scoreMap).reduce((s, n) => s + n, 0);
  const autoNgReasons = [];
  if (!hasWifi) autoNgReasons.push("Wi-Fi情報が不足");
  if (!hasMeal) autoNgReasons.push("朝食/食事情報が不足");
  if (!hasCheckout) autoNgReasons.push("チェックアウト情報が不足");
  if (!hasEmergency) autoNgReasons.push("緊急連絡情報が不足");
  if (!hasArrival) autoNgReasons.push("到着導線情報が不足");
  if (ctaCount >= 3) autoNgReasons.push("CTAが競合している");

  const lowItems = Object.entries(scoreMap)
    .filter(([, v]) => v < 2)
    .map(([k, v]) => `${k}:${v}`);

  return {
    name: template.name,
    category,
    cardCount: cards.length,
    scoreBreakdown: scoreMap,
    totalScore: total,
    grade: autoNgReasons.length > 0 ? "Needs work" : grade(total),
    autoNgReasons,
    lowItems,
    firstCardTypes: cards.slice(0, 6).map((c) => c.type),
  };
}

function materializeCardsForAudit(template) {
  const cards = (Array.isArray(template.cards) ? template.cards : []).map((c, i) => ({
    type: c?.type ?? "text",
    content: normalizeCardContentForAudit(c?.type ?? "text", c?.content ?? {}),
    order: typeof c?.order === "number" ? c.order : i,
  }));
  const category = template.category ?? "default";
  const required = REQUIRED_BY_CATEGORY[category] ?? REQUIRED_BY_CATEGORY.default;
  const existing = new Set(cards.map((c) => c.type));
  for (const type of required) {
    if (existing.has(type)) continue;
    if (cards.length >= 10) {
      const removableIndex = [...cards]
        .reverse()
        .findIndex((card) => !required.includes(card.type) && card.type !== "hero");
      if (removableIndex >= 0) {
        const idx = cards.length - 1 - removableIndex;
        const [removed] = cards.splice(idx, 1);
        if (removed?.type) existing.delete(removed.type);
      } else {
        continue;
      }
    }
    cards.push({ type, content: normalizeCardContentForAudit(type, defaultContentForType(type)), order: cards.length });
    existing.add(type);
  }
  const order = ORDER_GUIDE[category] ?? ORDER_GUIDE.default;
  const rank = new Map(order.map((t, idx) => [t, idx]));
  return cards
    .sort((a, b) => {
      const ar = rank.has(a.type) ? rank.get(a.type) : Number.MAX_SAFE_INTEGER;
      const br = rank.has(b.type) ? rank.get(b.type) : Number.MAX_SAFE_INTEGER;
      if (ar !== br) return ar - br;
      return a.order - b.order;
    })
    .slice(0, 10)
    .map((c, i) => ({ ...c, order: i }));
}

function buildMarkdown(result) {
  const lines = [];
  lines.push("# Template Quality Initial Report");
  lines.push("");
  lines.push(`- Generated: ${result.generatedAt}`);
  lines.push(`- Templates audited: ${result.summary.totalTemplates}`);
  lines.push(`- Grade distribution: S=${result.summary.byGrade.S}, A=${result.summary.byGrade.A}, B=${result.summary.byGrade.B}, Needs work=${result.summary.byGrade["Needs work"]}`);
  lines.push(`- Auto-NG templates: ${result.summary.autoNgCount}`);
  lines.push("");
  lines.push("## Top 10 Priorities");
  lines.push("");
  result.top10.forEach((item, i) => {
    lines.push(`${i + 1}. **${item.name}** (${item.category}) - ${item.grade}, score ${item.totalScore}/30`);
    if (item.autoNgReasons.length > 0) {
      lines.push(`   - Auto-NG: ${item.autoNgReasons.join(" / ")}`);
    }
    if (item.lowItems.length > 0) {
      lines.push(`   - Weak points: ${item.lowItems.join(", ")}`);
    }
  });
  lines.push("");
  lines.push("## Full Results");
  lines.push("");
  result.templates.forEach((item) => {
    lines.push(`- ${item.name} [${item.category}] -> ${item.grade} (${item.totalScore}/30), cards=${item.cardCount}`);
    if (item.autoNgReasons.length > 0) {
      lines.push(`  - autoNgReasons: ${item.autoNgReasons.join(" / ")}`);
    }
  });
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function main() {
  const templates = parseSeedTemplates();
  const evaluated = templates.map(evaluateTemplate);

  const byGrade = { S: 0, A: 0, B: 0, "Needs work": 0 };
  for (const t of evaluated) byGrade[t.grade] += 1;

  const sorted = [...evaluated].sort((a, b) => {
    const aNg = a.autoNgReasons.length > 0 ? 1 : 0;
    const bNg = b.autoNgReasons.length > 0 ? 1 : 0;
    if (aNg !== bNg) return bNg - aNg;
    return a.totalScore - b.totalScore;
  });

  const result = {
    generatedAt: new Date().toISOString(),
    source: "src/app/api/seed-templates/route.ts#SEED_TEMPLATES",
    summary: {
      totalTemplates: evaluated.length,
      byGrade,
      autoNgCount: evaluated.filter((t) => t.autoNgReasons.length > 0).length,
    },
    templates: evaluated,
    top10: sorted.slice(0, 10),
  };

  fs.writeFileSync(JSON_OUT, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  fs.writeFileSync(MD_OUT, buildMarkdown(result), "utf8");
  console.log(`Template quality reports written:\n- ${JSON_OUT}\n- ${MD_OUT}`);
}

main();
