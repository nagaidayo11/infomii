"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AuthGate } from "@/components/auth-gate";
import {
  buildPublicUrl,
  buildPublicQrUrl,
  getDashboardBootstrapData,
  qrCodeImageUrl,
} from "@/lib/storage";
import type { Information } from "@/types/information";

const QR_DISPLAY_SIZE = 400;

/**
 * QRコード生成インターフェース
 * ゲストページ用QRの表示・ダウンロード・印刷・リンクコピー（日本語UI）
 */
export function QrGeneratorPanel() {
  const [items, setItems] = useState<Information[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const boot = await getDashboardBootstrapData();
      setItems(boot.informations);
      setSelectedId((prev) => {
        if (prev && boot.informations.some((i) => i.id === prev)) return prev;
        return boot.informations[0]?.id ?? "";
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = useMemo(
    () => items.find((i) => i.id === selectedId) ?? null,
    [items, selectedId]
  );

  const publicUrl = selected ? buildPublicUrl(selected.slug) : "";
  const qrLink = selected ? buildPublicQrUrl(selected.slug) : "";
  const qrImageSrc = qrLink ? qrCodeImageUrl(qrLink, QR_DISPLAY_SIZE) : "";
  const printHref = selected
    ? `/print/a4-qr?title=${encodeURIComponent(selected.title || "ご案内")}&url=${encodeURIComponent(publicUrl)}&qr=${encodeURIComponent(qrLink)}`
    : "";

  function handleDownload() {
    if (!qrImageSrc || !selected) return;
    const a = document.createElement("a");
    a.href = qrImageSrc;
    a.download = `infomii-qr-${selected.slug}.png`;
    a.target = "_blank";
    a.rel = "noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function handleCopyLink() {
    if (!qrLink) return;
    try {
      await navigator.clipboard.writeText(qrLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("コピーに失敗しました");
    }
  }

  return (
    <AuthGate>
      <div className="min-h-screen bg-ds-bg px-4 py-10">
        <div className="mx-auto max-w-lg">
          <header className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              QRコード生成
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              ゲストページ用のQRを表示・保存・印刷できます
            </p>
          </header>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-800">
              {error}
            </div>
          )}

          {/* ページ選択 */}
          <div className="mb-6 rounded-xl border border-ds-border bg-ds-card p-4 shadow-sm">
            <label className="block text-xs font-medium text-slate-500">
              ページを選択
            </label>
            {loading ? (
              <p className="mt-2 text-sm text-slate-500">読み込み中…</p>
            ) : items.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">
                ページがありません。
                <Link
                  href="/dashboard/pages"
                  className="ml-1 font-medium text-blue-600 hover:underline"
                >
                  ページ管理
                </Link>
                から作成してください。
              </p>
            ) : (
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="mt-2 w-full rounded-lg border border-ds-border bg-white px-3 py-2.5 text-sm text-slate-900"
              >
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title?.trim()
                      ? `${item.title}（${item.status === "published" ? "公開中" : "下書き"}）`
                      : `（${item.status === "published" ? "公開中" : "下書き"}）`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 中央：大きなQR */}
          {selected && qrImageSrc && (
            <div className="rounded-2xl border border-ds-border bg-ds-card p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <div className="flex justify-center">
                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-inner">
                  <Image
                    src={qrImageSrc}
                    alt="QRコード"
                    width={QR_DISPLAY_SIZE}
                    height={QR_DISPLAY_SIZE}
                    className="h-auto w-full max-w-[320px] sm:max-w-none"
                    unoptimized
                    priority
                  />
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-slate-500">
                スマホで読み取るとゲスト向けページが開きます
              </p>

              {/* アクション */}
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
                <a
                  href={qrImageSrc}
                  target="_blank"
                  rel="noreferrer"
                  className="app-button-native inline-flex justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                >
                  QRコード生成
                </a>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex justify-center rounded-xl border border-ds-border bg-white px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                  ダウンロード
                </button>
                <a
                  href={printHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex justify-center rounded-xl border border-ds-border bg-white px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                  印刷
                </a>
                <button
                  type="button"
                  onClick={() => void handleCopyLink()}
                  className="inline-flex justify-center rounded-xl border border-ds-border bg-white px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                  {copied ? "コピーしました" : "QRリンクをコピー"}
                </button>
              </div>

              <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  QRリンク（ゲストが開くURL）
                </p>
                <p className="mt-1 break-all text-xs text-slate-700">{qrLink}</p>
              </div>
            </div>
          )}

          <p className="mt-8 text-center text-xs text-slate-400">
            <Link href="/dashboard/qr" className="hover:text-slate-600">
              QR管理（スキャン分析）
            </Link>
            {" · "}
            <Link href="/dashboard" className="hover:text-slate-600">
              ダッシュボード
            </Link>
          </p>
        </div>
      </div>
    </AuthGate>
  );
}
