"use client";

import { motion } from "framer-motion";
import type { StampStyleId } from "@/lib/stamp/styles";

function IconSeal({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 48 48" className="h-[58%] w-[58%]" aria-hidden>
      <circle cx="24" cy="24" r="18" fill="none" stroke={color} strokeWidth="2.2" />
      <circle cx="24" cy="24" r="13.5" fill="none" stroke={color} strokeWidth="1.2" opacity="0.55" />
      <text
        x="24"
        y="28.5"
        textAnchor="middle"
        fill={color}
        fontSize="15"
        fontWeight="700"
        fontFamily='"Noto Sans JP", "Hiragino Sans", sans-serif'
      >
        印
      </text>
    </svg>
  );
}

function IconStar({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 48 48" className="h-[62%] w-[62%]" aria-hidden>
      <path
        fill={color}
        d="M24 7.5l4.2 9.6 10.4.9-7.9 6.7 2.4 10.2L24 29.6l-9.1 5.3 2.4-10.2-7.9-6.7 10.4-.9L24 7.5z"
      />
    </svg>
  );
}

function IconHeart({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 48 48" className="h-[58%] w-[58%]" aria-hidden>
      <path
        fill={color}
        d="M24 40.2C24 40.2 8.5 30.1 8.5 18.8c0-5.1 3.9-9 8.8-9 2.9 0 5.5 1.4 6.7 3.6 1.2-2.2 3.8-3.6 6.7-3.6 4.9 0 8.8 3.9 8.8 9 0 11.3-15.5 21.4-15.5 21.4z"
      />
    </svg>
  );
}

function IconCoffee({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 48 48" className="h-[62%] w-[62%]" aria-hidden>
      <path
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        d="M16 14c1.2 2.2.8 4.2 0 6M22 13c1.2 2.2.8 4.2 0 6M28 14c1.2 2.2.8 4.2 0 6"
      />
      <path
        fill={color}
        d="M12 22h22a2 2 0 0 1 2 2v6a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8v-6a2 2 0 0 1 2-2zm24 3h2.5A4.5 4.5 0 0 1 43 29.5 4.5 4.5 0 0 1 38.5 34H36"
      />
    </svg>
  );
}

function IconLeaf({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 48 48" className="h-[64%] w-[64%]" aria-hidden>
      <path fill={color} d="M12 34c10-18 22-22 26-22-2 12-10 24-26 26 4-6 6-12 0-4z" />
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
        d="M18 30c6-6 12-10 18-14"
      />
    </svg>
  );
}

function IconFlower({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 48 48" className="h-[62%] w-[62%]" aria-hidden>
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse
          key={deg}
          cx="24"
          cy="14"
          rx="5.2"
          ry="8.2"
          fill={color}
          transform={`rotate(${deg} 24 24)`}
          opacity="0.92"
        />
      ))}
      <circle cx="24" cy="24" r="4.2" fill="#fff" opacity="0.9" />
    </svg>
  );
}

function IconCheck({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 48 48" className="h-[58%] w-[58%]" aria-hidden>
      <path
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 25l8 8 16-18"
      />
    </svg>
  );
}

function IconSun({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 48 48" className="h-[62%] w-[62%]" aria-hidden>
      <circle cx="24" cy="24" r="8" fill={color} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <rect
          key={deg}
          x="22.4"
          y="5"
          width="3.2"
          height="7"
          rx="1.5"
          fill={color}
          transform={`rotate(${deg} 24 24)`}
        />
      ))}
    </svg>
  );
}

function StampGlyph({ styleId, color }: { styleId: StampStyleId; color: string }) {
  switch (styleId) {
    case "star":
      return <IconStar color={color} />;
    case "heart":
      return <IconHeart color={color} />;
    case "coffee":
      return <IconCoffee color={color} />;
    case "leaf":
      return <IconLeaf color={color} />;
    case "flower":
      return <IconFlower color={color} />;
    case "check":
      return <IconCheck color={color} />;
    case "sun":
      return <IconSun color={color} />;
    case "seal":
    default:
      return <IconSeal color={color} />;
  }
}

export function StampMark({
  filled,
  accent,
  styleId,
  animateIn = false,
  index = 0,
  size = "md",
  highlight = false,
}: {
  filled: boolean;
  accent: string;
  styleId: StampStyleId;
  animateIn?: boolean;
  index?: number;
  size?: "sm" | "md" | "lg";
  /** Quiet visual cue for 5th / 10th slots (no labels). */
  highlight?: boolean;
}) {
  const dim = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-[2.65rem] w-[2.65rem]" : "h-12 w-12";

  return (
    <div className={`relative ${dim} shrink-0`} aria-hidden>
      <motion.div
        className={`absolute inset-0 flex items-center justify-center rounded-full ${
          animateIn && filled ? "stamp-mark-press" : ""
        }`}
        style={{
          background: filled
            ? `radial-gradient(circle at 32% 28%, color-mix(in srgb, ${accent} 72%, white), ${accent} 62%, color-mix(in srgb, ${accent} 75%, #0b1220))`
            : highlight
              ? `color-mix(in srgb, ${accent} 6%, transparent)`
              : "transparent",
          boxShadow: filled
            ? `0 8px 16px -8px color-mix(in srgb, ${accent} 60%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.4)`
            : highlight
              ? `inset 0 0 0 1.5px color-mix(in srgb, ${accent} 40%, #94a3b8)`
              : "none",
          border: filled
            ? "none"
            : highlight
              ? "none"
              : `1.5px solid color-mix(in srgb, ${accent} 22%, #c4cdd6)`,
          transformOrigin: "center center",
        }}
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: index * 0.015 }}
      >
        {filled ? (
          <StampGlyph styleId={styleId} color="#fff" />
        ) : (
          <span
            className="block h-[34%] w-[34%] rounded-full"
            style={{
              background: highlight
                ? `color-mix(in srgb, ${accent} 28%, transparent)`
                : "rgb(20 24 31 / 0.06)",
            }}
          />
        )}
        {filled ? (
          <span
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 28% 22%, rgb(255 255 255 / 0.45), transparent 52%)",
            }}
          />
        ) : null}
      </motion.div>
    </div>
  );
}
