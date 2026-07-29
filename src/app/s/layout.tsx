import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function StampGuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-white font-sans text-slate-900 antialiased">{children}</div>
  );
}
