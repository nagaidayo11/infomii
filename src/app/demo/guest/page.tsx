import { GuestCardPageView } from "@/components/guest/GuestCardPageView";
import type { EditorCard } from "@/components/editor/types";

const cards: EditorCard[] = [
  {
    id: "demo-hero",
    type: "hero",
    order: 0,
    content: {
      title: "Infomii Hotel",
      subtitle: "館内案内をスマートにまとめました",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    },
  },
  {
    id: "demo-notice",
    type: "notice",
    order: 1,
    content: {
      title: "お知らせ",
      body: "客室清掃は10:00-14:00に実施します。",
      variant: "info",
    },
  },
  {
    id: "demo-wifi",
    type: "wifi",
    order: 2,
    content: {
      title: "WiFi",
      ssid: "Infomii-Guest",
      password: "welcome-2026",
      description: "接続できない場合はフロントへお知らせください。",
    },
  },
  {
    id: "demo-breakfast",
    type: "breakfast",
    order: 3,
    content: {
      title: "朝食ビュッフェ",
      hours: "6:00-9:00",
      place: "1F レストラン",
      note: "和洋メニューを日替わりでご用意しています。",
    },
  },
  {
    id: "demo-checkout",
    type: "checkout",
    order: 4,
    content: {
      title: "チェックアウト",
      time: "11:00まで",
      note: "延長をご希望の場合はフロントへご相談ください。",
    },
  },
];

const TEMPLATE_GALLERY: Array<{
  id: string;
  label: string;
  category: string;
  variant:
    | "city-hotel"
    | "resort"
    | "ryokan"
    | "business-hotel"
    | "glamping"
    | "spa"
    | "restaurant"
    | "cafe"
    | "salon"
    | "clinic";
}> = [
  { id: "city-hotel-core", label: "シティホテル 基本導線", category: "宿泊", variant: "city-hotel" },
  { id: "city-hotel-breakfast", label: "シティホテル 朝食強化", category: "宿泊", variant: "city-hotel" },
  { id: "city-hotel-nearby", label: "シティホテル 周辺案内", category: "宿泊", variant: "city-hotel" },
  { id: "resort-family", label: "リゾート ファミリー向け", category: "宿泊", variant: "resort" },
  { id: "resort-activity", label: "リゾート 体験導線", category: "宿泊", variant: "resort" },
  { id: "resort-dining", label: "リゾート 食事/送迎", category: "宿泊", variant: "resort" },
  { id: "ryokan-standard", label: "温泉旅館 定番導線", category: "宿泊", variant: "ryokan" },
  { id: "ryokan-banquet", label: "温泉旅館 宴会案内", category: "宿泊", variant: "ryokan" },
  { id: "ryokan-onsen", label: "温泉旅館 大浴場案内", category: "宿泊", variant: "ryokan" },
  { id: "business-checkin", label: "ビジネスホテル チェックイン", category: "宿泊", variant: "business-hotel" },
  { id: "business-laundry", label: "ビジネスホテル 連泊向け", category: "宿泊", variant: "business-hotel" },
  { id: "business-night", label: "ビジネスホテル 深夜到着", category: "宿泊", variant: "business-hotel" },
  { id: "glamping-beginner", label: "グランピング 初回向け", category: "アウトドア", variant: "glamping" },
  { id: "glamping-meal", label: "グランピング 食材受取", category: "アウトドア", variant: "glamping" },
  { id: "glamping-weather", label: "グランピング 雨天案内", category: "アウトドア", variant: "glamping" },
  { id: "spa-quick", label: "スパ クイック案内", category: "ウェルネス", variant: "spa" },
  { id: "spa-premium", label: "スパ プレミアムプラン", category: "ウェルネス", variant: "spa" },
  { id: "spa-membership", label: "スパ 会員向け", category: "ウェルネス", variant: "spa" },
  { id: "restaurant-course", label: "レストラン コース訴求", category: "飲食", variant: "restaurant" },
  { id: "restaurant-lunch", label: "レストラン ランチ導線", category: "飲食", variant: "restaurant" },
  { id: "cafe-takeout", label: "カフェ テイクアウト", category: "飲食", variant: "cafe" },
  { id: "cafe-season", label: "カフェ 季節メニュー", category: "飲食", variant: "cafe" },
  { id: "salon-consulting", label: "サロン 初回カウンセリング", category: "美容", variant: "salon" },
  { id: "clinic-reception", label: "クリニック 受付導線", category: "医療", variant: "clinic" },
];

export default function DemoGuestPage({
  searchParams,
}: {
  searchParams?: { frame?: string; template?: string };
}) {
  const withFrame = searchParams?.frame === "1";

  const page = (
    <GuestCardPageView
      title="ご案内"
      cards={cards}
      initialLocale="ja"
      localeLocked
      pageBackground={{ mode: "solid", color: "#f8fafc", from: "#f8fafc", to: "#e2e8f0", angle: 180 }}
      unpublishedPreview
      localeToggleHint="Businessプラン加入時は、言語トグルでページ全体を一括翻訳できます。"
      disableLocaleSwitch
    />
  );

  if (!withFrame) {
    return page;
  }

  const requestedTemplateId = searchParams?.template;
  const selectedTemplate =
    TEMPLATE_GALLERY.find((entry) => entry.id === requestedTemplateId) ?? TEMPLATE_GALLERY[0];
  const selectedVariant = selectedTemplate.variant;

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full items-center justify-center bg-slate-100 p-4 sm:p-6">
      <div className="relative h-[88dvh] w-[min(390px,100%)] overflow-hidden rounded-[2rem] border border-slate-300/70 bg-[#dbe3ed] p-[10px] shadow-[0_18px_42px_rgba(15,23,42,0.2)]">
        <div className="absolute left-1/2 top-[12px] z-10 h-1.5 w-14 -translate-x-1/2 rounded-full bg-slate-300/90" />
        <div
          className="h-full w-full overflow-auto rounded-[1.65rem] bg-white p-0 pt-2.5 shadow-inner ring-1 ring-slate-200/70"
          style={{
            clipPath: "inset(0 round 1.5rem)",
            WebkitMaskImage: "-webkit-radial-gradient(white, black)",
          }}
        >
          <div className="min-h-full bg-slate-50">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur">
              <p className="text-[11px] font-semibold tracking-wide text-emerald-700">テンプレートギャラリー（24件）</p>
              <p className="mt-0.5 text-[11px] text-slate-500">LPトップより多いパターンをこの画面で比較できます</p>
            </div>
            <div className="px-3 pb-3 pt-2">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <iframe
                  src={`/demo/guest-live?embed=1&variant=${selectedVariant}`}
                  title={`${selectedTemplate.label} preview`}
                  className="h-[390px] w-full border-0 bg-white"
                  loading="lazy"
                  scrolling="yes"
                />
              </div>
              <p className="mt-2 text-[11px] font-semibold text-slate-700">
                {selectedTemplate.category} / {selectedTemplate.label}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {TEMPLATE_GALLERY.map((template) => {
                  const isActive = template.id === selectedTemplate.id;
                  return (
                    <a
                      key={template.id}
                      href={`/demo/guest?frame=1&template=${template.id}`}
                      className={`rounded-lg border px-2 py-2 text-left text-[11px] leading-snug transition ${
                        isActive
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/40"
                      }`}
                    >
                      <span className="block font-semibold">{template.label}</span>
                      <span className="mt-0.5 block text-[10px] opacity-80">{template.category}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
