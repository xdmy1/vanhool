/** Tiny CSV utility — no deps. Handles quoting and commas/newlines inside fields. */

export function toCsv(rows: Array<Record<string, unknown>>, headers?: string[]): string {
  if (rows.length === 0 && !headers) return "";
  const cols = headers ?? Object.keys(rows[0] ?? {});
  const escape = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    const s = String(val);
    if (s.includes(",") || s.includes("\"") || s.includes("\n") || s.includes("\r")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const head = cols.join(",");
  const body = rows
    .map((r) => cols.map((c) => escape(r[c])).join(","))
    .join("\n");
  return `${head}\n${body}\n`;
}
