import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "公開モーダル（App Store デモ）",
  robots: { index: false, follow: false },
};

export default function AppStorePublishDemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
