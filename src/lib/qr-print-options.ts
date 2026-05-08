export type QrPrintTemplateId =
  | "simple"
  | "notice"
  | "premium"
  | "rounded"
  | "ticket"
  | "frame_bold"
  | "frame_minimal"
  | "soft_card"
  | "scan_square"
  | "scan_rounded"
  | "scan_corner"
  | "scan_dotted";
export type QrPrintSizeId = "a4" | "a5" | "mini";

export type QrPrintTemplateSpec = {
  id: QrPrintTemplateId;
  label: string;
  description: string;
  panelClassName: string;
  qrWrapClassName: string;
  ornament: "none" | "corners" | "ticket" | "double";
  guideStyle?: "none" | "line" | "slash";
};

export type QrPrintSizeSpec = {
  id: QrPrintSizeId;
  label: string;
  pageClassName: string;
  articleClassName: string;
  headingClassName: string;
  qrPreviewSize: number;
  qrPrintSize: number;
};

export const QR_PRINT_TEMPLATES: Record<QrPrintTemplateId, QrPrintTemplateSpec> = {
  simple: {
    id: "simple",
    label: "シンプル",
    description: "最小構成のフレーム",
    panelClassName: "rounded-lg border border-slate-300 bg-white",
    qrWrapClassName: "rounded-md border border-slate-200 bg-white p-2",
    ornament: "none",
  },
  notice: {
    id: "notice",
    label: "注意喚起",
    description: "コントラスト高めの視認重視",
    panelClassName: "rounded-xl border-[3px] border-slate-900 bg-white",
    qrWrapClassName: "rounded-lg border-2 border-slate-900 bg-white p-2.5",
    ornament: "double",
  },
  premium: {
    id: "premium",
    label: "プレミアム",
    description: "ホテル向けの上質フレーム",
    panelClassName: "rounded-2xl border border-slate-400 bg-gradient-to-b from-white to-slate-50",
    qrWrapClassName: "rounded-xl border border-slate-300 bg-white p-3 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.25)]",
    ornament: "corners",
  },
  rounded: {
    id: "rounded",
    label: "ラウンド",
    description: "角丸を強調した柔らかい見た目",
    panelClassName: "rounded-[2rem] border-2 border-slate-400 bg-white",
    qrWrapClassName: "rounded-3xl border border-slate-300 bg-white p-3",
    ornament: "none",
  },
  ticket: {
    id: "ticket",
    label: "チケット",
    description: "チケット風ノッチ付き",
    panelClassName: "relative rounded-xl border-2 border-slate-500 bg-white",
    qrWrapClassName: "rounded-lg border border-slate-300 bg-white p-2.5",
    ornament: "ticket",
  },
  frame_bold: {
    id: "frame_bold",
    label: "太枠",
    description: "遠目でも目立つ太枠タイプ",
    panelClassName: "rounded-lg border-[4px] border-slate-900 bg-white",
    qrWrapClassName: "rounded-md border-2 border-slate-900 bg-white p-2",
    ornament: "none",
  },
  frame_minimal: {
    id: "frame_minimal",
    label: "細枠ミニマル",
    description: "細線だけのミニマルデザイン",
    panelClassName: "rounded-md border border-slate-300 bg-white",
    qrWrapClassName: "rounded-sm border border-slate-200 bg-white p-2",
    ornament: "none",
  },
  soft_card: {
    id: "soft_card",
    label: "ソフトカード",
    description: "柔らかいカード風トーン",
    panelClassName: "rounded-2xl border border-slate-200 bg-slate-50",
    qrWrapClassName: "rounded-xl border border-slate-200 bg-white p-3 shadow-sm",
    ornament: "corners",
    guideStyle: "none",
  },
  scan_square: {
    id: "scan_square",
    label: "SCAN スクエア",
    description: "線付きガイド文の四角フレーム",
    panelClassName: "rounded-none border-2 border-slate-700 bg-white",
    qrWrapClassName: "rounded-none border border-slate-300 bg-white p-3",
    ornament: "none",
    guideStyle: "line",
  },
  scan_rounded: {
    id: "scan_rounded",
    label: "SCAN ラウンド",
    description: "角丸フレーム＋ガイド文",
    panelClassName: "rounded-2xl border-2 border-slate-700 bg-white",
    qrWrapClassName: "rounded-md border border-slate-300 bg-white p-3",
    ornament: "none",
    guideStyle: "line",
  },
  scan_corner: {
    id: "scan_corner",
    label: "SCAN コーナー",
    description: "四隅マーク付きガイド文",
    panelClassName: "rounded-none border border-slate-500 bg-white",
    qrWrapClassName: "rounded-sm border border-slate-300 bg-white p-3",
    ornament: "corners",
    guideStyle: "none",
  },
  scan_dotted: {
    id: "scan_dotted",
    label: "SCAN ドット",
    description: "点線枠＋スラッシュ装飾",
    panelClassName: "rounded-2xl border-2 border-dashed border-slate-500 bg-white",
    qrWrapClassName: "rounded-sm border border-slate-300 bg-white p-3",
    ornament: "none",
    guideStyle: "slash",
  },
};

export const QR_PRINT_SIZES: Record<QrPrintSizeId, QrPrintSizeSpec> = {
  a4: {
    id: "a4",
    label: "A4縦",
    pageClassName: "max-w-[794px]",
    articleClassName: "p-8 print:p-10",
    headingClassName: "text-3xl",
    qrPreviewSize: 230,
    qrPrintSize: 360,
  },
  a5: {
    id: "a5",
    label: "A5",
    pageClassName: "max-w-[560px]",
    articleClassName: "p-6 print:p-8",
    headingClassName: "text-2xl",
    qrPreviewSize: 190,
    qrPrintSize: 280,
  },
  mini: {
    id: "mini",
    label: "卓上ミニ",
    pageClassName: "max-w-[420px]",
    articleClassName: "p-5 print:p-6",
    headingClassName: "text-xl",
    qrPreviewSize: 160,
    qrPrintSize: 220,
  },
};

export function normalizeQrPrintTemplateId(value: string | undefined | null): QrPrintTemplateId {
  if (
    value === "simple" ||
    value === "notice" ||
    value === "premium" ||
    value === "rounded" ||
    value === "ticket" ||
    value === "frame_bold" ||
    value === "frame_minimal" ||
    value === "soft_card" ||
    value === "scan_square" ||
    value === "scan_rounded" ||
    value === "scan_corner" ||
    value === "scan_dotted"
  ) {
    return value;
  }
  return "simple";
}

export function normalizeQrPrintSizeId(value: string | undefined | null): QrPrintSizeId {
  if (value === "a5" || value === "mini" || value === "a4") return value;
  return "a4";
}

export function canUseAdvancedPrintTemplate(plan: "free" | "pro" | "business" | null | undefined): boolean {
  return plan === "pro" || plan === "business";
}
