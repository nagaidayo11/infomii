import Image from "next/image";
import PrintButton from "@/components/print-button";

type PrintA4QrPageProps = {
  searchParams: Promise<{
    title?: string;
    url?: string;
    qr?: string;
  }>;
};

export default async function PrintA4QrPage({ searchParams }: PrintA4QrPageProps) {
  const query = await searchParams;
  const title = (query.title ?? "ご案内ページ").trim() || "ご案内ページ";
  const url = (query.url ?? "").trim();
  const qrValue = (query.qr ?? url).trim();

  return (
    <main className="min-h-screen bg-white p-6 text-slate-900 print:p-0">
      <article className="mx-auto w-full max-w-[794px] rounded-lg border border-slate-200 p-8 print:border-0 print:p-10">
        <h1 className="text-3xl font-bold tracking-wide">インフォミー</h1>
        <p className="mt-1 text-lg font-semibold">{title}</p>
        <p className="mt-4 text-sm text-slate-600">下のQRから最新の案内ページをご確認ください。</p>
        <div className="mt-6 grid items-start gap-6 sm:grid-cols-[220px_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <Image
              alt="QRコード"
              width={220}
              height={220}
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrValue)}`}
              unoptimized
            />
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">URL</p>
              <p className="mt-1 break-all text-sm text-slate-800">{url || "未設定"}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">運用メモ</p>
              <ul className="mt-1 space-y-1 text-sm text-slate-700">
                <li>・受付・客室・エレベーター前に掲示</li>
                <li>・更新後はこのA4を差し替え</li>
                <li>・印刷はA4縦・余白なし推奨</li>
              </ul>
            </div>
          </div>
        </div>
        <PrintButton />
      </article>
    </main>
  );
}
