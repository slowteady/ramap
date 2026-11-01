export type AreaPicks = {
  checkedAt: string;
  areas: Record<string, string[]>;
  michelinBibGourmand: Record<string, number>;
};

export const EMPTY_AREA_PICKS: AreaPicks = {
  checkedAt: "",
  areas: {},
  michelinBibGourmand: {},
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toAreas(value: unknown): Record<string, string[]> {
  if (!isRecord(value)) return {};
  const areas: Record<string, string[]> = {};
  for (const [area, ids] of Object.entries(value)) {
    if (!Array.isArray(ids)) continue;
    areas[area] = ids.filter((id): id is string => typeof id === "string");
  }
  return areas;
}

function toYears(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};
  const years: Record<string, number> = {};
  for (const [id, year] of Object.entries(value)) {
    if (typeof year === "number") years[id] = year;
  }
  return years;
}

export function toAreaPicks(raw: unknown): AreaPicks {
  if (!isRecord(raw)) return EMPTY_AREA_PICKS;
  return {
    checkedAt: typeof raw.checkedAt === "string" ? raw.checkedAt : "",
    areas: toAreas(raw.areas),
    michelinBibGourmand: toYears(raw.michelinBibGourmand),
  };
}
