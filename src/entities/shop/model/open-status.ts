import dayjs from "dayjs";

export type OpenStatus =
  | { kind: "open"; until: string }
  | { kind: "break"; until: string }
  | { kind: "closed"; opensAt?: string }
  | { kind: "dayoff" }
  | { kind: "unknown" };

/* 구분자는 하이픈 외에 en/em dash·물결도 허용 — 시트 수기 입력 관대화 */
const RANGE = /^(\d{1,2}):(\d{2})\s*[-–—~]\s*(\d{1,2}):(\d{2})$/;
const DAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

type Range = {
  start: number;
  end: number;
  endLabel: string;
  startLabel: string;
};

function parseRanges(text: string | null): Range[] | null {
  if (!text) return null;
  const ranges: Range[] = [];
  for (const part of text.split(",").map((p) => p.trim())) {
    const m = RANGE.exec(part);
    if (!m) return null;
    const start = Number(m[1]) * 60 + Number(m[2]);
    let end = Number(m[3]) * 60 + Number(m[4]);
    if (end <= start) end += 24 * 60;
    ranges.push({
      start,
      end,
      startLabel: `${m[1].padStart(2, "0")}:${m[2]}`,
      endLabel: `${m[3].padStart(2, "0")}:${m[4]}`,
    });
  }
  return ranges.length > 0 ? ranges : null;
}

function within(ranges: Range[], minutes: number): Range | null {
  for (const r of ranges) {
    if (minutes >= r.start && minutes < r.end) return r;
    /* 자정 넘김 구간은 익일 새벽 시각도 포함 */
    if (r.end > 24 * 60 && minutes + 24 * 60 < r.end) return r;
  }
  return null;
}

export function isParsableHours(text: string | null): boolean {
  return parseRanges(text) !== null;
}

export function openStatus(
  hours: string | null,
  breakTime: string | null,
  closedDays: string | null,
  now: Date,
): OpenStatus {
  const ranges = parseRanges(hours);
  if (!ranges) return { kind: "unknown" };

  /* "일"·"일요일" 병용, 구분자 쉼표·가운뎃점 — "마지막주 월요일" 등 격주 휴무는 판정 제외 */
  const day = DAY_KO[dayjs(now).day()];
  const isDayoff = closedDays
    ?.split(/[,·]/)
    .some((d) => d.trim() === day || d.trim() === `${day}요일`);
  if (isDayoff) return { kind: "dayoff" };

  const minutes = dayjs(now).hour() * 60 + dayjs(now).minute();
  const current = within(ranges, minutes);
  if (!current) {
    const next = ranges.find((r) => r.start > minutes);
    return { kind: "closed", ...(next && { opensAt: next.startLabel }) };
  }

  const breaks = parseRanges(breakTime);
  const inBreak = breaks ? within(breaks, minutes) : null;
  if (inBreak) return { kind: "break", until: inBreak.endLabel };

  return { kind: "open", until: current.endLabel };
}

export function openStatusLabel(status: OpenStatus): string | null {
  switch (status.kind) {
    case "open":
      return `영업중 · ${status.until}까지`;
    case "break":
      return `브레이크 · ${status.until}부터`;
    case "closed":
      return status.opensAt
        ? `영업 종료 · ${status.opensAt} 오픈`
        : "영업 종료";
    case "dayoff":
      return "오늘 휴무";
    case "unknown":
      return null;
  }
}
