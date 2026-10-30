export function areaMapHref(
  area: string,
  filter: Record<string, string> = {},
): string {
  return `/?${new URLSearchParams({ ...filter, area }).toString()}`;
}
