"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { buildAppSharePageLabel } from "@/lib/app-branding";
import { navigateGuestPageUrl } from "@/lib/app-href";
import {
  buildLineShareUrl,
  buildMailShareUrl,
  buildPublishShareMessage,
  buildXShareUrl,
} from "@/lib/publish-share";
import { qrCodeImageUrl, trackShareClick } from "@/lib/storage";

type PublishModalProps = {
  publicUrl: string;
  pageTitle: string;
  slug: string;
  onClose: () => void;
  /** 公開直後の成功表示か、一覧からの共有表示か */
  variant?: "publish-success" | "share";
};

const QR_SIZE = 256;

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  );
}

function OpenPageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

export function PublishModal({
  publicUrl,
  pageTitle,
  slug: _slug,
  onClose,
  variant = "publish-success",
}: PublishModalProps) {
  const isShare = variant === "share";
  const { isAppShell } = useClientShell();
  const [mounted, setMounted] = useState(false);
  const [copyUrlStatus, setCopyUrlStatus] = useState<"idle" | "ok" | "fail">("idle");
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const qrImageUrl = qrCodeImageUrl(publicUrl, QR_SIZE);
  const shareShell = isAppShell ? "app" : "web";
  const shareMessage = buildPublishShareMessage(pageTitle, publicUrl, { shell: shareShell });

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopyUrlStatus("ok");
      setTimeout(() => setCopyUrlStatus("idle"), 2000);
    } catch {
      setCopyUrlStatus("fail");
      setTimeout(() => setCopyUrlStatus("idle"), 2000);
    }
  };

  const openShareWindow = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleOpenPage = () => {
    if (isAppShell) {
      navigateGuestPageUrl(publicUrl);
      return;
    }
    window.open(publicUrl, "_blank", "noopener,noreferrer");
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: pageTitle,
          text: isAppShell ? buildAppSharePageLabel(pageTitle) : `${pageTitle}のしおり`,
          url: publicUrl,
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    setShareMenuOpen((open) => !open);
  };

  const shareFallbackActions = [
    {
      id: "line",
      label: "LINE",
      onClick: () => {
        void trackShareClick("line");
        openShareWindow(buildLineShareUrl(shareMessage));
        setShareMenuOpen(false);
      },
    },
    {
      id: "x",
      label: "X",
      onClick: () => {
        openShareWindow(buildXShareUrl(pageTitle, publicUrl, { shell: shareShell }));
        setShareMenuOpen(false);
      },
    },
    {
      id: "mail",
      label: "メール",
      onClick: () => {
        void trackShareClick("mail");
        window.location.href = buildMailShareUrl(pageTitle, shareMessage);
        setShareMenuOpen(false);
      },
    },
  ];

  const actionButtons = [
    {
      id: "share",
      label: "共有",
      className: "publish-share-btn publish-share-btn--share",
      icon: <ShareIcon className="h-5 w-5" />,
      onClick: () => void handleShare(),
    },
    {
      id: "copy",
      label: copyUrlStatus === "ok" ? "コピー済" : copyUrlStatus === "fail" ? "失敗" : "リンク",
      className: "publish-share-btn publish-share-btn--copy",
      icon: <CopyIcon className="h-5 w-5" />,
      onClick: () => void handleCopyUrl(),
    },
    {
      id: "open",
      label: "開く",
      className: "publish-share-btn publish-share-btn--open",
      icon: <OpenPageIcon className="h-5 w-5" />,
      onClick: handleOpenPage,
    },
  ];

  const overlay = (
    <div
      className="publish-modal-overlay ui-overlay-fade fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm sm:p-4"
      role="dialog"
      aria-modal
      aria-labelledby="publish-modal-title"
      onClick={onClose}
    >
      <div
        className="publish-modal-panel ui-pop-in w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xl max-h-[85dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={
            "border-b border-slate-100 px-4 py-4 text-center sm:px-6 sm:py-5 " +
            (isShare
              ? "bg-gradient-to-b from-slate-50 to-white"
              : "bg-gradient-to-b from-emerald-50/80 to-white")
          }
        >
          <div
            className={
              "mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full " +
              (isShare ? "bg-slate-100" : "bg-emerald-100")
            }
          >
            {isShare ? (
              <svg className="h-6 w-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <h2 id="publish-modal-title" className="text-xl font-semibold text-slate-900">
            {isShare ? "QR・リンク" : "公開しました"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{pageTitle}</p>
        </div>

        <div className="space-y-5 p-4 sm:p-6">
          <div className="flex flex-col items-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">QRコード</p>
            <div className="flex shrink-0 overflow-hidden rounded-2xl border-2 border-slate-100 bg-white p-3 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrImageUrl}
                alt=""
                width={QR_SIZE}
                height={QR_SIZE}
                className="h-44 w-44 object-contain sm:h-52 sm:w-52"
              />
            </div>
          </div>

          <div>
            <div className="publish-share-grid publish-share-grid--compact">
              {actionButtons.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={action.onClick}
                  className={action.className}
                  aria-label={
                    action.id === "share"
                      ? "共有"
                      : action.id === "copy"
                        ? "リンクをコピー"
                        : "ページを開く"
                  }
                >
                  <span className="publish-share-btn-icon">{action.icon}</span>
                  <span className="publish-share-btn-label">{action.label}</span>
                </button>
              ))}
            </div>
            {shareMenuOpen ? (
              <div className="publish-share-fallback mt-3 rounded-xl border border-slate-200 bg-slate-50 p-2">
                <div className="flex gap-2">
                  {shareFallbackActions.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={action.onClick}
                      className="publish-share-fallback-btn flex-1"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-500">公開URL</p>
            <input
              type="text"
              readOnly
              value={publicUrl}
              onFocus={(e) => e.currentTarget.select()}
              onClick={(e) => e.currentTarget.select()}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-700"
              aria-label="Public page URL"
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold !text-white hover:bg-slate-800"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(overlay, document.body);
}
