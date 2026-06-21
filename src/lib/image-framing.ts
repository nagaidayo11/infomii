import type { CSSProperties } from "react";

export type ImageFraming = {
  focusX?: number;
  focusY?: number;
  zoom?: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function readImageFraming(content: Record<string, unknown> | undefined): Required<ImageFraming> {
  return {
    focusX: clamp(readNumber(content?.focusX, 50), 0, 100),
    focusY: clamp(readNumber(content?.focusY, 50), 0, 100),
    zoom: clamp(readNumber(content?.zoom, 100), 100, 200),
  };
}

export function imageFramingStyle(framing: ImageFraming): CSSProperties {
  const focusX = clamp(readNumber(framing.focusX, 50), 0, 100);
  const focusY = clamp(readNumber(framing.focusY, 50), 0, 100);
  const zoom = clamp(readNumber(framing.zoom, 100), 100, 200) / 100;

  if (focusX === 50 && focusY === 50 && zoom === 1) {
    return {};
  }

  return {
    objectPosition: `${focusX}% ${focusY}%`,
    transform: zoom === 1 ? undefined : `scale(${zoom})`,
    transformOrigin: `${focusX}% ${focusY}%`,
  };
}

export function imageFramingClassName(framing: ImageFraming): string {
  const focusX = clamp(readNumber(framing.focusX, 50), 0, 100);
  const focusY = clamp(readNumber(framing.focusY, 50), 0, 100);
  const zoom = clamp(readNumber(framing.zoom, 100), 100, 200);
  if (focusX === 50 && focusY === 50 && zoom === 100) {
    return "object-cover object-center";
  }
  return "object-cover";
}
