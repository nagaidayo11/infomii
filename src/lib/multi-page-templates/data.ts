import type {
  MultiPageTemplate,
  MultiPageTemplateId,
  TemplatePage,
} from "./types";

function buildStandardPages(params: {
  firstTitle: string;
  firstLead: string;
  firstImageUrl: string;
}): TemplatePage[] {
  return [
    {
      title: "館内総合案内",
      blocks: [
        { type: "title", content: params.firstTitle },
        { type: "text", content: params.firstLead },
        {
          type: "image",
          src: params.firstImageUrl,
          alt: "館内",
        },
        { type: "button", label: "館内マップ", href: "#" },
      ],
    },
    {
      title: "WiFi",
      blocks: [
        { type: "title", content: "WiFi" },
        {
          type: "icon",
          icon: "📶",
          label: "SSID・パスワードはこちらに記載してください",
        },
        {
          type: "text",
          content:
            "客室カードや備品に記載の情報を転記するか、フロント案内に差し替えてください。",
        },
        { type: "button", label: "WiFi情報", href: "#wifi" },
      ],
    },
    {
      title: "朝食案内",
      blocks: [
        { type: "title", content: "朝食案内" },
        {
          type: "icon",
          icon: "🍽️",
          label: "朝食の時間・場所・形式を記載",
        },
        {
          type: "text",
          content:
            "ビュッフェ・和食・簡易軽食など、提供内容に合わせて編集してください。",
        },
        { type: "button", label: "朝食のご案内", href: "#breakfast" },
      ],
    },
    {
      title: "チェックアウト",
      blocks: [
        { type: "title", content: "チェックアウト" },
        {
          type: "icon",
          icon: "🚪",
          label: "出発時刻・鍵・ゴミ出しなど",
        },
        {
          type: "text",
          content:
            "チェックアウト時刻・返却物・追加料金の有無を記載してください。",
        },
        { type: "button", label: "チェックアウトのご案内", href: "#checkout" },
      ],
    },
    {
      title: "周辺観光",
      blocks: [
        { type: "title", content: "周辺観光" },
        {
          type: "icon",
          icon: "📍",
          label: "住所・交通・観光スポット",
        },
        {
          type: "text",
          content:
            "近隣の観光スポット・コンビニ・駅・アクセス方法などを記載してください。",
        },
        { type: "button", label: "周辺マップ", href: "#map" },
      ],
    },
  ];
}

export const MULTI_PAGE_TEMPLATES: MultiPageTemplate[] = [
  {
    id: "hotel-basic",
    name: "ホテル基本",
    description:
      "シティホテル向けの標準テンプレート。館内総合案内・WiFi・朝食・チェックアウト・周辺観光の5ページを自動作成します。",
    previewImage:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
    pages: buildStandardPages({
      firstTitle: "館内総合案内",
      firstLead:
        "ご滞在に役立つ情報をまとめました。各項目からご確認ください。",
      firstImageUrl:
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
    }),
  },
  {
    id: "business-hotel",
    name: "ビジネスホテル",
    description:
      "出張・ビジネス利用向け。館内・WiFi・朝食・チェックアウト・周辺観光の5ページを自動作成します。",
    previewImage:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
    pages: buildStandardPages({
      firstTitle: "館内総合案内",
      firstLead:
        "ビジネスでのご利用に必要な情報をまとめました。ご快適なご滞在のお役立てください。",
      firstImageUrl:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
    }),
  },
  {
    id: "ryokan",
    name: "旅館",
    description:
      "旅館・和宿向け。館内案内・WiFi・朝食・チェックアウト・周辺観光の5ページを自動作成します。",
    previewImage:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80",
    pages: buildStandardPages({
      firstTitle: "館内案内",
      firstLead:
        "旅館のご利用について、WiFi・お食事・チェックアウト・アクセスまでご案内します。",
      firstImageUrl:
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    }),
  },
  {
    id: "minpaku",
    name: "民泊",
    description:
      "民泊・一棟貸し向け。館内・WiFi・朝食・チェックアウト・周辺観光の5ページを自動作成します。",
    previewImage:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
    pages: buildStandardPages({
      firstTitle: "ご利用のご案内",
      firstLead:
        "民泊のご利用案内です。WiFi・朝食の扱い・チェックアウト・周辺情報を編集してご利用ください。",
      firstImageUrl:
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    }),
  },
];

export function getMultiPageTemplate(
  id: MultiPageTemplateId
): MultiPageTemplate | null {
  return MULTI_PAGE_TEMPLATES.find((t) => t.id === id) ?? null;
}

export function getMultiPageTemplateIds(): MultiPageTemplateId[] {
  return MULTI_PAGE_TEMPLATES.map((t) => t.id as MultiPageTemplateId);
}
