import { isRamenCandidate, type LocalDataRow } from "./localdata";

export type DiffResult = { opened: LocalDataRow[]; closed: LocalDataRow[] };

const key = (r: LocalDataRow) => `${r.name}|${r.roadAddress}`;

export function diffLocalData(prev: LocalDataRow[], next: LocalDataRow[]): DiffResult {
  const prevMap = new Map(prev.map((r) => [key(r), r]));
  const opened: LocalDataRow[] = [];
  const closed: LocalDataRow[] = [];

  for (const row of next) {
    const before = prevMap.get(key(row));
    if (!before) {
      if (isRamenCandidate(row)) opened.push(row);
      continue;
    }
    const wasCandidate = isRamenCandidate(before) || isRamenCandidate({ ...before, status: "open" });
    if (before.status === "open" && row.status === "closed" && wasCandidate) closed.push(row);
  }
  return { opened, closed };
}
