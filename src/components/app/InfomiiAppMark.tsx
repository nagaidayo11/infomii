type InfomiiAppMarkProps = {
  className?: string;
};

/** App-identical glossy mark used in dashboard chrome. */
export function InfomiiAppMark({ className = "h-8 w-8" }: InfomiiAppMarkProps) {
  return (
    <img
      src="/app-icon-mark.png"
      alt=""
      width={32}
      height={32}
      className={`shrink-0 object-contain ${className}`}
      draggable={false}
    />
  );
}
