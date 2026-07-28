/** Staff-facing operational guide for rotating press QR programs. */
export function StampRotatingQrGuide() {
  return (
    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-[12px] leading-relaxed text-amber-950">
      <p className="font-bold tracking-tight">回転式QRの運用（スタッフ向け）</p>
      <ol className="mt-2.5 list-decimal space-y-2 pl-4">
        <li>
          会計時に、この編集画面の「押印QR（回転式）」をスタッフ端末で開いたまま提示します（印刷はできません）。
        </li>
        <li>QRは約90秒ごとに自動更新されます。読み取り中は画面を閉じないでください。</li>
        <li>
          お客様はマイカードの「カメラでスキャンして獲得」から読み取ります。端末のカメラアプリから開く必要はありません。
        </li>
        <li>
          カメラが使えない場合のみ、画面に表示されている短いコードを口頭で伝え、「コードで付与する」への入力を案内できます（約90秒以内）。
        </li>
        <li>写真やスクショの使い回しは、更新間隔内に限り有効期限があります。</li>
      </ol>
      <p className="mt-3 text-[11px] text-amber-900/80">
        入口QR（カード発行用）とは別です。会計カウンター用端末をブックマークしておくとスムーズです。
      </p>
    </div>
  );
}
