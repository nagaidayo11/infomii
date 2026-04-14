/**
 * Time helpers for menu_time_band (guest display in IANA timezone).
 */

export function parseHHmmToMinutes(hhmm: string): number {
  const m = hhmm.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return 0;
  const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
  const min = Math.min(59, Math.max(0, parseInt(m[2], 10)));
  return h * 60 + min;
}

/** Current local time in `timeZone` as minutes from midnight [0, 1439]. */
export function getNowMinutesInTimezone(date: Date, timeZone: string): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(date);
    const h = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
    const min = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
    return h * 60 + min;
  } catch {
    return date.getHours() * 60 + date.getMinutes();
  }
}

/** Inclusive start, exclusive end on same calendar day (no overnight). */
export function isMinutesInSlot(cur: number, start: number, end: number): boolean {
  if (start <= end) return cur >= start && cur < end;
  return cur >= start || cur < end;
}
