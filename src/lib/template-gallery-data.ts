import { nanoid } from "nanoid";
import type { PageBlock } from "@/components/page-editor/types";

export type GalleryTemplateId = "hotel-basic" | "ryokan" | "resort" | "minpaku";

export type GalleryTemplate = {
  id: GalleryTemplateId;
  name: string;
  description: string;
  previewImage: string;
  /** 自動で含まれるページ構成（カードに表示） */
  pages: string[];
  accent: string;
};

/**
 * テンプレート4種。適用で館内案内・WiFi・朝食・チェックアウト・周辺観光の構成が入ります。
 */
export const GALLERY_TEMPLATES: GalleryTemplate[] = [
  {
    id: "hotel-basic",
    name: "ホテル基本",
    description: "シティホテル向けの標準テンプレートです。各セクションの文言を編集してご利用ください。",
    previewImage:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
    pages: ["館内案内", "WiFi", "朝食", "チェックアウト", "周辺観光"],
    accent: "from-slate-600 to-slate-800",
  },
  {
    id: "ryokan",
    name: "旅館",
    description: "旅館・和宿向け。おもてなしと館内の流れが伝わる構成です。",
    previewImage:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80",
    pages: ["館内案内", "WiFi", "朝食", "チェックアウト", "周辺観光"],
    accent: "from-amber-700 to-stone-800",
  },
  {
    id: "resort",
    name: "リゾートホテル",
    description: "リゾート施設向け。アクティビティや周辺情報を足しやすい構成です。",
    previewImage:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
    pages: ["館内案内", "WiFi", "朝食", "チェックアウト", "周辺観光"],
    accent: "from-cyan-600 to-teal-700",
  },
  {
    id: "minpaku",
    name: "民泊",
    description: "民泊・一棟貸し向け。ハウスルールと周辺をまとめやすい構成です。",
    previewImage:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
    pages: ["館内案内", "WiFi", "朝食", "チェックアウト", "周辺観光"],
    accent: "from-violet-600 to-indigo-800",
  },
];

function nid() {
  return nanoid(8);
}

/**
 * テンプレート適用時にキャンバスへ流し込むブロック一式。
 * 館内案内 → WiFi → 朝食 → チェックアウト → 周辺観光 の順で並びます。
 */
export function buildBlocksForTemplate(templateId: GalleryTemplateId): PageBlock[] {
  const heroCopy: Record<
    GalleryTemplateId,
    { title: string; lead: string }
  > = {
    "hotel-basic": {
      title: "館内案内",
      lead: "ご滞在に役立つ情報をまとめました。各項目からご確認ください。",
    },
    ryokan: {
      title: "館内案内",
      lead: "旅館のご利用について、WiFi・お食事・チェックアウト・周辺までご案内します。",
    },
    resort: {
      title: "館内案内",
      lead: "リゾート内のご案内です。WiFi・朝食・チェックアウト・周辺観光をご確認ください。",
    },
    minpaku: {
      title: "館内案内",
      lead: "民泊のご利用案内です。WiFi・朝食の扱い・チェックアウト・周辺情報を編集してご利用ください。",
    },
  };
  const hero = heroCopy[templateId];
  const preview =
    GALLERY_TEMPLATES.find((t) => t.id === templateId)?.previewImage ?? "";

  const blocks: PageBlock[] = [];

  blocks.push({
    id: nid(),
    type: "image",
    src: preview,
    alt: hero.title,
  });
  blocks.push({ id: nid(), type: "text", content: hero.title });
  blocks.push({ id: nid(), type: "text", content: hero.lead });

  // WiFi
  blocks.push({ id: nid(), type: "divider" });
  blocks.push({ id: nid(), type: "text", content: "WiFi" });
  blocks.push({
    id: nid(),
    type: "icon",
    icon: "📶",
    label: "SSID・パスワードはこちらに記載してください",
  });
  blocks.push({
    id: nid(),
    type: "text",
    content:
      "客室カードや備品に記載の情報を転記するか、フロント案内に差し替えてください。",
  });
  blocks.push({
    id: nid(),
    type: "button",
    label: "WiFi情報",
    href: "#wifi",
  });

  // 朝食
  blocks.push({ id: nid(), type: "divider" });
  blocks.push({ id: nid(), type: "text", content: "朝食" });
  blocks.push({
    id: nid(),
    type: "icon",
    icon: "🍽️",
    label: "朝食の時間・場所・形式を記載",
  });
  blocks.push({
    id: nid(),
    type: "text",
    content:
      "ビュッフェ・和食・簡易軽食など、提供内容に合わせて編集してください。",
  });
  blocks.push({
    id: nid(),
    type: "button",
    label: "朝食のご案内",
    href: "#breakfast",
  });

  // チェックアウト
  blocks.push({ id: nid(), type: "divider" });
  blocks.push({ id: nid(), type: "text", content: "チェックアウト" });
  blocks.push({
    id: nid(),
    type: "icon",
    icon: "🚪",
    label: "出発時刻・鍵・ゴミ出しなど",
  });
  blocks.push({
    id: nid(),
    type: "text",
    content:
      "チェックアウト時刻・返却物・追加料金の有無を記載してください。",
  });
  blocks.push({
    id: nid(),
    type: "button",
    label: "チェックアウトのご案内",
    href: "#checkout",
  });

  // 周辺観光
  blocks.push({ id: nid(), type: "divider" });
  blocks.push({ id: nid(), type: "text", content: "周辺観光" });
  blocks.push({
    id: nid(),
    type: "map",
    address: "住所を入力してください",
  });
  blocks.push({
    id: nid(),
    type: "text",
    content:
      "近隣の観光スポット・コンビニ・駅・アクセス方法などを追記できます。",
  });
  blocks.push({
    id: nid(),
    type: "button",
    label: "周辺マップ",
    href: "#map",
  });

  return blocks;
}
