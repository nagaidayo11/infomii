import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "沖縄、3泊5人（App Store デモ）",
  robots: { index: false, follow: false },
};

export default function OkinawaGroupSampleDemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
