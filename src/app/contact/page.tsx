import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/contact/ContactForm";
import { SUPPORT_EMAIL } from "@/lib/app-store-compliance";
import { ContactPageChrome } from "@/components/contact/ContactPageChrome";

export const metadata: Metadata = {
  title: "ご意見・ご相談",
  description:
    "Infomiiの使いづらさ、欲しい機能やブロック、導入の相談など、気軽にメールで送れます。",
  alternates: { canonical: "/contact" },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <ContactPageChrome>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Contact</p>
      <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-slate-900">気軽にご連絡ください</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        使いづらい点、こういうブロックが欲しい、導入や公開の相談、なんでも大丈夫です。下のボタンでメールアプリが開き、
        {" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-emerald-700 underline underline-offset-2">
          {SUPPORT_EMAIL}
        </a>
        {" "}
        宛の下書きができます。
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-slate-500">読み込み中...</p>}>
          <ContactForm />
        </Suspense>
      </div>
    </ContactPageChrome>
  );
}
