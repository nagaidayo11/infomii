import type { HotelAuditLog } from "@/lib/storage";

function csvCell(v: string): string {
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function buildAuditLogCsvContent(logs: HotelAuditLog[]): string {
  const lines: string[] = [];
  lines.push(["日時", "操作", "メッセージ", "対象種別", "対象ID"].map(csvCell).join(","));
  for (const log of logs) {
    lines.push(
      [log.createdAt, log.action, log.message, log.targetType ?? "", log.targetId ?? ""]
        .map((v) => csvCell(String(v)))
        .join(",")
    );
  }
  return "\uFEFF" + lines.join("\r\n");
}

export function triggerAuditLogCsvDownload(logs: HotelAuditLog[], filenamePrefix = "infomii-audit-log"): void {
  const csv = buildAuditLogCsvContent(logs);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  a.href = url;
  a.download = `${filenamePrefix}-${stamp}.csv`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
