"use client";

import Image from "next/image";
import { use, useEffect, useMemo, useState, type CSSProperties } from "react";
import PrintButton from "@/components/print-button";
import {
  QR_PRINT_SIZES,
  QR_PRINT_TEMPLATES,
  canUseAdvancedPrintTemplate,
  normalizeQrPrintSizeId,
  normalizeQrPrintTemplateId,
  type QrPrintSizeId,
  type QrPrintTemplateId,
} from "@/lib/qr-print-options";

type PrintA4QrPageProps = {
  searchParams: Promise<{
    title?: string;
    url?: string;
    qr?: string;
    tpl?: string;
    size?: string;
    pro?: string;
    text?: string;
    textPos?: string;
    textSize?: string;
  }>;
};

type TextPosition = "top" | "bottom";
type TextSizePreset = "m" | "l" | "xl";

const TEXT_SIZE_CLASS: Record<TextSizePreset, string> = {
  m: "text-lg print:text-2xl",
  l: "text-2xl print:text-4xl",
  xl: "text-3xl print:text-5xl",
};

export default function PrintA4QrPage({ searchParams }: PrintA4QrPageProps) {
  const params = use(searchParams);
  const url = (params.url ?? "").trim();
  const qrValue = (params.qr ?? url).trim();
  const canUseTemplate = canUseAdvancedPrintTemplate(params.pro === "1" ? "pro" : "free");

  const [template, setTemplate] = useState<QrPrintTemplateId>(() => {
    const requested = normalizeQrPrintTemplateId(params.tpl);
    return canUseTemplate ? requested : "simple";
  });
  const [size, setSize] = useState<QrPrintSizeId>(() => normalizeQrPrintSizeId(params.size));
  const [customText, setCustomText] = useState<string>((params.text ?? "").slice(0, 80));
  const [textPos, setTextPos] = useState<TextPosition>(() =>
    params.textPos === "bottom" ? "bottom" : "top"
  );
  const [textSize, setTextSize] = useState<TextSizePreset>(() => {
    if (params.textSize === "m" || params.textSize === "xl") return params.textSize;
    return "l";
  });

  const templateSpec = QR_PRINT_TEMPLATES[template];
  const sizeSpec = QR_PRINT_SIZES[size];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("tpl", canUseTemplate ? template : "simple");
    params.set("size", size);
    if (customText.trim()) params.set("text", customText.trim());
    else params.delete("text");
    params.set("textPos", textPos);
    params.set("textSize", textSize);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }, [template, size, customText, textPos, textSize, canUseTemplate]);

  const qrSrc = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=${sizeSpec.qrPrintSize}x${sizeSpec.qrPrintSize}&data=${encodeURIComponent(qrValue)}`,
    [sizeSpec.qrPrintSize, qrValue]
  );

  const renderOrnament = () => {
    if (templateSpec.ornament === "none") return null;
    if (templateSpec.ornament === "double") {
      return <div className="pointer-events-none absolute inset-3 rounded-lg border border-slate-400" aria-hidden />;
    }
    if (templateSpec.ornament === "ticket") {
      return (
        <>
          <span className="pointer-events-none absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-400 bg-white" aria-hidden />
          <span className="pointer-events-none absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-400 bg-white" aria-hidden />
        </>
      );
    }
    return (
      <>
        <span className="pointer-events-none absolute left-3 top-3 h-6 w-6 rounded-tl-lg border-l-2 border-t-2 border-slate-500" aria-hidden />
        <span className="pointer-events-none absolute right-3 top-3 h-6 w-6 rounded-tr-lg border-r-2 border-t-2 border-slate-500" aria-hidden />
        <span className="pointer-events-none absolute bottom-3 left-3 h-6 w-6 rounded-bl-lg border-b-2 border-l-2 border-slate-500" aria-hidden />
        <span className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 rounded-br-lg border-b-2 border-r-2 border-slate-500" aria-hidden />
      </>
    );
  };

  const renderGuideText = () => {
    const style = templateSpec.guideStyle ?? "none";
    if (style === "none") return null;
    if (style === "line") {
      return (
        <>
          <p className="mb-3 flex items-center justify-center gap-4 text-[11px] tracking-[0.35em] text-slate-700">
            <span className="h-px w-10 bg-slate-500" />
            <span>SCAN OR CODE</span>
            <span className="h-px w-10 bg-slate-500" />
          </p>
          <p className="mt-3 flex items-center justify-center gap-4 text-[11px] tracking-[0.3em] text-slate-700">
            <span className="h-px w-10 bg-slate-500" />
            <span>PLEASE SCAN HERE</span>
            <span className="h-px w-10 bg-slate-500" />
          </p>
        </>
      );
    }
    return (
      <>
        <p className="mb-3 text-center text-[11px] tracking-[0.35em] text-slate-700">＼ SCAN OR CODE ／</p>
        <p className="mt-3 text-center text-[11px] tracking-[0.3em] text-slate-700">／ PLEASE SCAN HERE ＼</p>
      </>
    );
  };

  return (
    <main className="min-h-screen bg-white p-6 text-slate-900 print:m-0 print:p-0">
      <style jsx global>{`
        @page {
          margin: 0;
        }
        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
          .qr-image {
            width: var(--qr-print-size) !important;
            height: var(--qr-print-size) !important;
          }
        }
        .qr-image {
          width: var(--qr-preview-size);
          height: var(--qr-preview-size);
        }
      `}</style>

      <section className="mx-auto mb-4 w-full max-w-[794px] rounded-lg border border-slate-200 bg-white p-4 print:hidden">
        <h2 className="text-sm font-semibold text-slate-800">印刷設定</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <label className="text-xs text-slate-500">
            印刷テンプレート
            <select
              value={template}
              onChange={(e) => setTemplate(normalizeQrPrintTemplateId(e.target.value))}
              disabled={!canUseTemplate}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              {Object.values(QR_PRINT_TEMPLATES).map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-500">
            印刷サイズ
            <select
              value={size}
              onChange={(e) => setSize(normalizeQrPrintSizeId(e.target.value))}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800"
            >
              {Object.values(QR_PRINT_SIZES).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-500 sm:col-span-2">
            任意テキスト（QR以外はここだけ印字）
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value.slice(0, 80))}
              placeholder="例: Free Wi-Fi / Front Desk"
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800"
            />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-4">
          <label className="text-xs text-slate-600">
            <input
              type="radio"
              className="mr-1"
              checked={textPos === "top"}
              onChange={() => setTextPos("top")}
            />
            テキスト位置: 上
          </label>
          <label className="text-xs text-slate-600">
            <input
              type="radio"
              className="mr-1"
              checked={textPos === "bottom"}
              onChange={() => setTextPos("bottom")}
            />
            テキスト位置: 下
          </label>
          <label className="text-xs text-slate-600">
            テキストサイズ
            <select
              value={textSize}
              onChange={(e) => setTextSize((e.target.value as TextSizePreset) ?? "l")}
              className="ml-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800"
            >
              <option value="m">標準</option>
              <option value="l">大（推奨）</option>
              <option value="xl">特大</option>
            </select>
          </label>
        </div>
        {!canUseTemplate ? (
          <p className="mt-2 text-xs text-slate-500">Freeプランはシンプル固定です。Pro以上でテンプレート選択が使えます。</p>
        ) : (
          <p className="mt-2 text-xs text-slate-500">{templateSpec.description}</p>
        )}
        <p className="mt-1 text-[11px] text-slate-400">
          ※ 印刷ダイアログの「ヘッダーとフッター」はOFFにしてください（ブラウザ仕様でページ側から強制不可）。
        </p>
      </section>

      <article
        className={`mx-auto flex min-h-[70vh] w-full ${sizeSpec.pageClassName} flex-col items-center justify-center gap-4 rounded-lg print:min-h-[100vh] print:w-full print:max-w-none print:border-0 ${sizeSpec.articleClassName}`}
      >
        {customText.trim() && textPos === "top" ? (
          <p className={`text-center font-semibold tracking-wide text-slate-900 ${TEXT_SIZE_CLASS[textSize]}`}>
            {customText.trim()}
          </p>
        ) : null}
        <div className={`relative flex flex-col items-center justify-center ${templateSpec.panelClassName} p-8`}>
          {renderOrnament()}
          {renderGuideText()}
          <div className={templateSpec.qrWrapClassName}>
            <Image
              className="qr-image"
              alt="QRコード"
              width={sizeSpec.qrPrintSize}
              height={sizeSpec.qrPrintSize}
              src={qrSrc}
              unoptimized
              priority
              style={
                {
                  "--qr-preview-size": `${sizeSpec.qrPreviewSize}px`,
                  "--qr-print-size": `${sizeSpec.qrPrintSize}px`,
                } as CSSProperties
              }
            />
          </div>
        </div>
        {customText.trim() && textPos === "bottom" ? (
          <p className={`text-center font-semibold tracking-wide text-slate-900 ${TEXT_SIZE_CLASS[textSize]}`}>
            {customText.trim()}
          </p>
        ) : null}
        <PrintButton />
      </article>
    </main>
  );
}
