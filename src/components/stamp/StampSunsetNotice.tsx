import { STAMP_SUNSET_BODY, STAMP_SUNSET_TITLE } from "@/lib/stamp/sunset";

type StampSunsetNoticeProps = {
  compact?: boolean;
  className?: string;
};

export function StampSunsetNotice({ compact = false, className = "" }: StampSunsetNoticeProps) {
  if (compact) {
    return (
      <div
        role="status"
        className={
          "rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-left " + className
        }
      >
        <p className="text-[11px] font-semibold text-amber-950">{STAMP_SUNSET_TITLE}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-amber-900/80">{STAMP_SUNSET_BODY}</p>
      </div>
    );
  }

  return (
    <div
      role="status"
      className={"border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-amber-950 " + className}
    >
      <p className="mx-auto max-w-6xl text-sm font-semibold">{STAMP_SUNSET_TITLE}</p>
      <p className="mx-auto mt-0.5 max-w-6xl text-[12px] leading-snug text-amber-900/85">
        {STAMP_SUNSET_BODY}
      </p>
    </div>
  );
}
