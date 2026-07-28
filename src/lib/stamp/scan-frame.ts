import jsQR from "jsqr";

type DetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>;
};

/** Prefer native QR detection when available. */
export function createQrDetector(): DetectorLike | null {
  const DetectorCtor = (
    globalThis as unknown as {
      BarcodeDetector?: new (opts: { formats: string[] }) => DetectorLike;
    }
  ).BarcodeDetector;
  return DetectorCtor ? new DetectorCtor({ formats: ["qr_code"] }) : null;
}

/**
 * Read QR from the center crop of a video frame.
 * Center-only scanning is faster and more reliable on mobile Safari.
 */
export function readQrFromVideoFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
): string | null {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (vw < 16 || vh < 16) return null;

  const crop = Math.floor(Math.min(vw, vh) * 0.72);
  const sx = Math.floor((vw - crop) / 2);
  const sy = Math.floor((vh - crop) / 2);

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  canvas.width = crop;
  canvas.height = crop;
  ctx.drawImage(video, sx, sy, crop, crop, 0, 0, crop, crop);

  const imageData = ctx.getImageData(0, 0, crop, crop);
  const fromJs = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "attemptBoth",
  });
  return fromJs?.data ?? null;
}

/** Async full-frame read via BarcodeDetector (Chrome / some Android). */
export async function readQrFromVideoFrameAsync(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  detector: DetectorLike | null,
): Promise<string | null> {
  if (detector && video.readyState >= 2) {
    try {
      const codes = await detector.detect(video);
      const raw = codes[0]?.rawValue;
      if (raw) return raw;
    } catch {
      /* fall through to jsQR crop */
    }
  }
  return readQrFromVideoFrame(video, canvas);
}
