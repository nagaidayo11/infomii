"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  createQrDetector,
  readQrFromVideoFrame,
  readQrFromVideoFrameAsync,
} from "@/lib/stamp/scan-frame";
import { buildStampCardPath, extractStampCodeFromScanText } from "@/lib/stamp/types";
import "@/styles/stamp.css";

/**
 * Full-screen stamp QR scanner.
 * Opens the device camera immediately, applies the stamp, then returns to the card.
 */
export function StampScanClient() {
  const params = useParams();
  const router = useRouter();
  const token = typeof params.token === "string" ? decodeURIComponent(params.token) : "";

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const applyingRef = useRef(false);
  const detectorRef = useRef(createQrDetector());

  const [status, setStatus] = useState<"starting" | "scanning" | "applying" | "error">("starting");
  const [message, setMessage] = useState<string | null>(null);

  function goBack(query = "") {
    if (!token) {
      router.replace("/");
      return;
    }
    router.replace(`${buildStampCardPath(token)}${query}`);
  }

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("カード情報が見つかりません");
      return;
    }

    let cancelled = false;
    let timer: number | null = null;

    function stopCamera() {
      if (timer != null) {
        window.clearTimeout(timer);
        timer = null;
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    async function applyStamp(stampCode: string) {
      if (applyingRef.current || cancelled) return;
      applyingRef.current = true;
      setStatus("applying");
      setMessage("スタンプを付けています…");
      stopCamera();
      try {
        if (navigator.vibrate) navigator.vibrate(12);
      } catch {
        /* ignore */
      }
      try {
        const res = await fetch(`/api/stamp/cards/${encodeURIComponent(token)}/stamp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stampCode }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) throw new Error(data.error ?? "スタンプを付けられませんでした");
        if (!cancelled) goBack("?earned=1");
      } catch (e) {
        applyingRef.current = false;
        if (cancelled) return;
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "スタンプを付けられませんでした");
      }
    }

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        video.srcObject = stream;
        await video.play();
        setStatus("scanning");

        const loop = async () => {
          while (!cancelled && !applyingRef.current) {
            const v = videoRef.current;
            const c = canvasRef.current;
            if (v && c && v.readyState >= 2) {
              try {
                const raw =
                  (await readQrFromVideoFrameAsync(v, c, detectorRef.current)) ??
                  readQrFromVideoFrame(v, c);
                if (raw) {
                  const code = extractStampCodeFromScanText(raw);
                  if (code) {
                    await applyStamp(code);
                    return;
                  }
                }
              } catch {
                /* keep scanning */
              }
            }
            await new Promise<void>((resolve) => {
              timer = window.setTimeout(resolve, 180);
            });
          }
        };

        void loop();
      } catch {
        if (cancelled) return;
        setStatus("error");
        setMessage(
          "カメラを開けませんでした。ブラウザのカメラ許可を確認するか、カード画面からコード入力をお試しください。",
        );
      }
    }

    void start();

    return () => {
      cancelled = true;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once per token
  }, [token]);

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-black text-white">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        playsInline
        muted
        autoPlay
      />
      <canvas ref={canvasRef} className="hidden" aria-hidden />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(0,0,0,0.58)_100%)]" />

      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={() => goBack()}
          className="pointer-events-auto rounded-full bg-black/45 px-3.5 py-2 text-sm font-semibold backdrop-blur-sm"
        >
          閉じる
        </button>
        <p className="max-w-[12rem] rounded-full bg-black/45 px-3 py-2 text-[11px] font-medium leading-snug backdrop-blur-sm">
          枠内に押印QRを合わせてください
        </p>
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-12">
        <div className="aspect-square w-full max-w-[260px] rounded-2xl border-2 border-white/85 shadow-[0_0_0_9999px_rgba(0,0,0,0.32)]" />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6">
        {status === "starting" ? (
          <p className="text-center text-sm text-white/85">カメラを起動しています…</p>
        ) : null}
        {status === "scanning" ? (
          <p className="text-center text-sm text-white/85">読み取ると自動でカードに戻ります</p>
        ) : null}
        {status === "applying" ? (
          <p className="text-center text-sm font-semibold text-emerald-200">
            {message ?? "スタンプを付けています…"}
          </p>
        ) : null}
        {status === "error" ? (
          <div className="rounded-2xl bg-white px-4 py-4 text-slate-900">
            <p className="text-center text-sm font-semibold text-rose-600">
              {message ?? "読み取りに失敗しました"}
            </p>
            <button
              type="button"
              onClick={() => {
                applyingRef.current = false;
                window.location.reload();
              }}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white"
            >
              もう一度カメラを開く
            </button>
            <button
              type="button"
              onClick={() => goBack("?manual=1")}
              className="mt-2 w-full text-center text-[12px] text-slate-500 underline-offset-2 hover:underline"
            >
              カードに戻ってコード入力する
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
