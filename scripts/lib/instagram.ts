export function normalizeHandle(value: string): string {
  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?instagram\.com\//i, "")
    .replace(/[?#].*$/, "")
    .replace(/^@/, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}
