#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "public/templates/previews/manifest.json");

const BASE_PROMPT = [
  "ホテル案内テンプレート一覧カード向けキービジュアル。",
  "フォトリアル、高解像度、商用品質、自然な質感。",
  "主題は宿泊体験が伝わる情景。外観単体に固定せず、アプローチ空間・エントランス・周辺文脈・到着後の利用シーンを同時に含める。",
  "建物または宿の識別要素をアンカーとして保ちつつ、構図の55-70%は体験文脈（導線/半屋外空間/窓越しのロビー/周辺街路）で構成する。",
  "建物の正面全景・立面図のようなショットは禁止。ファサード単体で画面を埋めない。",
  "必ず前景に体験要素（歩道導線、車寄せ動線、玄関まわり、植栽導線、窓越しロビーの気配）のいずれかを置く。",
  "人物は豆粒シルエット程度のみ可、顔判別不可。",
  "文字・ロゴ・透かし・可読看板・ブランド要素は入れない。",
  "料理・皿・ドリンク・室内食事を主役にしない。スパ物撮り禁止。",
  "5:3横構図、1920x1152想定、一覧カードで識別しやすい強いシルエットと奥行き。",
].join("\n");

const NEGATIVE = [
  "NG: readable text, logo, watermark, close-up face, food close-up, drink, table dining, spa product, indoor dining main subject, blurry, low contrast, overexposed, flat composition",
].join("\n");

/** @type {Record<string, {fingerprint: string, palette: string, materials: string, mustInclude: string, mustAvoid: string, requiredExperience: string}>} */
const CATEGORY_STYLE_RULES = {
  business: {
    fingerprint: "都市機能型・実務的・端正。南国感を排除し、直線的で引き締まった都市ホテルの印象。",
    palette: "slate gray, steel blue, neutral white, subtle amber accents only",
    materials: "glass, aluminum, clean stone, urban pavement",
    mustInclude: "駅前/オフィス街文脈、明確な車寄せまたは玄関導線、規則的な窓配置、移動導線の気配",
    mustAvoid: "palm trees, beach mood, tropical vegetation, resort-like sunset romance",
    requiredExperience: "歩道から入口までの導線、タクシー降車帯、窓越しロビーの実用感",
  },
  resort: {
    fingerprint: "非日常・開放的・景観一体型。自然との接続を強く感じる高揚感のある印象。",
    palette: "sunset gold, sea blue, lush green, warm highlights",
    materials: "natural stone, wood accents, lush landscape planting",
    mustInclude: "海または豊かな緑、広い到着空間、リゾートらしい植栽レイヤー、体験導線の奥行き",
    mustAvoid: "dense business district look, rigid office-like facade monotony",
    requiredExperience: "散策路、到着デッキ、庭越しアプローチ、風景へ抜ける導線",
  },
  ryokan: {
    fingerprint: "静謐・和の品格・伝統意匠。余白と陰影で落ち着きを表現。",
    palette: "warm lantern amber, deep brown, muted indigo, moss green",
    materials: "wood lattice, tile roof, stone path, paper-lantern glow",
    mustInclude: "門・行灯・瓦・石畳のうち複数、和風旅館らしい玄関のしつらえ、庭越しの導線",
    mustAvoid: "modern glass-box business architecture, tropical resort cues",
    requiredExperience: "門から玄関への石畳、のれん前の間、庭越しの玄関導線",
  },
  airbnb: {
    fingerprint: "私邸感・暮らしに近い滞在・親しみやすい外観。過度なホテル感を避ける。",
    palette: "soft neutral, warm beige, natural green, gentle contrast",
    materials: "residential siding, wood deck, small garden, porch lighting",
    mustInclude: "戸建て/一棟貸しと分かる玄関アプローチ、住宅地文脈、暮らしの気配がある外構",
    mustAvoid: "large-scale hotel tower look, grand porte-cochere dominance",
    requiredExperience: "玄関前ポーチ、門扉からの短い導線、住宅外構の生活導線",
  },
  guide: {
    fingerprint: "回遊性・街との接続・目的地性。街並みの中でホテルが主役として立つ。",
    palette: "balanced urban tones with one clear accent color",
    materials: "street pavement, storefront rhythm, hotel facade focal point",
    mustInclude: "街並み要素を背景に含む、視線誘導でホテルを中心化、回遊導線の気配",
    mustAvoid: "isolated building with no town context, empty abstract backdrop",
    requiredExperience: "街歩き導線、角地の視線誘導、目的地へ向かう歩道動線",
  },
  inbound: {
    fingerprint: "安心感・国際対応感・明瞭導線。初訪日でも迷いにくい印象。",
    palette: "clean neutral base with welcoming warm entrance light",
    materials: "clear glazing, legible circulation geometry, barrier-free approach",
    mustInclude: "抽象ピクト風の案内雰囲気（文字不可読）、明るい入口、分かりやすい導線、安心できる到着体験",
    mustAvoid: "local-only ambiguous alley mood, dark unsafe-looking entrance",
    requiredExperience: "バリアフリー動線、到着導線の分かりやすさ、入口周りの安心感",
  },
};

/** @type {Record<string, {core: string, variations: Array<{shot: string,time: string,season: string,weather: string,grade: string,context: string,detail: string}>}>} */
const CATEGORY_PROMPTS = {
  business: {
    core: "都市部・駅近のビジネスホテル。機能性、清潔感、直線的建築、夜間導線の分かりやすさ。",
    variations: [
      { shot: "frontal symmetry", time: "blue hour", season: "spring fresh green", weather: "light rain reflections", grade: "cool steel-blue", context: "駅前ロータリーからホテル正面へ一直線の動線", detail: "タクシー乗降スペースと庇の下の入口照明" },
      { shot: "corner perspective", time: "early morning", season: "summer clear sky", weather: "clear", grade: "neutral clean", context: "オフィス街の交差点角地", detail: "歩道から見えるエントランスと街路樹" },
      { shot: "street-level approach", time: "rainy dusk", season: "autumn warm foliage", weather: "after rain", grade: "warm amber", context: "駅から徒歩3分の細い導線", detail: "濡れた舗道に反射する外観照明" },
      { shot: "elevated wide", time: "overcast noon", season: "winter crisp air", weather: "misty", grade: "neutral clean", context: "ビジネス街の複数棟の中で目的地が明確", detail: "車寄せとエントランスの視認性を重視" },
      { shot: "gateway close-wide", time: "golden hour", season: "spring fresh green", weather: "clear", grade: "warm amber", context: "出張客が迷わない大通り沿い", detail: "庇下サインの雰囲気は抽象形状のみ" },
      { shot: "corner perspective", time: "blue hour", season: "summer clear sky", weather: "clear", grade: "cool steel-blue", context: "高層ビル街の中規模ホテル", detail: "ガラスエントランスとアプローチ植栽" },
      { shot: "street-level approach", time: "early morning", season: "winter crisp air", weather: "clear", grade: "neutral clean", context: "始発帯の静かな駅前通り", detail: "明るいロビーが奥に見える構図" },
      { shot: "frontal symmetry", time: "rainy dusk", season: "autumn warm foliage", weather: "light rain reflections", grade: "cool steel-blue", context: "コンパクトな駅前ホテル街区", detail: "路面反射と連続窓の規則性" },
      { shot: "gateway close-wide", time: "overcast noon", season: "spring fresh green", weather: "clear", grade: "neutral clean", context: "会議会場徒歩圏の実用立地", detail: "外観照明と車寄せの導線表示は抽象記号のみ" },
    ],
  },
  resort: {
    core: "海または緑に開くリゾートホテル。開放感、非日常、ランドスケープと建築の一体感。プール単体主役は不可。",
    variations: [
      { shot: "elevated wide", time: "golden hour", season: "summer clear sky", weather: "clear", grade: "warm amber", context: "海沿いの高台に建つリゾート到着動線", detail: "車寄せから海風を感じる植栽帯" },
      { shot: "corner perspective", time: "blue hour", season: "spring fresh green", weather: "light rain reflections", grade: "soft cinematic", context: "山裾のリゾートエントランス", detail: "石畳アプローチと外観照明" },
      { shot: "street-level approach", time: "early morning", season: "summer clear sky", weather: "clear", grade: "neutral clean", context: "ビーチアクセス前のホテル正面", detail: "ヤシと庇の連続で到着体験を表現" },
      { shot: "frontal symmetry", time: "overcast noon", season: "autumn warm foliage", weather: "misty", grade: "neutral clean", context: "森に囲まれた低層リゾート", detail: "木立越しに見えるメインエントランス" },
      { shot: "gateway close-wide", time: "rainy dusk", season: "winter crisp air", weather: "after rain", grade: "cool steel-blue", context: "温暖地の海辺リゾートで雨上がり", detail: "濡れた石床と暖色ロビー光" },
      { shot: "corner perspective", time: "golden hour", season: "autumn warm foliage", weather: "clear", grade: "warm amber", context: "丘陵リゾートの曲線アプローチ", detail: "植栽とファサードの奥行き" },
      { shot: "street-level approach", time: "blue hour", season: "summer clear sky", weather: "clear", grade: "soft cinematic", context: "サンセット後の到着シーン", detail: "海側の抜け感を背景に外観主役" },
      { shot: "elevated wide", time: "early morning", season: "spring fresh green", weather: "misty", grade: "neutral clean", context: "緑地越しに望むリゾート全景", detail: "建築と庭園導線の一体感" },
      { shot: "frontal symmetry", time: "rainy dusk", season: "autumn warm foliage", weather: "light rain reflections", grade: "warm amber", context: "非日常感のあるエントランス前広場", detail: "車寄せ照明と濡れた路面の反射" },
    ],
  },
  ryokan: {
    core: "和風旅館。門、瓦、木格子、行灯、石畳、庭のしつらえ。静けさと品格、和の到着体験。",
    variations: [
      { shot: "gateway close-wide", time: "blue hour", season: "winter crisp air", weather: "light snow remnants", grade: "warm amber", context: "門から玄関までの石畳導線", detail: "行灯の柔らかな灯りと木格子" },
      { shot: "frontal symmetry", time: "early morning", season: "spring fresh green", weather: "clear", grade: "neutral clean", context: "庭越しに見える旅館正面", detail: "瓦屋根と玄関のしつらえを主役化" },
      { shot: "corner perspective", time: "rainy dusk", season: "autumn warm foliage", weather: "after rain", grade: "soft cinematic", context: "温泉街の路地に面した旅館入口", detail: "濡れた石畳と門灯の反射" },
      { shot: "street-level approach", time: "overcast noon", season: "summer clear sky", weather: "misty", grade: "neutral clean", context: "山間の静かな旅館アプローチ", detail: "竹垣と庭石で到着体験を表現" },
      { shot: "elevated wide", time: "golden hour", season: "autumn warm foliage", weather: "clear", grade: "warm amber", context: "小さな温泉街全体の中で旅館が主役", detail: "門前の導線と屋根シルエット" },
      { shot: "frontal symmetry", time: "blue hour", season: "spring fresh green", weather: "light rain reflections", grade: "cool steel-blue", context: "静かな夕刻の到着シーン", detail: "行灯と木扉まわりの奥行き" },
    ],
  },
  airbnb: {
    core: "一棟貸し・戸建て宿。玄関アプローチ、私邸感、暮らしの延長にある滞在感。室内キッチン主役は不可。",
    variations: [
      { shot: "street-level approach", time: "golden hour", season: "spring fresh green", weather: "clear", grade: "warm amber", context: "住宅街の角地にある一棟貸し", detail: "玄関までの短い導線と外構植栽" },
      { shot: "corner perspective", time: "early morning", season: "summer clear sky", weather: "clear", grade: "neutral clean", context: "モダン戸建てのチェックイン動線", detail: "門扉から玄関の見通しを重視" },
      { shot: "frontal symmetry", time: "blue hour", season: "autumn warm foliage", weather: "light rain reflections", grade: "soft cinematic", context: "町家風外観の一棟貸し", detail: "路地の文脈を少し含めつつ建物主役" },
      { shot: "gateway close-wide", time: "overcast noon", season: "winter crisp air", weather: "clear", grade: "cool steel-blue", context: "郊外の静かな貸別荘エリア", detail: "ポーチと玄関灯で到着感を演出" },
      { shot: "elevated wide", time: "rainy dusk", season: "spring fresh green", weather: "after rain", grade: "warm amber", context: "複数戸の中で対象棟が分かる導線", detail: "アプローチ床の反射とファサード" },
      { shot: "street-level approach", time: "blue hour", season: "summer clear sky", weather: "clear", grade: "neutral clean", context: "ワーケーション向け住宅地", detail: "落ち着いた外観と玄関アクセス" },
      { shot: "corner perspective", time: "golden hour", season: "autumn warm foliage", weather: "misty", grade: "soft cinematic", context: "ファミリー向け一棟貸し", detail: "前庭と玄関まわりを明確に見せる" },
    ],
  },
  guide: {
    core: "街歩き導線の中にあるホテル。周辺街並みを少し含め、目的地としてホテルが視線の中心。",
    variations: [
      { shot: "street-level approach", time: "golden hour", season: "spring fresh green", weather: "clear", grade: "warm amber", context: "観光通りの先に見えるホテル入口", detail: "街路の賑わいは背景として控えめ" },
      { shot: "corner perspective", time: "blue hour", season: "summer clear sky", weather: "clear", grade: "soft cinematic", context: "旧市街と新しいホテルの接点", detail: "道の曲がり角から建物が主役で現れる" },
      { shot: "elevated wide", time: "early morning", season: "autumn warm foliage", weather: "misty", grade: "neutral clean", context: "駅と観光エリアの中間地点", detail: "周辺文脈を少量入れて目的地性を強調" },
      { shot: "frontal symmetry", time: "overcast noon", season: "winter crisp air", weather: "clear", grade: "cool steel-blue", context: "バス停前から見えるホテル正面", detail: "到着導線が一目で分かる構図" },
      { shot: "gateway close-wide", time: "rainy dusk", season: "spring fresh green", weather: "light rain reflections", grade: "warm amber", context: "商店街端部のホテル入口", detail: "濡れた路面と庇照明で視線誘導" },
      { shot: "street-level approach", time: "blue hour", season: "autumn warm foliage", weather: "after rain", grade: "soft cinematic", context: "夜の回遊導線上のランドマークホテル", detail: "周辺はボケ気味で主役を分離" },
    ],
  },
  inbound: {
    core: "国際旅行者が安心できる到着シーン。ユニバーサルな動線・ピクトの雰囲気（文字は不可読）と明るいエントランス。",
    variations: [
      { shot: "frontal symmetry", time: "blue hour", season: "summer clear sky", weather: "clear", grade: "neutral clean", context: "空港バス降車後の到着導線を想起", detail: "抽象ピクト風サイン形状と明るい入口" },
      { shot: "corner perspective", time: "golden hour", season: "spring fresh green", weather: "clear", grade: "warm amber", context: "国際観光エリアの安心感あるホテル前", detail: "視認性の高い車寄せと段差の少ない導線" },
      { shot: "street-level approach", time: "rainy dusk", season: "autumn warm foliage", weather: "light rain reflections", grade: "soft cinematic", context: "夜間到着でも迷いにくい正面動線", detail: "濡れた路面に暖色光が反射" },
      { shot: "gateway close-wide", time: "early morning", season: "winter crisp air", weather: "clear", grade: "cool steel-blue", context: "早朝チェックアウト導線を想起", detail: "玄関周りの案内要素は抽象記号のみ" },
      { shot: "elevated wide", time: "overcast noon", season: "spring fresh green", weather: "misty", grade: "neutral clean", context: "都市観光拠点としてのホテル立地", detail: "周辺街区を少し入れて目的地性を強調" },
      { shot: "street-level approach", time: "blue hour", season: "autumn warm foliage", weather: "after rain", grade: "warm amber", context: "多国籍ゲストの安心感を重視した外観", detail: "バリアフリーなアプローチと入口照明" },
    ],
  },
};

function buildPrompt(entry, variation, core, styleRule) {
  return [
    BASE_PROMPT,
    `カテゴリ要件: ${core}`,
    `カテゴリ固有ビジュアル指紋: ${styleRule.fingerprint}`,
    `推奨カラーパレット: ${styleRule.palette}`,
    `推奨マテリアル: ${styleRule.materials}`,
    `シーン: ${variation.shot}, ${variation.time}, ${variation.season}, ${variation.weather}`,
    `色調: ${variation.grade}`,
    `文脈要素: ${variation.context}`,
    `追加ディテール: ${variation.detail}`,
    `必須要素: ${styleRule.mustInclude}`,
    `必須体験要素(非外観): ${styleRule.requiredExperience}`,
    `禁止要素(カテゴリ差別化): ${styleRule.mustAvoid}`,
    `テンプレ名: ${entry.name}`,
    NEGATIVE,
  ].join("\n");
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  if (!Array.isArray(manifest.entries)) throw new Error("manifest.entries must be an array");

  manifest.generated = new Date().toISOString();
  manifest.note =
    "Prompt set v3.2: hard-ban facade-only composition. Force experience-forward scenes with non-exterior foreground context while keeping property identity anchor. Local static preview files only.";

  for (const entry of manifest.entries) {
    const cat = CATEGORY_PROMPTS[entry.category];
    const styleRule = CATEGORY_STYLE_RULES[entry.category];
    if (!cat) throw new Error(`Unknown category: ${entry.category}`);
    if (!styleRule) throw new Error(`Unknown category style rule: ${entry.category}`);
    const idx = Number(entry.categoryIndex) || 0;
    const variation = cat.variations[idx % cat.variations.length];
    entry.styleNotes =
      "主役は宿の建物/到着体験。料理・ドリンク・室内食事主役NG。文字/ロゴ/透かしNG。5:3、1920x1152想定。";
    entry.prompt = buildPrompt(entry, variation, cat.core, styleRule);
  }

  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Rewrote prompts for ${manifest.entries.length} entries: ${MANIFEST_PATH}`);
}

main();
