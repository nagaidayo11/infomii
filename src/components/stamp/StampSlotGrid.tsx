"use client";

import { StampMark } from "@/components/stamp/StampMark";
import { STAMP_CAPACITY, type StampStyleId } from "@/lib/stamp/styles";

export function StampSlotGrid({
  filled,
  accent,
  styleId,
  animateLatest = false,
  size = "sm",
  capacity = STAMP_CAPACITY,
}: {
  filled: number;
  accent: string;
  styleId: StampStyleId;
  animateLatest?: boolean;
  size?: "sm" | "md" | "lg";
  capacity?: number;
}) {
  const latestIndex = animateLatest && filled > 0 ? filled - 1 : -1;

  return (
    <div className="grid grid-cols-5 justify-items-center gap-x-2.5 gap-y-3.5">
      {Array.from({ length: capacity }).map((_, i) => (
        <StampMark
          key={i}
          index={i}
          filled={i < filled}
          accent={accent}
          styleId={styleId}
          animateIn={i === latestIndex}
          size={size}
          highlight={i === 4 || i === 9}
        />
      ))}
    </div>
  );
}
