const WEEK = ["월", "화", "수", "목", "금", "토", "일"] as const;
type Weekday = (typeof WEEK)[number];

const DAY =
  "(?<![0-9가-힣])[월화수목금토일](?:요일|(?=휴무|정기|[월화수목금토일]|[^가-힣]|$))";
const DAY_LIST = `${DAY}(?:\\s*[,·/및]?\\s*${DAY.replace("(?<![0-9가-힣])", "")})*`;
const BEFORE = new RegExp(
  `(?:매주\\s*)?(${DAY_LIST})\\s*(?:정기\\s*)?휴무`,
  "g",
);
const AFTER = new RegExp(
  `(?:정기\\s*)?휴무(?:일)?\\s*[:：]?\\s*(?:매주\\s*)?(${DAY_LIST})`,
  "g",
);
const NONE = /연중무휴|휴무\s*없|무휴/;
const NOT_REGULAR =
  /임시|추석|설날|설 연휴|명절|연휴|\d+\s*일|이번|다음|오늘|내일|당일|번째|째\s*주|첫째|둘째|셋째|넷째|다섯째|격주|매달|매월|마지막/;
const PLACE_CARD = /도로명 주소|구\(지번\)|이용 영업|장소 전체보기/;

function daysOf(list: string): Weekday[] {
  const found = new Set(
    [...list.matchAll(/([월화수목금토일])(?:요일)?/g)].map((m) => m[1]),
  );
  return WEEK.filter((d) => found.has(d));
}

export function extractClosedDays(text: string): Weekday[] | null {
  if (PLACE_CARD.test(text)) return null;
  for (const re of [BEFORE, AFTER]) {
    re.lastIndex = 0;
    for (const m of text.matchAll(re)) {
      const around = text.slice(Math.max(0, (m.index ?? 0) - 16), m.index);
      if (NOT_REGULAR.test(around) || NOT_REGULAR.test(m[0])) continue;
      const days = daysOf(m[1]);
      if (days.length > 0) return days;
    }
  }
  if (NONE.test(text)) return [];
  return null;
}

export type ClosedDaysEvidence = { days: Weekday[]; date: string | null };

function label(days: Weekday[]): string {
  return days.length === 0
    ? "연중무휴"
    : WEEK.filter((d) => days.includes(d))
        .map((d) => `${d}요일`)
        .join(", ");
}

export function decideClosedDays(
  evidence: ClosedDaysEvidence[],
): string | null {
  if (evidence.length === 0) return null;
  const votes = new Map<string, number>();
  for (const e of evidence)
    votes.set(label(e.days), (votes.get(label(e.days)) ?? 0) + 1);
  const ranked = [...votes.entries()].sort((a, b) => b[1] - a[1]);
  const [only, best] = ranked[0];
  const rest = evidence.length - best;
  return best >= 2 && best >= rest * 3 ? only : null;
}
