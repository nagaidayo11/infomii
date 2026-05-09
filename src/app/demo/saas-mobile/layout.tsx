import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Infomii モバイルUIデモ",
  robots: { index: false, follow: false },
};

export default function SaasMobileDemoLayout({ children }: { children: ReactNode }) {
  return children;
}
