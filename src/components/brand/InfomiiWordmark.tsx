type InfomiiWordmarkProps = {
  className?: string;
  /** Light chrome (nav, login). Dark photo/hero uses a brighter green so “ii” still reads. */
  tone?: "onLight" | "onDark";
};

const II_CLASS = {
  onLight: "text-ds-accent",
  onDark:
    "bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-400 bg-clip-text text-transparent",
} as const;

/**
 * Product wordmark: Infom + green “ii”.
 * Use for logos/headers, not for body copy.
 */
export function InfomiiWordmark({ className, tone = "onLight" }: InfomiiWordmarkProps) {
  return (
    <span className={className}>
      Infom
      <span className={II_CLASS[tone]}>ii</span>
    </span>
  );
}
