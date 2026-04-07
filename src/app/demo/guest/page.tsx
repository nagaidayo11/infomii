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

export default function DemoGuestPage({
  searchParams,
}: {
  searchParams?: { frame?: string };
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
          {page}
        </div>
      </div>
    </div>
  );
}
