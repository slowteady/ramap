import type { Enrichment } from "./enrich";

/* 태깅확신도 — 조사로 장르 축(국물·형태)이 실제로 채워진 매장만 확정.
   업종 분류·상호 키워드로만 걸러진 매장은 추정으로 남는다.
   검증상태(운영자확인)는 운영자가 실제 검수했을 때만 올라간다 — 여기서 손대지 않는다. */
const VERDICT_MARKS = ["라멘집 아님", "실존 미확인"];

export function confidenceLabelOf(
  matchCount: number,
  e: Enrichment,
): "확정" | "추정" {
  if (matchCount === 0) return "추정";
  if ((e.soupDetail ?? []).some((d) => VERDICT_MARKS.includes(d)))
    return "추정";
  const hasSoup = (e.soups ?? []).length > 0 && Boolean(e.primarySoup);
  const hasForm = (e.forms ?? []).length > 0;
  return hasSoup && hasForm ? "확정" : "추정";
}
