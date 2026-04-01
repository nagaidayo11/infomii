import { InfomiiManual } from "@/components/settings/InfomiiManual";

/**
 * マニュアル — 画面リンク付きの利用ガイド
 */
export default function DashboardManualPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">マニュアル</h1>
        <p className="mt-2 text-sm text-slate-600">
          Infomiiでできることを、実際の画面リンクつきでまとめています。
        </p>
      </header>
      <InfomiiManual />
    </div>
  );
}
