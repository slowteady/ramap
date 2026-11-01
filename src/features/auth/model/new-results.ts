import dayjs from "dayjs";

export function hasNewResult(
  resolvedTimes: (string | null)[],
  seenAt: string | null,
): boolean {
  return resolvedTimes.some(
    (time) => time !== null && (seenAt === null || dayjs(time).isAfter(seenAt)),
  );
}
