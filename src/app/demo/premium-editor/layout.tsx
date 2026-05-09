import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Infomii プレミアムエディターUIデモ",
  robots: { index: false, follow: false },
};

export default function PremiumEditorDemoLayout({ children }: { children: ReactNode }) {
  return children;
}
