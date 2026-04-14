import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BYTES = 512_000;

function isAllowedRemoteUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== "https:") return false;
  const h = u.hostname.toLowerCase();
  if (h === "localhost" || h === "0.0.0.0") return false;
  if (h.startsWith("127.") || h.startsWith("10.") || h.startsWith("192.168.")) return false;
  if (h.endsWith(".local")) return false;
  return true;
}

/** Minimal RFC4180-ish CSV parser for menu rows. */
function parseCsvRows(text: string, delimiter: string): string[][] {
  const delim = delimiter.length > 0 ? delimiter[0] : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let i = 0;
  let inQuotes = false;
  while (i < text.length) {
    const c = text[i]!;
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === delim) {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\n") {
      row.push(field);
      field = "";
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      i++;
      continue;
    }
    if (c === "\r") {
      i++;
      continue;
    }
    field += c;
    i++;
  }
  row.push(field);
  if (row.some((cell) => cell.length > 0)) rows.push(row);
  return rows;
}

export async function POST(req: Request) {
  let body: { url?: string; delimiter?: string };
  try {
    body = (await req.json()) as { url?: string; delimiter?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const url = typeof body.url === "string" ? body.url.trim() : "";
  const delimiter = typeof body.delimiter === "string" && body.delimiter.length > 0 ? body.delimiter : ",";
  if (!url || !isAllowedRemoteUrl(url)) {
    return NextResponse.json({ ok: false, error: "invalid_url" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      next: { revalidate: 120 },
      headers: { Accept: "text/csv,text/plain,*/*" },
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: "fetch_failed", status: res.status }, { status: 502 });
    }
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) {
      return NextResponse.json({ ok: false, error: "too_large" }, { status: 413 });
    }
    const text = new TextDecoder("utf-8").decode(buf);
    const rows = parseCsvRows(text, delimiter);
    return NextResponse.json({ ok: true, rows });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "fetch_error" },
      { status: 502 }
    );
  }
}
