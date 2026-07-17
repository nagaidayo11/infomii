"use client";

import {
  atmosphereWashCss,
  type PageAtmosphereId,
} from "@/lib/page-atmosphere";

type PageAtmosphereDecorProps = {
  atmosphere: PageAtmosphereId;
  className?: string;
  /** Slightly stronger wash for App chrome screens */
  density?: "guest" | "chrome";
};

/**
 * Calm SVG watermark for page / app backgrounds.
 * Pointer-events none; keep opacity low so content stays primary.
 */
export function PageAtmosphereDecor({
  atmosphere,
  className = "",
  density = "guest",
}: PageAtmosphereDecorProps) {
  if (atmosphere === "none") return null;

  const opacity = density === "chrome" ? 0.22 : 0.16;
  const wash = atmosphereWashCss(atmosphere);
  const washOpacity = density === "chrome" ? 0.5 : 0.38;

  return (
    <div
      className={"pointer-events-none absolute inset-0 z-0 overflow-hidden " + className}
      aria-hidden
      data-page-atmosphere={atmosphere}
    >
      {wash ? (
        <div
          className="absolute inset-0"
          style={{ background: wash, opacity: washOpacity }}
        />
      ) : null}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 390 844"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity }}
      >
        {atmosphere === "diary" ? <DiaryMotif /> : null}
        {atmosphere === "ocean" ? <OceanMotif /> : null}
        {atmosphere === "travel" ? <TravelMotif /> : null}
        {atmosphere === "outing" ? <OutingMotif /> : null}
      </svg>
    </div>
  );
}

function DiaryMotif() {
  return (
    <g fill="none" stroke="#b8a890" strokeWidth="1">
      {Array.from({ length: 18 }, (_, i) => {
        const y = 120 + i * 36;
        return <path key={y} d={`M48 ${y} H342`} opacity={0.35 + (i % 3) * 0.05} />;
      })}
      <path d="M72 80 V760" opacity="0.28" stroke="#c4a484" />
      <circle cx="72" cy="108" r="4.5" fill="#d4b896" stroke="none" opacity="0.45" />
      <circle cx="72" cy="148" r="4.5" fill="#d4b896" stroke="none" opacity="0.35" />
      <path
        d="M280 64c18 8 28 28 22 46-8 22-34 28-48 14"
        opacity="0.28"
        stroke="#c4a484"
        strokeLinecap="round"
      />
    </g>
  );
}

function OceanMotif() {
  return (
    <g fill="none" stroke="#7aa8b4" strokeWidth="1.4" strokeLinecap="round">
      <path d="M-20 620 C60 590, 120 650, 200 620 S340 590, 420 630" opacity="0.45" />
      <path d="M-20 660 C80 630, 140 690, 220 655 S360 630, 420 670" opacity="0.35" />
      <path d="M-20 700 C70 675, 150 720, 240 690 S350 680, 420 710" opacity="0.28" />
      <path d="M40 180 C90 160, 130 200, 180 175" opacity="0.22" />
      <path d="M220 140 C270 120, 310 165, 360 145" opacity="0.18" />
      <circle cx="310" cy="120" r="28" stroke="#9bc0c8" opacity="0.2" />
      <circle cx="310" cy="120" r="16" stroke="#9bc0c8" opacity="0.16" />
    </g>
  );
}

function TravelMotif() {
  return (
    <g fill="none" stroke="#8fa08a" strokeWidth="1.25" strokeLinecap="round">
      <path
        d="M48 720 C90 640, 130 600, 170 520 S240 380, 280 300 S340 180, 360 110"
        opacity="0.32"
        strokeDasharray="3 7"
      />
      <circle cx="170" cy="520" r="5" fill="#a3b39c" stroke="none" opacity="0.4" />
      <circle cx="280" cy="300" r="5" fill="#a3b39c" stroke="none" opacity="0.35" />
      <circle cx="360" cy="110" r="6" fill="#a3b39c" stroke="none" opacity="0.4" />
      <path d="M60 160 C110 140, 150 190, 200 165 S280 150, 320 175" opacity="0.18" />
      <path d="M40 240 H140 M40 255 H110" opacity="0.14" />
      <rect x="48" y="200" width="52" height="36" rx="4" opacity="0.14" />
    </g>
  );
}

function OutingMotif() {
  return (
    <g fill="none" stroke="#c4b18a" strokeWidth="1.25" strokeLinecap="round">
      <circle cx="320" cy="120" r="36" stroke="#d4c29a" opacity="0.28" />
      <circle cx="320" cy="120" r="18" stroke="#d4c29a" opacity="0.2" />
      <path d="M30 700 C120 660, 180 720, 260 680 S360 650, 420 690" opacity="0.32" />
      <path d="M80 740 C140 710, 200 760, 280 730" opacity="0.22" />
      <path d="M70 420 C95 390, 115 390, 140 420" opacity="0.2" />
      <path d="M105 420 V470" opacity="0.18" />
      <path d="M240 380 C265 350, 285 350, 310 380" opacity="0.16" />
      <path d="M275 380 V425" opacity="0.14" />
    </g>
  );
}
