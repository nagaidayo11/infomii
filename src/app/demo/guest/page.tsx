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

export default function DemoGuestPage() {
  return (
    <GuestCardPageView
      title="ご案内"
      cards={cards}
      initialLocale="ja"
      localeLocked
      pageBackground={{ mode: "solid", color: "#f8fafc", from: "#f8fafc", to: "#e2e8f0", angle: 180 }}
      unpublishedPreview
    />
  );
}
