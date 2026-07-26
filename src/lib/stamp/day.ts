/** Facility business-day helpers for once-per-day stamp limits (reset at 04:00 local). */

export const STAMP_DAY_RESET_HOUR = 4;
export const DEFAULT_STAMP_TIMEZONE = "Asia/Tokyo";

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function normalizeStampTimezone(raw: string | null | undefined): string {
  const tz = (raw ?? "").trim() || DEFAULT_STAMP_TIMEZONE;
  try {
    Intl.DateTimeFormat("en-US", { timeZone: tz }).format(new Date());
    return tz;
  } catch {
    return DEFAULT_STAMP_TIMEZONE;
  }
}

export function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const tz = normalizeStampTimezone(timeZone);
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(date);
    const pick = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((p) => p.type === type)?.value ?? "0");
    return {
      year: pick("year"),
      month: pick("month"),
      day: pick("day"),
      hour: pick("hour"),
      minute: pick("minute"),
      second: pick("second"),
    };
  } catch {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
    };
  }
}

/** Business day key YYYY-MM-DD: before resetHour counts as previous calendar day. */
export function getStampBusinessDayKey(
  now: Date,
  timeZone: string,
  resetHour: number = STAMP_DAY_RESET_HOUR,
): string {
  const parts = getZonedParts(now, timeZone);
  let y = parts.year;
  let m = parts.month;
  let d = parts.day;
  if (parts.hour < resetHour) {
    const utc = new Date(Date.UTC(y, m - 1, d));
    utc.setUTCDate(utc.getUTCDate() - 1);
    y = utc.getUTCFullYear();
    m = utc.getUTCMonth() + 1;
    d = utc.getUTCDate();
  }
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

/** Convert a civil datetime in `timeZone` to a UTC Date (iterative offset fix). */
export function zonedCivilToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const tz = normalizeStampTimezone(timeZone);
  let utc = Date.UTC(year, month - 1, day, hour, minute, 0);
  for (let i = 0; i < 4; i += 1) {
    const parts = getZonedParts(new Date(utc), tz);
    const asIfUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    const target = Date.UTC(year, month - 1, day, hour, minute, 0);
    const delta = target - asIfUtc;
    if (delta === 0) break;
    utc += delta;
  }
  return new Date(utc);
}

/** Start of the next business day (= upcoming reset boundary after current business day started). */
export function getNextStampResetAt(
  now: Date,
  timeZone: string,
  resetHour: number = STAMP_DAY_RESET_HOUR,
): Date {
  const dayKey = getStampBusinessDayKey(now, timeZone, resetHour);
  const [y, m, d] = dayKey.split("-").map(Number) as [number, number, number];
  const next = new Date(Date.UTC(y, m - 1, d));
  next.setUTCDate(next.getUTCDate() + 1);
  return zonedCivilToUtc(
    next.getUTCFullYear(),
    next.getUTCMonth() + 1,
    next.getUTCDate(),
    resetHour,
    0,
    timeZone,
  );
}

export const STAMP_TIMEZONE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "Asia/Tokyo", label: "日本（Asia/Tokyo）" },
  { value: "Asia/Seoul", label: "韓国（Asia/Seoul）" },
  { value: "Asia/Shanghai", label: "中国（Asia/Shanghai）" },
  { value: "Asia/Taipei", label: "台湾（Asia/Taipei）" },
  { value: "Asia/Singapore", label: "シンガポール" },
  { value: "Asia/Bangkok", label: "タイ（Asia/Bangkok）" },
  { value: "Pacific/Honolulu", label: "ハワイ（Pacific/Honolulu）" },
  { value: "America/Los_Angeles", label: "米国西海岸" },
  { value: "America/New_York", label: "米国東海岸" },
  { value: "Europe/London", label: "英国（Europe/London）" },
  { value: "Europe/Paris", label: "欧州中部（Europe/Paris）" },
  { value: "Australia/Sydney", label: "シドニー" },
];
